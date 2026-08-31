import { boolean, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";

// Matches the `lead` data model in clinic-lead-desk-v0-product-instructions.md, Section 10.
export const leads = pgTable("leads", {
  leadId: uuid("lead_id").primaryKey().defaultRandom(),
  whatsappPhone: text("whatsapp_phone").notNull(),
  displayName: text("display_name"),
  leadStatus: text("lead_status").notNull().default("new"),
  primaryCategory: text("primary_category"),
  requestedServiceCategory: text("requested_service_category"),
  preferredDateTime: text("preferred_date_time"),
  branch: text("branch"),
  isNewOrExisting: text("is_new_or_existing").notNull().default("unknown"),
  assignedTo: text("assigned_to"),
  escalationReason: text("escalation_reason"),
  lastInboundAt: timestamp("last_inbound_at", { withTimezone: true }),
  lastOutboundAt: timestamp("last_outbound_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  optedOut: boolean("opted_out").notNull().default(false),
});
