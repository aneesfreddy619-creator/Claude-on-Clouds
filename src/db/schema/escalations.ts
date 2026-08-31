import { pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";
import { leads } from "./leads.js";

// Matches the human handoff record described in clinic-lead-desk-v0-product-instructions.md, Section 12.
export const escalations = pgTable("escalations", {
  escalationId: uuid("escalation_id").primaryKey().defaultRandom(),
  leadId: uuid("lead_id")
    .notNull()
    .references(() => leads.leadId),
  whatsappPhone: text("whatsapp_phone").notNull(),
  displayName: text("display_name"),
  lastUserMessage: text("last_user_message").notNull(),
  classification: text("classification"),
  escalationReason: text("escalation_reason").notNull(),
  requiredAction: text("required_action").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});
