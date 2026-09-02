// Minimal, defensive shape of a Meta WhatsApp Cloud API webhook payload.
// Real payloads vary (message events vs. status events) and may include
// fields we don't model here — every field below is optional on purpose,
// so parsing never throws on an unexpected or partial shape.
export interface WhatsAppWebhookPayload {
  object?: string;
  entry?: Array<{
    id?: string;
    changes?: Array<{
      field?: string;
      value?: {
        metadata?: { phone_number_id?: string };
        // Meta includes a sender profile alongside messages[] on the same
        // change event — this is the only place a display name appears in
        // the webhook payload.
        contacts?: Array<{ wa_id?: string; profile?: { name?: string } }>;
        messages?: Array<{
          id?: string;
          from?: string;
          timestamp?: string;
          type?: string;
          text?: { body?: string };
        }>;
        statuses?: Array<{ id?: string; status?: string }>;
      };
    }>;
  }>;
}

export interface InboundMessage {
  id?: string;
  from?: string;
  type?: string;
  text?: string;
  timestamp?: string;
  displayName?: string;
}

export interface ExtractedInboundSummary {
  entryCount: number;
  messages: InboundMessage[];
  messageIds: string[];
  senders: string[];
  messageTypes: string[];
  statusUpdateIds: string[];
}

export function extractInboundSummary(payload: WhatsAppWebhookPayload): ExtractedInboundSummary {
  const messages: InboundMessage[] = [];
  const messageIds: string[] = [];
  const senders: string[] = [];
  const messageTypes: string[] = [];
  const statusUpdateIds: string[] = [];

  for (const entry of payload.entry ?? []) {
    for (const change of entry.changes ?? []) {
      const nameByWaId = new Map<string, string>();
      for (const contact of change.value?.contacts ?? []) {
        if (contact.wa_id && contact.profile?.name) nameByWaId.set(contact.wa_id, contact.profile.name);
      }

      // Only actual inbound messages carry a message ID we need to dedupe.
      // Status-event payloads (delivered/read/etc.) are logged but never
      // fed into the dedupe check.
      for (const message of change.value?.messages ?? []) {
        messages.push({
          id: message.id,
          from: message.from,
          type: message.type,
          text: message.text?.body,
          timestamp: message.timestamp,
          displayName: message.from ? nameByWaId.get(message.from) : undefined,
        });
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
    messages,
    messageIds,
    senders,
    messageTypes,
    statusUpdateIds,
  };
}
