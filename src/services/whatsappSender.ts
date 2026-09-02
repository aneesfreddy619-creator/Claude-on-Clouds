import { env } from "../config/env.js";
import { logger } from "../lib/logger.js";

// Meta WhatsApp Cloud API test-number path (Section 13/14). Not a secret,
// so it's a plain constant rather than an env var.
const GRAPH_API_VERSION = "v20.0";

export interface SendResult {
  success: boolean;
  whatsappMessageId?: string;
  error?: string;
}

// Sends an already-selected, already-approved text reply through the Meta
// WhatsApp Cloud API. This never composes, edits, or falls back to any
// other text — it only sends exactly what the caller passes in (the
// approved reply text from src/rules/approvedReplies.ts). All failure
// modes (missing credentials, a non-2xx response, a network error) are
// caught and logged here rather than thrown, so a WhatsApp outage never
// crashes the webhook handler.
export async function sendWhatsAppTextReply(to: string, text: string): Promise<SendResult> {
  if (!env.whatsapp.accessToken || !env.whatsapp.phoneNumberId) {
    logger.error("whatsapp_send_misconfigured", {
      to,
      reason: "WHATSAPP_ACCESS_TOKEN or WHATSAPP_PHONE_NUMBER_ID is not set",
    });
    return { success: false, error: "missing_credentials" };
  }

  const url = `https://graph.facebook.com/${GRAPH_API_VERSION}/${env.whatsapp.phoneNumberId}/messages`;

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${env.whatsapp.accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        messaging_product: "whatsapp",
        to,
        type: "text",
        text: { body: text },
      }),
    });

    const payload: unknown = await response.json().catch(() => null);

    if (!response.ok) {
      logger.error("whatsapp_send_failed", { to, status: response.status, responseBody: payload });
      return { success: false, error: `http_${response.status}` };
    }

    const whatsappMessageId =
      typeof payload === "object" && payload !== null && "messages" in payload
        ? ((payload as { messages?: Array<{ id?: string }> }).messages?.[0]?.id ?? undefined)
        : undefined;

    logger.info("whatsapp_send_succeeded", { to, whatsappMessageId });
    return { success: true, whatsappMessageId };
  } catch (error) {
    logger.error("whatsapp_send_failed", {
      to,
      error: error instanceof Error ? error.message : String(error),
    });
    return { success: false, error: "network_error" };
  }
}
