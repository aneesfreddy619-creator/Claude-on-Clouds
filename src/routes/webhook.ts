import { randomUUID } from "node:crypto";
import type { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import { env } from "../config/env.js";
import { logger } from "../lib/logger.js";
import { verifyWebhookSignature } from "../security/webhookSignature.js";
import { checkDedupeStatus, type DedupeResult } from "../services/dedupe.js";
import {
  createEscalation,
  findOrCreateAndUpdateLead,
  parseMessageTimestamp,
  persistInboundMessage,
  persistOutboundMessage,
  recordOptOut,
  updateLeadLastOutboundAt,
} from "../services/persistence.js";
import { sendWhatsAppTextReply } from "../services/whatsappSender.js";
import { extractInboundSummary, type ExtractedInboundSummary, type WhatsAppWebhookPayload } from "../whatsapp/inboundPayload.js";
import { classifyMessage } from "../rules/classifier.js";
import { selectApprovedReply } from "../rules/approvedReplies.js";
import { isStopMessage } from "../rules/stopDetection.js";
import { extractAppointmentDetails } from "../rules/appointmentDetailExtraction.js";

interface WebhookVerifyQuery {
  "hub.mode"?: string;
  "hub.verify_token"?: string;
  "hub.challenge"?: string;
}

export async function webhookRoutes(app: FastifyInstance): Promise<void> {
  // Capture the raw request bytes for signature verification. Fastify's
  // default JSON parser discards the raw buffer once it parses the body, so
  // this override keeps both: request.rawBody for HMAC verification (see
  // src/security/webhookSignature.ts), and the parsed object for
  // everything else. Registered on this plugin's encapsulated instance, so
  // it only applies to routes registered here.
  app.addContentTypeParser("application/json", { parseAs: "buffer" }, (request, body, done) => {
    const buffer = body as Buffer;
    request.rawBody = buffer;

    if (buffer.length === 0) {
      done(null, {});
      return;
    }

    try {
      done(null, JSON.parse(buffer.toString("utf8")));
    } catch (error) {
      done(error as Error, undefined);
    }
  });

  // Meta WhatsApp Cloud API webhook verification challenge.
  // See clinic-lead-desk-v0-product-instructions.md, Section 13/14.
  app.get("/webhook", async (request: FastifyRequest<{ Querystring: WebhookVerifyQuery }>, reply: FastifyReply) => {
    const mode = request.query["hub.mode"];
    const token = request.query["hub.verify_token"];
    const challenge = request.query["hub.challenge"];

    if (mode === "subscribe" && token === env.whatsapp.verifyToken) {
      return reply.status(200).send(challenge);
    }

    return reply.status(403).send("Verification failed");
  });

  // Inbound WhatsApp events.
  app.post("/webhook", async (request: FastifyRequest, reply: FastifyReply) => {
    if (!verifyWebhookSignature(request)) {
      logger.warn("webhook_post_rejected_invalid_signature");
      return reply.status(401).send({ error: "invalid signature" });
    }

    // Inbound parsing: safely extract a summary for logging and dedupe
    // only. This does not persist or act on anything yet.
    let summary: ExtractedInboundSummary | null = null;
    try {
      summary = extractInboundSummary(request.body as WhatsAppWebhookPayload);
    } catch (error) {
      logger.warn("webhook_post_parse_failed", {
        error: error instanceof Error ? error.message : String(error),
        body: request.body,
      });
    }

    logger.info("webhook_post_received", {
      entryCount: summary?.entryCount ?? 0,
      messageIds: summary?.messageIds ?? [],
      senders: summary?.senders ?? [],
      messageTypes: summary?.messageTypes ?? [],
      statusUpdateIds: summary?.statusUpdateIds ?? [],
      body: request.body,
    });

    // Duplicate protection: only actual inbound messages carry a message ID
    // (status-event payloads never populate messageIds, so they're safely
    // skipped here without special-casing). See DedupeResult in
    // src/services/dedupe.ts for why "dedupe_unavailable" must be treated
    // the same as "duplicate" downstream.
    const dedupeResults = new Map<string, DedupeResult>();
    for (const messageId of summary?.messageIds ?? []) {
      dedupeResults.set(messageId, await checkDedupeStatus(messageId));
    }

    // Classification + approved reply selection (Section 6 categories,
    // Section 19 "rules first"; see src/rules/classifier.ts and
    // src/rules/approvedReplies.ts), then lead find-or-create and inbound
    // message persistence (Section 10/11; see src/services/persistence.ts).
    // All of this only runs for "not_duplicate" text messages —
    // "duplicate" and "dedupe_unavailable" messages are explicitly skipped
    // and logged, never processed further.
    for (const message of summary?.messages ?? []) {
      if (!message.id) continue;

      const dedupeResult = dedupeResults.get(message.id);
      if (dedupeResult !== "not_duplicate") {
        logger.info("webhook_classification_skipped", { messageId: message.id, reason: dedupeResult ?? "no_dedupe_result" });
        continue;
      }

      if (message.type !== "text" || !message.text) {
        logger.info("webhook_classification_skipped", { messageId: message.id, reason: "non_text_message" });
        continue;
      }

      // STOP opt-out (v0-operational-clarifications.md Section 2): checked
      // before classification, since a STOP message must never be
      // classified, never get an approved reply selected, never be sent a
      // reply, and never create an escalation. Handled entirely in its own
      // branch and then this message is done.
      if (isStopMessage(message.text)) {
        if (!message.from) {
          logger.warn("webhook_stop_skipped", { messageId: message.id, reason: "missing_sender_phone" });
          continue;
        }

        const stopInboundAt = parseMessageTimestamp(message.timestamp);
        const optOutLeadId = await recordOptOut({
          whatsappPhone: message.from,
          displayName: message.displayName,
          inboundAt: stopInboundAt,
        });

        if (!optOutLeadId) {
          logger.warn("webhook_stop_message_persistence_skipped", { messageId: message.id, reason: "opt_out_persistence_failed" });
          continue;
        }

        await persistInboundMessage({
          messageId: message.id,
          leadId: optOutLeadId,
          text: message.text,
          classification: null,
          receivedAt: stopInboundAt,
        });

        logger.info("webhook_stop_processed", { messageId: message.id, leadId: optOutLeadId });
        continue;
      }

      const classification = classifyMessage(message.text);
      const approvedReply = selectApprovedReply(classification);

      logger.info("webhook_classification_result", {
        messageId: message.id,
        category: classification.category,
        escalationReason: classification.escalationReason,
        matchedRule: classification.matchedRule,
        languageHint: classification.languageHint,
        requiredAction: approvedReply.requiredAction,
        replyText: approvedReply.text,
      });

      if (!message.from) {
        logger.warn("webhook_lead_persistence_skipped", { messageId: message.id, reason: "missing_sender_phone" });
        continue;
      }

      const inboundAt = parseMessageTimestamp(message.timestamp);

      // Conservative appointment-detail extraction (rule-based, no LLM):
      // only attempted for appointment_request messages — see
      // src/rules/appointmentDetailExtraction.ts. findOrCreateAndUpdateLead
      // further gates these on the lead not already being opted out.
      const appointmentDetails =
        classification.category === "appointment_request" ? extractAppointmentDetails(message.text) : null;

      const lead = await findOrCreateAndUpdateLead({
        whatsappPhone: message.from,
        displayName: message.displayName,
        category: classification.category,
        escalationReason: classification.escalationReason,
        inboundAt,
        extractedDisplayName: appointmentDetails?.displayName ?? undefined,
        extractedRequestedServiceCategory: appointmentDetails?.requestedServiceCategory ?? undefined,
        extractedPreferredDateTime: appointmentDetails?.preferredDateTime ?? undefined,
      });

      if (!lead) {
        // Lead persistence failed (e.g. no reachable database) — do not
        // persist the message either, since message_log.lead_id is a
        // required foreign key (src/db/schema/messageLog.ts) and we must
        // not invent or guess a lead reference.
        logger.warn("webhook_message_persistence_skipped", { messageId: message.id, reason: "lead_persistence_failed" });
        continue;
      }

      await persistInboundMessage({
        messageId: message.id,
        leadId: lead.leadId,
        text: message.text,
        classification: classification.category,
        receivedAt: inboundAt,
      });

      // Escalation record: one row per human_escalation classification
      // (Section 12 human handoff), created BEFORE reply sending so the
      // handoff record exists even if outbound sending fails or is
      // skipped (e.g. opted_out) below. Only reached here because this
      // message already passed the "not_duplicate" dedupe gate above, so
      // a redelivered WhatsApp message can never create a second row (see
      // createEscalation's comment in src/services/persistence.ts).
      if (classification.category === "human_escalation" && classification.escalationReason) {
        await createEscalation({
          leadId: lead.leadId,
          lastUserMessage: message.text,
          classification: classification.category,
          escalationReason: classification.escalationReason,
          requiredAction: approvedReply.requiredAction,
        });
      }

      // Outbound reply sending: only reached after signature verification,
      // dedupe, classification, approved-reply selection, lead/inbound
      // message persistence, and (for human_escalation) escalation-row
      // creation have all already happened above.
      if (lead.optedOut) {
        logger.info("webhook_reply_skipped", { messageId: message.id, leadId: lead.leadId, reason: "opted_out" });
        continue;
      }

      const sendResult = await sendWhatsAppTextReply(message.from, approvedReply.text);
      const sentAt = new Date();
      const outboundMessageId = sendResult.whatsappMessageId ?? `local-failed-${randomUUID()}`;

      await persistOutboundMessage({
        messageId: outboundMessageId,
        leadId: lead.leadId,
        text: approvedReply.text,
        classification,
        sentAt,
        status: sendResult.success ? "sent" : "failed",
      });

      if (sendResult.success) {
        await updateLeadLastOutboundAt(lead.leadId, sentAt);
      }
    }

    // TODO (admin inspection wiring): src/routes/admin.ts is still a
    // placeholder — once leads/message_log have real rows (as of this
    // step), wire it to list/filter leads, message history, and
    // escalations, per Section 13 "Simple admin page or API endpoint".


    return reply.status(200).send({ received: true });
  });
}
