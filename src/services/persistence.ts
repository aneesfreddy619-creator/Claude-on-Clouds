import { and, eq } from "drizzle-orm";
import { logger } from "../lib/logger.js";
import { db } from "../db/client.js";
import { leads } from "../db/schema/leads.js";
import { messageLog } from "../db/schema/messageLog.js";
import { escalations } from "../db/schema/escalations.js";
import type { ClassificationResult, EnquiryCategory } from "../rules/classifier.js";

// Converts a Meta message timestamp (unix seconds, as a string) to a Date.
// Falls back to "now" if missing or unparseable, so persistence never fails
// on a malformed/absent timestamp.
export function parseMessageTimestamp(timestamp: string | undefined): Date {
  if (!timestamp) return new Date();
  const seconds = Number(timestamp);
  if (!Number.isFinite(seconds)) return new Date();
  return new Date(seconds * 1000);
}

// Section 10 lead_status enum: "new | acknowledged | information_captured |
// qualified | staff_assigned | appointment_requested | human_escalation |
// closed". V0 only ever moves a lead through a small, safe subset of that
// enum automatically — anything further along (qualified, staff_assigned)
// is assumed to be set by a human/admin action later and is never
// downgraded by an inbound message.
export function computeLeadStatus(currentStatus: string, category: EnquiryCategory): string {
  // Safety first (Section 11 workflow spec): human escalation always wins,
  // regardless of the lead's current status.
  if (category === "human_escalation") return "human_escalation";

  // Never let automation silently reopen a closed lead or override an
  // active escalation that hasn't been resolved by staff yet.
  if (currentStatus === "closed" || currentStatus === "human_escalation") return currentStatus;

  if (category === "appointment_request") return "appointment_requested";

  // hours_location / service_information / published_pricing /
  // existing_appointment: acknowledge the inbound message on first
  // contact, but don't downgrade a status a human may have already
  // advanced (qualified, staff_assigned, appointment_requested).
  if (currentStatus === "new") return "acknowledged";
  return currentStatus;
}

export interface LeadPersistenceInput {
  whatsappPhone: string;
  displayName?: string;
  category: EnquiryCategory;
  escalationReason: string | null;
  inboundAt: Date;
  // Conservative, rule-based appointment-detail extraction (only ever
  // populated by the caller for category === "appointment_request" —
  // see src/rules/appointmentDetailExtraction.ts). Never overwrites an
  // existing value with null/absent, and never applied to an
  // already-opted-out lead (checked against the row's current opted_out
  // state below, not the caller's).
  extractedDisplayName?: string;
  extractedRequestedServiceCategory?: string;
  extractedPreferredDateTime?: string;
}

export interface LeadPersistenceResult {
  leadId: string;
  optedOut: boolean;
  // The lead's status AFTER this message was applied. Already computed by
  // computeLeadStatus above in both branches, so returning it costs no
  // extra query. The pre-send validator needs it to detect a lead left in
  // human_escalation with no open escalation row.
  leadStatus: string;
}

// Finds the lead by whatsapp_phone, or creates one, then updates only the
// fields this build step is responsible for (Section 10 model). This never
// stores photographs, medical reports, prescriptions, detailed health
// history, or payment data — only the administrative fields listed below.
// Returns the lead's current opted_out state alongside its id, so callers
// (e.g. the outbound-reply step) can respect an existing opt-out without a
// second lookup — this function does not itself set or clear opted_out.
export async function findOrCreateAndUpdateLead(input: LeadPersistenceInput): Promise<LeadPersistenceResult | null> {
  try {
    const existing = await db.select().from(leads).where(eq(leads.whatsappPhone, input.whatsappPhone)).limit(1);

    if (existing.length === 0) {
      // A brand-new lead cannot already be opted out, so the WhatsApp
      // contact profile name and the extracted-from-text fallback are
      // both safe to apply here (profile name still takes priority).
      const effectiveDisplayName = input.displayName ?? input.extractedDisplayName;
      const initialStatus = computeLeadStatus("new", input.category);
      const inserted = await db
        .insert(leads)
        .values({
          whatsappPhone: input.whatsappPhone,
          displayName: effectiveDisplayName ?? null,
          leadStatus: initialStatus,
          primaryCategory: input.category,
          escalationReason: input.category === "human_escalation" ? input.escalationReason : null,
          lastInboundAt: input.inboundAt,
          // A brand-new lead cannot already be opted out, so extracted
          // appointment details are always safe to apply here.
          requestedServiceCategory: input.extractedRequestedServiceCategory ?? null,
          preferredDateTime: input.extractedPreferredDateTime ?? null,
        })
        .returning({ leadId: leads.leadId, optedOut: leads.optedOut });

      logger.info("webhook_lead_created", { leadId: inserted[0].leadId, leadStatus: initialStatus, category: input.category });
      return { leadId: inserted[0].leadId, optedOut: inserted[0].optedOut, leadStatus: initialStatus };
    }

    const lead = existing[0];
    const nextStatus = computeLeadStatus(lead.leadStatus, input.category);

    const updateValues: Partial<typeof leads.$inferInsert> = {
      whatsappPhone: input.whatsappPhone,
      primaryCategory: input.category,
      leadStatus: nextStatus,
      lastInboundAt: input.inboundAt,
      updatedAt: new Date(),
    };
    // Only overwrite display_name when this message actually carried a
    // WhatsApp contact profile name — a later message without one must
    // not erase a name we already have on file. This is unchanged,
    // pre-existing behavior, independent of opt-out state.
    if (input.displayName) updateValues.displayName = input.displayName;
    // Only set escalation_reason when this message itself is an escalation
    // — a non-escalation message must not clear a still-open escalation
    // reason from a prior message.
    if (input.category === "human_escalation") updateValues.escalationReason = input.escalationReason;
    // Rule-based extraction from message text (name fallback, service
    // category, preferred date/time): only applied when (a) this message
    // actually produced a value (never overwrite with null/absent, so an
    // earlier-captured value survives a later message that doesn't repeat
    // it) and (b) the lead is not already opted out — checked against the
    // row's existing opted_out state, not the caller's, since extraction
    // must never apply to an opted-out lead's messages. The extracted name
    // is still only a fallback: it never overwrites an already-known
    // display_name (profile-supplied or previously extracted).
    if (!lead.optedOut) {
      if (input.extractedDisplayName && !lead.displayName) updateValues.displayName = updateValues.displayName ?? input.extractedDisplayName;
      if (input.extractedRequestedServiceCategory) updateValues.requestedServiceCategory = input.extractedRequestedServiceCategory;
      if (input.extractedPreferredDateTime) updateValues.preferredDateTime = input.extractedPreferredDateTime;
    }

    await db.update(leads).set(updateValues).where(eq(leads.leadId, lead.leadId));

    logger.info("webhook_lead_updated", { leadId: lead.leadId, leadStatus: nextStatus, category: input.category });
    return { leadId: lead.leadId, optedOut: lead.optedOut, leadStatus: nextStatus };
  } catch (error) {
    logger.error("webhook_lead_persistence_failed", {
      whatsappPhone: input.whatsappPhone,
      error: error instanceof Error ? error.message : String(error),
    });
    return null;
  }
}

export interface OptOutInput {
  whatsappPhone: string;
  displayName?: string;
  inboundAt: Date;
}

// Records a STOP opt-out per clinic-lead-desk-v0-product-instructions.md §23.2:
// finds or creates the lead, sets opted_out = true, and updates
// last_inbound_at/updated_at. Deliberately does NOT touch lead_status,
// primary_category, or escalation_reason — a STOP message is never
// classified, so there is nothing to record for those fields. Only a
// human staff action may clear opted_out — see clearLeadOptOut below,
// reachable only from the protected admin route, never from this pipeline.
export async function recordOptOut(input: OptOutInput): Promise<string | null> {
  try {
    const existing = await db.select({ leadId: leads.leadId }).from(leads).where(eq(leads.whatsappPhone, input.whatsappPhone)).limit(1);

    if (existing.length === 0) {
      const inserted = await db
        .insert(leads)
        .values({
          whatsappPhone: input.whatsappPhone,
          displayName: input.displayName ?? null,
          optedOut: true,
          lastInboundAt: input.inboundAt,
        })
        .returning({ leadId: leads.leadId });

      logger.info("webhook_lead_opted_out", { leadId: inserted[0].leadId, created: true });
      return inserted[0].leadId;
    }

    const leadId = existing[0].leadId;
    await db
      .update(leads)
      .set({ optedOut: true, lastInboundAt: input.inboundAt, updatedAt: new Date() })
      .where(eq(leads.leadId, leadId));

    logger.info("webhook_lead_opted_out", { leadId, created: false });
    return leadId;
  } catch (error) {
    logger.error("webhook_opt_out_persistence_failed", {
      whatsappPhone: input.whatsappPhone,
      error: error instanceof Error ? error.message : String(error),
    });
    return null;
  }
}

// Sets last_outbound_at after a successful send. Called only on send
// success — a failed send should not claim an outbound message went out.
export async function updateLeadLastOutboundAt(leadId: string, sentAt: Date): Promise<void> {
  try {
    await db.update(leads).set({ lastOutboundAt: sentAt, updatedAt: new Date() }).where(eq(leads.leadId, leadId));
  } catch (error) {
    logger.error("webhook_lead_last_outbound_update_failed", {
      leadId,
      error: error instanceof Error ? error.message : String(error),
    });
  }
}

export interface MessagePersistenceInput {
  messageId: string;
  leadId: string;
  text: string;
  // string for a normally classified message; null for a STOP message,
  // which is never classified (clinic-lead-desk-v0-product-instructions.md §23.2).
  classification: string | null;
  receivedAt: Date;
}

// Inserts the inbound message into message_log. Only the message text
// itself is stored (Section 10) — never photographs, prescriptions, lab
// reports, or payment data, none of which this webhook accepts as
// structured fields today.
export async function persistInboundMessage(input: MessagePersistenceInput): Promise<boolean> {
  try {
    await db.insert(messageLog).values({
      messageId: input.messageId,
      leadId: input.leadId,
      direction: "inbound",
      text: input.text,
      receivedOrSentAt: input.receivedAt,
      classification: input.classification,
      automated: true,
      status: "received",
    });
    logger.info("webhook_message_persisted", { messageId: input.messageId, leadId: input.leadId });
    return true;
  } catch (error) {
    logger.error("webhook_message_persistence_failed", {
      messageId: input.messageId,
      leadId: input.leadId,
      error: error instanceof Error ? error.message : String(error),
    });
    return false;
  }
}

export interface OutboundMessagePersistenceInput {
  messageId: string;
  leadId: string;
  text: string;
  classification: ClassificationResult;
  sentAt: Date;
  status: "sent" | "failed";
}

// Inserts the outbound reply attempt into message_log (Section 10), mirroring
// persistInboundMessage but with direction: "outbound". Records both
// successful and failed send attempts, so message_log stays a complete
// audit trail of what was attempted, not just what succeeded.
export async function persistOutboundMessage(input: OutboundMessagePersistenceInput): Promise<boolean> {
  try {
    await db.insert(messageLog).values({
      messageId: input.messageId,
      leadId: input.leadId,
      direction: "outbound",
      text: input.text,
      receivedOrSentAt: input.sentAt,
      classification: input.classification.category,
      automated: true,
      status: input.status,
    });
    logger.info("webhook_outbound_message_persisted", { messageId: input.messageId, leadId: input.leadId, status: input.status });
    return true;
  } catch (error) {
    logger.error("webhook_outbound_message_persistence_failed", {
      messageId: input.messageId,
      leadId: input.leadId,
      error: error instanceof Error ? error.message : String(error),
    });
    return false;
  }
}

export interface EscalationPersistenceInput {
  leadId: string;
  lastUserMessage: string;
  classification: string;
  escalationReason: string;
  requiredAction: string;
}

// Creates one escalation row per Section 12 human handoff. The current
// escalations schema (src/db/schema/escalations.ts) has no
// whatsapp_phone/display_name/message_id columns — phone number and
// display name stay reachable via the required lead_id foreign key rather
// than being duplicated here, and status defaults to "open" at the schema
// level. Duplicate prevention relies on the existing message-level dedupe
// gate in src/routes/webhook.ts: this is only ever called once per
// "not_duplicate" WhatsApp message, so no separate duplicate check is
// needed here.
export async function createEscalation(input: EscalationPersistenceInput): Promise<boolean> {
  try {
    await db.insert(escalations).values({
      leadId: input.leadId,
      lastUserMessage: input.lastUserMessage,
      classification: input.classification,
      escalationReason: input.escalationReason,
      requiredAction: input.requiredAction,
    });
    logger.info("webhook_escalation_created", {
      leadId: input.leadId,
      escalationReason: input.escalationReason,
      requiredAction: input.requiredAction,
    });
    return true;
  } catch (error) {
    logger.error("webhook_escalation_creation_failed", {
      leadId: input.leadId,
      error: error instanceof Error ? error.message : String(error),
    });
    return false;
  }
}

// Deletes a test lead and its full history, per Section 13 "Security
// requirements": "Provide a clear deletion function for a test lead and
// its message history." escalations.lead_id and message_log.lead_id are
// both NOT NULL foreign keys to leads.lead_id with ON DELETE no action
// (drizzle/0000_slimy_bloodstrike.sql), so child rows are deleted first,
// explicitly, inside one transaction — chosen over adding ON DELETE
// CASCADE to the schema, which would silently change delete behavior for
// every future deletion path, not just this one admin action.
export async function deleteLeadAndHistory(leadId: string): Promise<boolean> {
  try {
    await db.transaction(async (tx) => {
      await tx.delete(escalations).where(eq(escalations.leadId, leadId));
      await tx.delete(messageLog).where(eq(messageLog.leadId, leadId));
      await tx.delete(leads).where(eq(leads.leadId, leadId));
    });
    logger.info("admin_lead_deleted", { leadId });
    return true;
  } catch (error) {
    logger.error("admin_lead_deletion_failed", {
      leadId,
      error: error instanceof Error ? error.message : String(error),
    });
    return false;
  }
}

// Tri-state escalation lookup, deliberately NOT a boolean. A failed lookup
// is not the same thing as "no open escalation", and it is not the same
// thing as "an escalation is open" either — we simply do not know. Callers
// must treat "escalation_state_unavailable" as a reason to send nothing:
// not the ordinary reply (we cannot rule out that a human owns the case)
// and not the pending reply either (that text asserts a message is
// awaiting review, which is precisely what could not be established).
//
// Same shape as DedupeResult in src/services/dedupe.ts, so the codebase
// has one way of representing an unknown rather than two.
export type OpenEscalationStatus = "open" | "none" | "escalation_state_unavailable";

// Reports whether this lead has an escalation still marked "open" — the
// human-takeover signal used by the pre-send validator. Called BEFORE the
// current message's own escalation row is created, so it reports state as
// it was when the message arrived, and the message that triggers an
// escalation still receives its own escalation reply.
export async function checkOpenEscalationStatus(leadId: string): Promise<OpenEscalationStatus> {
  try {
    const open = await db
      .select({ escalationId: escalations.escalationId })
      .from(escalations)
      .where(and(eq(escalations.leadId, leadId), eq(escalations.status, "open")))
      .limit(1);

    const result: OpenEscalationStatus = open.length > 0 ? "open" : "none";
    logger.info("open_escalation_check", { leadId, result });
    return result;
  } catch (error) {
    logger.error("open_escalation_check_failed", {
      leadId,
      error: error instanceof Error ? error.message : String(error),
    });
    return "escalation_state_unavailable";
  }
}

export interface ResolveEscalationResult {
  leadId: string | null;
  remainingOpen: number;
  leadReactivated: boolean;
}

// Resolves ONE escalation, then releases the lead only if that was the
// last one open. Staff action only, reachable from the protected admin
// route and nowhere else — no inbound message may resolve an escalation.
//
// Escalation-specific by design: resolving one case must not silently
// close another that is still being worked.
//
// The lead is derived from the escalation row rather than supplied
// separately, so a caller cannot resolve escalation A while reactivating
// lead B. The whole sequence runs in one transaction, and the lead row is
// locked FOR UPDATE first: without that, two staff resolving two
// escalations on the same lead could each see the other still open and
// neither would reactivate, leaving zero open escalations with the lead
// still in human_escalation.
//
// The final update is conditional on the lead still being in
// human_escalation, which makes this idempotent and preserves any status a
// member of staff has deliberately set since (staff_assigned, qualified,
// closed).
export async function resolveEscalation(escalationId: string): Promise<ResolveEscalationResult> {
  try {
    return await db.transaction(async (tx) => {
      const target = await tx
        .select({ leadId: escalations.leadId, status: escalations.status })
        .from(escalations)
        .where(eq(escalations.escalationId, escalationId))
        .limit(1);

      if (target.length === 0) {
        logger.warn("admin_escalation_resolve_no_match", { escalationId });
        return { leadId: null, remainingOpen: 0, leadReactivated: false };
      }

      const leadId = target[0].leadId;

      // Serialise concurrent resolves on this lead.
      await tx.select({ leadId: leads.leadId }).from(leads).where(eq(leads.leadId, leadId)).for("update");

      if (target[0].status === "open") {
        await tx
          .update(escalations)
          .set({ status: "resolved", updatedAt: new Date() })
          .where(and(eq(escalations.escalationId, escalationId), eq(escalations.status, "open")));
      }

      const stillOpen = await tx
        .select({ escalationId: escalations.escalationId })
        .from(escalations)
        .where(and(eq(escalations.leadId, leadId), eq(escalations.status, "open")));

      let leadReactivated = false;
      if (stillOpen.length === 0) {
        const reactivated = await tx
          .update(leads)
          .set({ leadStatus: "acknowledged", updatedAt: new Date() })
          .where(and(eq(leads.leadId, leadId), eq(leads.leadStatus, "human_escalation")))
          .returning({ leadId: leads.leadId });
        leadReactivated = reactivated.length > 0;
      }

      logger.info("admin_escalation_resolved", {
        escalationId,
        leadId,
        remainingOpen: stillOpen.length,
        leadReactivated,
      });

      return { leadId, remainingOpen: stillOpen.length, leadReactivated };
    });
  } catch (error) {
    logger.error("admin_escalation_resolve_failed", {
      escalationId,
      error: error instanceof Error ? error.message : String(error),
    });
    return { leadId: null, remainingOpen: 0, leadReactivated: false };
  }
}

// Clears opted_out on one lead, so a test number that sent STOP can be
// used again. Deliberately a *staff action only*: it is called from the
// admin route and from nowhere else. Nothing in the message pipeline may
// call it — an opt-out is only ever reversed by a person acting on a
// request, never by an inbound message. See
// clinic-lead-desk-v0-product-instructions.md §23.2.
//
// Only opted_out and updated_at change. Lead status, escalations, and
// message history are all left exactly as they are: opting back in is
// not a reset of the case.
export async function clearLeadOptOut(leadId: string): Promise<boolean> {
  try {
    const updated = await db
      .update(leads)
      .set({ optedOut: false, updatedAt: new Date() })
      .where(eq(leads.leadId, leadId))
      .returning({ leadId: leads.leadId });

    if (updated.length === 0) {
      logger.warn("admin_lead_opt_out_clear_no_match", { leadId });
      return false;
    }

    logger.info("admin_lead_opt_out_cleared", { leadId });
    return true;
  } catch (error) {
    logger.error("admin_lead_opt_out_clear_failed", {
      leadId,
      error: error instanceof Error ? error.message : String(error),
    });
    return false;
  }
}
