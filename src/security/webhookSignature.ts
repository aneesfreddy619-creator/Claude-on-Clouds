import { createHmac, timingSafeEqual } from "node:crypto";
import type { FastifyRequest } from "fastify";
import { env } from "../config/env.js";
import { logger } from "../lib/logger.js";

// Populated by the raw-body content-type parser registered in
// src/routes/webhook.ts (Fastify's default JSON parser discards the raw
// buffer once it parses the body, so that parser keeps both: this field
// for HMAC verification, and the parsed object for everything else).
declare module "fastify" {
  interface FastifyRequest {
    rawBody?: Buffer;
  }
}

// Verifies the Meta webhook signature per Section 13 "Security requirements".
// Meta signs the raw request bytes with the app secret and sends the result
// as `X-Hub-Signature-256: sha256=<hex digest>`. We recompute the same HMAC
// over request.rawBody and compare it to the header using a constant-time
// comparison, so timing differences can't leak information about the
// expected signature.
export function verifyWebhookSignature(request: FastifyRequest): boolean {
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
