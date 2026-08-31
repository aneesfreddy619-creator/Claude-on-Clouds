import { boolean, doublePrecision, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";
import { leads } from "./leads.js";

// Matches the `message_log` data model in clinic-lead-desk-v0-product-instructions.md, Section 10.
export const messageLog = pgTable("message_log", {
  messageId: text("message_id").primaryKey(),
  leadId: uuid("lead_id")
    .notNull()
    .references(() => leads.leadId),
  direction: text("direction").notNull(),
  text: text("text").notNull(),
  receivedOrSentAt: timestamp("received_or_sent_at", { withTimezone: true }).notNull(),
  classification: text("classification"),
  confidence: doublePrecision("confidence"),
  automated: boolean("automated").notNull().default(true),
  status: text("status").notNull(),
});
