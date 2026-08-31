import type { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import { env } from "../config/env.js";
import { logger } from "../lib/logger.js";

interface WebhookVerifyQuery {
  "hub.mode"?: string;
  "hub.verify_token"?: string;
  "hub.challenge"?: string;
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

  // Inbound WhatsApp events. Placeholder only — returns 200 without processing.
  app.post("/webhook", async (request: FastifyRequest, reply: FastifyReply) => {
    // TODO: verify the Meta webhook signature (X-Hub-Signature-256) using WHATSAPP_APP_SECRET
    // before trusting request.body, per Section 13 "Security requirements".

    // TODO: deduplicate this event by WhatsApp message ID before any processing,
    // per Section 11 workflow spec and the acceptance test for duplicate webhook delivery.

    // TODO: classify the inbound message using rule-based classification first
    // (Section 6 categories, Section 19 operating principle: rules first).

    // TODO: generate a reply using only approved fixed replies from Section 8/9 —
    // never invent facts, prices, or clinic policy.

    // TODO: route sensitive/urgent/unclear messages to the human escalation flow
    // (Section 7 hard safety rules, Section 12 human handoff) instead of an automated reply.

    logger.info("webhook_post_received", { body: request.body });

    return reply.status(200).send({ received: true });
  });
}
