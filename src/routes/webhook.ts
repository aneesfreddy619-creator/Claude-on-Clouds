import type { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import { env } from "../config/env.js";
import { logger } from "../lib/logger.js";

interface WebhookVerifyQuery {
  "hub.mode"?: string;
  "hub.verify_token"?: string;
  "hub.challenge"?: string;
}

// Minimal, defensive shape of a Meta WhatsApp Cloud API webhook payload.
// Real payloads vary (message events vs. status events) and may include
// fields we don't model here — every field below is optional on purpose,
// so parsing never throws on an unexpected or partial shape.
interface WhatsAppWebhookPayload {
  object?: string;
  entry?: Array<{
    id?: string;
    changes?: Array<{
      field?: string;
      value?: {
        metadata?: { phone_number_id?: string };
        messages?: Array<{ id?: string; from?: string; timestamp?: string; type?: string }>;
        statuses?: Array<{ id?: string; status?: string }>;
      };
    }>;
  }>;
}

interface ExtractedInboundSummary {
  entryCount: number;
  messageIds: string[];
  senders: string[];
  messageTypes: string[];
  statusUpdateIds: string[];
}

function extractInboundSummary(payload: WhatsAppWebhookPayload): ExtractedInboundSummary {
  const messageIds: string[] = [];
  const senders: string[] = [];
  const messageTypes: string[] = [];
  const statusUpdateIds: string[] = [];

  for (const entry of payload.entry ?? []) {
    for (const change of entry.changes ?? []) {
      for (const message of change.value?.messages ?? []) {
        if (message.id) messageIds.push(message.id);
        if (message.from) senders.push(message.from);
        if (message.type) messageTypes.push(message.type);
      }
      for (const status of change.value?.statuses ?? []) {
        if (status.id) statusUpdateIds.push(status.id);
      }
    }
  }

  return {
    entryCount: payload.entry?.length ?? 0,
    messageIds,
    senders,
    messageTypes,
    statusUpdateIds,
  };
}

// TODO (signature verification): verify the Meta webhook signature before
// trusting request.body, per Section 13 "Security requirements". Real
// implementation needs the raw request body (Fastify's default JSON parser
// discards it), so this will require an `addContentTypeParser` override to
// capture the raw bytes, then compute HMAC-SHA256 over them using
// env.whatsapp.appSecret and compare against the `X-Hub-Signature-256`
// header (constant-time compare). This is currently a no-op hook point —
// no request is ever rejected here yet.
function verifyWebhookSignature(request: FastifyRequest): boolean {
  const signatureHeader = request.headers["x-hub-signature-256"];
  logger.info("webhook_signature_verification_skipped", {
    signatureHeaderPresent: Boolean(signatureHeader),
  });
  return true;
}

// TODO (duplicate protection): before any persistence/classification work
// happens, check whether this WhatsApp message ID already exists in
// message_log (message_id is the table's primary key — see
// src/db/schema/messageLog.ts). If it does, skip processing and do not send
// a second reply, per Section 11 workflow spec and the "same webhook
// delivered twice" acceptance test in Section 15. Currently always returns
// false — no DB lookup is wired up yet.
function isDuplicateMessageId(messageId: string): boolean {
  logger.info("webhook_dedupe_check_skipped", { messageId });
  return false;
}

export async function webhookRoutes(app: FastifyInstance): Promise<void> {
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
    // TODO (signature verification): reject the request here once real
    // verification is implemented (see verifyWebhookSignature above).
    verifyWebhookSignature(request);

    // Inbound parsing: safely extract a summary for logging only. This does
    // not persist or act on anything yet.
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

    // TODO (dedupe): for each extracted message ID, call
    // isDuplicateMessageId and skip further processing for any ID that is
    // already logged. Currently only logs the (always-false) check result.
    for (const messageId of summary?.messageIds ?? []) {
      isDuplicateMessageId(messageId);
    }

    // TODO (lead persistence): find or create a lead record by sender phone
    // number (leads.whatsapp_phone), per Section 11 workflow spec and
    // src/db/schema/leads.ts.

    // TODO (message persistence): insert the inbound message into
    // message_log (src/db/schema/messageLog.ts), keyed by the WhatsApp
    // message ID, before generating any reply.

    // TODO (classification): classify the inbound message using rule-based
    // classification first (Section 6 categories, Section 19 operating
    // principle: rules first).

    // TODO (reply sending): generate and send a reply using only approved
    // fixed replies from Section 8/9, or route to human escalation per
    // Section 7/12 — never invent facts, prices, or clinic policy, and
    // never send more than once per inbound message.

    return reply.status(200).send({ received: true });
  });
}
