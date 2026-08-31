import type { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import { env } from "../config/env.js";
import { logger } from "../lib/logger.js";
import { verifyWebhookSignature } from "../security/webhookSignature.js";
import { checkDedupeStatus, type DedupeResult } from "../services/dedupe.js";
import { findOrCreateAndUpdateLead, parseMessageTimestamp, persistInboundMessage } from "../services/persistence.js";
import { extractInboundSummary, type ExtractedInboundSummary, type WhatsAppWebhookPayload } from "../whatsapp/inboundPayload.js";
import { classifyMessage } from "../rules/classifier.js";
import { selectApprovedReply } from "../rules/approvedReplies.js";

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

      const leadId = await findOrCreateAndUpdateLead({
        whatsappPhone: message.from,
        displayName: message.displayName,
        category: classification.category,
        escalationReason: classification.escalationReason,
        inboundAt,
      });

      if (!leadId) {
        // Lead persistence failed (e.g. no reachable database) — do not
        // persist the message either, since message_log.lead_id is a
        // required foreign key (src/db/schema/messageLog.ts) and we must
        // not invent or guess a lead reference.
        logger.warn("webhook_message_persistence_skipped", { messageId: message.id, reason: "lead_persistence_failed" });
        continue;
      }

      await persistInboundMessage({
        messageId: message.id,
        leadId,
        text: message.text,
        classification,
        receivedAt: inboundAt,
      });
    }

    // TODO (reply sending): actually call the WhatsApp Cloud API send
    // endpoint with the approved reply text computed above — not
    // implemented here, this step only classifies, persists, and logs what
    // the reply would be. Must NOT run for "duplicate" (already replied) or
    // "dedupe_unavailable" (can't prove we haven't already replied) —
    // only "not_duplicate" is safe to act on, and never more than once per
    // inbound message.

    // TODO (escalation flow): for classification.category ===
    // "human_escalation" (Section 6/7), create an escalations row
    // (src/db/schema/escalations.ts) using classification.escalationReason
    // and the approved reply's requiredAction, and stop automated
    // conversational handling, per Section 12. Same "not_duplicate" gate
    // applies before creating an escalation.

    // TODO (admin inspection wiring): src/routes/admin.ts is still a
    // placeholder — once leads/message_log have real rows (as of this
    // step), wire it to list/filter leads, message history, and
    // escalations, per Section 13 "Simple admin page or API endpoint".

    // TODO (appointment detail collection flow): for
    // category === "appointment_request", Section 9's reply already asks
    // for name/service/preferred time in one message, but nothing yet
    // parses a follow-up reply to fill leads.requested_service_category /
    // preferred_date_time — that's a later, explicit build step, not
    // implied by persisting the current inbound message alone.

    return reply.status(200).send({ received: true });
  });
}
