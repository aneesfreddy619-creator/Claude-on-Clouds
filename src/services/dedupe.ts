import { eq } from "drizzle-orm";
import { logger } from "../lib/logger.js";
import { db } from "../db/client.js";
import { messageLog } from "../db/schema/messageLog.js";

// Tri-state dedupe result. A failed lookup is NOT the same thing as "not a
// duplicate" — we simply don't know. Callers must treat "dedupe_unavailable"
// as a reason to stop, exactly like "duplicate", since proceeding without a
// working dedupe check risks a second reply for the same inbound message
// (the one thing Section 15's "same webhook delivered twice" acceptance
// test forbids). Only "not_duplicate" is a green light to continue.
export type DedupeResult = "duplicate" | "not_duplicate" | "dedupe_unavailable";

// Duplicate protection per Section 11 workflow spec and the "same webhook
// delivered twice" acceptance test in Section 15: message_log.message_id is
// the table's primary key (src/db/schema/messageLog.ts), so a matching row
// means this WhatsApp message was already seen. This only ever reads —
// nothing is inserted here (message persistence lives in
// src/services/persistence.ts).
export async function checkDedupeStatus(messageId: string): Promise<DedupeResult> {
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
