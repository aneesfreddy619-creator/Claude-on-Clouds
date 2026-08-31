import { createHmac, timingSafeEqual } from "node:crypto";
import type { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import { eq } from "drizzle-orm";
import { env } from "../config/env.js";
import { logger } from "../lib/logger.js";
import { db } from "../db/client.js";
import { messageLog } from "../db/schema/messageLog.js";

declare module "fastify" {
  interface FastifyRequest {
    rawBody?: Buffer;
  }
}

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
      // Only actual inbound messages carry a message ID we need to dedupe.
      // Status-event payloads (delivered/read/etc.) are logged but never
      // fed into the dedupe check.
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

// Verifies the Meta webhook signature per Section 13 "Security requirements".
// Meta signs the raw request bytes with the app secret and sends the result
// as `X-Hub-Signature-256: sha256=<hex digest>`. We recompute the same HMAC
// over request.rawBody (captured by the content-type parser registered
// below) and compare it to the header using a constant-time comparison, so
// timing differences can't leak information about the expected signature.
function verifyWebhookSignature(request: FastifyRequest): boolean {
  const signatureHeader = request.headers["x-hub-signature-256"];

  if (typeof signatureHeader !== "string" || !signatureHeader.startsWith("sha256=")) {
    logger.warn("webhook_signature_missing_or_malformed", {
      signatureHeaderPresent: Boolean(signatureHeader),
    });
    return false;
  }

  if (!env.whatsapp.appSecret) {
    logger.error("webhook_signature_verification_misconfigured", {
      reason: "WHATSAPP_APP_SECRET is not set",
    });
    return false;
  }

  const rawBody = request.rawBody ?? Buffer.alloc(0);
  const expectedHex = createHmac("sha256", env.whatsapp.appSecret).update(rawBody).digest("hex");
  const expectedBuffer = Buffer.from(expectedHex, "utf8");
  const providedBuffer = Buffer.from(signatureHeader.slice("sha256=".length), "utf8");

  if (expectedBuffer.length !== providedBuffer.length) {
    logger.warn("webhook_signature_verification_failed", { reason: "length_mismatch" });
    return false;
  }

  const isValid = timingSafeEqual(expectedBuffer, providedBuffer);
  if (!isValid) {
    logger.warn("webhook_signature_verification_failed", { reason: "digest_mismatch" });
  }

  return isValid;
}

// Tri-state dedupe result. A failed lookup is NOT the same thing as "not a
// duplicate" — we simply don't know. Downstream steps (lead persistence,
// message persistence, classification, reply sending — see the TODOs
// below) must treat "dedupe_unavailable" as a reason to stop, exactly like
// "duplicate", since proceeding without a working dedupe check risks a
// second reply for the same inbound message (the one thing Section 15's
// "same webhook delivered twice" acceptance test forbids). Only
// "not_duplicate" is a green light to continue.
type DedupeResult = "duplicate" | "not_duplicate" | "dedupe_unavailable";

// Duplicate protection per Section 11 workflow spec and the "same webhook
// delivered twice" acceptance test in Section 15: message_log.message_id is
// the table's primary key (src/db/schema/messageLog.ts), so a matching row
// means this WhatsApp message was already seen. This only ever reads —
// nothing is inserted here yet (message persistence is a later step).
async function checkDedupeStatus(messageId: string): Promise<DedupeResult> {
  try {
    const existing = await db
      .select({ messageId: messageLog.messageId })
      .from(messageLog)
      .where(eq(messageLog.messageId, messageId))
      .limit(1);

    const result: DedupeResult = existing.length > 0 ? "duplicate" : "not_duplicate";
    logger.info("webhook_dedupe_check", { messageId, result });
    return result;
  } catch (error) {
    logger.error("webhook_dedupe_check_failed", {
      messageId,
      result: "dedupe_unavailable" satisfies DedupeResult,
      error: error instanceof Error ? error.message : String(error),
    });
    return "dedupe_unavailable";
  }
}

export async function webhookRoutes(app: FastifyInstance): Promise<void> {
  // Capture the raw request bytes for signature verification. Fastify's
  // default JSON parser discards the raw buffer once it parses the body, so
  // this override keeps both: request.rawBody for HMAC verification, and
  // the parsed object for everything else. Registered on this plugin's
  // encapsulated instance, so it only applies to routes registered here.
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
    // skipped here without special-casing). Currently this only checks and
    // logs each message's tri-state dedupe result — nothing downstream
    // branches on it yet, since lead/message persistence and replies aren't
    // implemented in this step. See DedupeResult above and the TODOs below
    // for the required behavior once they are.
    const dedupeResults = new Map<string, DedupeResult>();
    for (const messageId of summary?.messageIds ?? []) {
      dedupeResults.set(messageId, await checkDedupeStatus(messageId));
    }

    // TODO (lead persistence): find or create a lead record by sender phone
    // number (leads.whatsapp_phone), per Section 11 workflow spec and
    // src/db/schema/leads.ts. Must only run for a message ID whose
    // dedupeResults entry is "not_duplicate" — skip it for "duplicate" AND
    // for "dedupe_unavailable" (an unavailable dedupe check is not
    // permission to proceed).

    // TODO (message persistence): insert the inbound message into
    // message_log (src/db/schema/messageLog.ts), keyed by the WhatsApp
    // message ID, before generating any reply. Same rule as above: only for
    // "not_duplicate" message IDs. Once rows exist here, "duplicate" will
    // naturally follow from the SELECT in checkDedupeStatus.

    // TODO (classification): classify the inbound message using rule-based
    // classification first (Section 6 categories, Section 19 operating
    // principle: rules first). Only for "not_duplicate" message IDs.

    // TODO (reply sending): generate and send a reply using only approved
    // fixed replies from Section 8/9, or route to human escalation per
    // Section 7/12 — never invent facts, prices, or clinic policy, and
    // never send more than once per inbound message. Must NOT run for
    // "duplicate" (already replied) or "dedupe_unavailable" (can't prove we
    // haven't already replied) — only "not_duplicate" is safe to act on.

    // TODO (escalation flow): for human-escalation triggers (Section 6/7),
    // create an escalations row (src/db/schema/escalations.ts) and stop
    // automated conversational handling, per Section 12. Same
    // "not_duplicate" gate applies before creating an escalation.

    return reply.status(200).send({ received: true });
  });
}
