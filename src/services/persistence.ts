import { eq } from "drizzle-orm";
import { logger } from "../lib/logger.js";
import { db } from "../db/client.js";
import { leads } from "../db/schema/leads.js";
import { messageLog } from "../db/schema/messageLog.js";
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
}

export interface LeadPersistenceResult {
  leadId: string;
  optedOut: boolean;
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
      const initialStatus = computeLeadStatus("new", input.category);
      const inserted = await db
        .insert(leads)
        .values({
          whatsappPhone: input.whatsappPhone,
          displayName: input.displayName ?? null,
          leadStatus: initialStatus,
          primaryCategory: input.category,
          escalationReason: input.category === "human_escalation" ? input.escalationReason : null,
          lastInboundAt: input.inboundAt,
        })
        .returning({ leadId: leads.leadId, optedOut: leads.optedOut });

      logger.info("webhook_lead_created", { leadId: inserted[0].leadId, leadStatus: initialStatus, category: input.category });
      return { leadId: inserted[0].leadId, optedOut: inserted[0].optedOut };
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
    // Only overwrite display_name when this message actually carried one —
    // a later message without a profile name must not erase a name we
    // already have on file.
    if (input.displayName) updateValues.displayName = input.displayName;
    // Only set escalation_reason when this message itself is an escalation
    // — a non-escalation message must not clear a still-open escalation
    // reason from a prior message.
    if (input.category === "human_escalation") updateValues.escalationReason = input.escalationReason;

    await db.update(leads).set(updateValues).where(eq(leads.leadId, lead.leadId));

    logger.info("webhook_lead_updated", { leadId: lead.leadId, leadStatus: nextStatus, category: input.category });
    return { leadId: lead.leadId, optedOut: lead.optedOut };
  } catch (error) {
    logger.error("webhook_lead_persistence_failed", {
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
  classification: ClassificationResult;
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
      classification: input.classification.category,
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
