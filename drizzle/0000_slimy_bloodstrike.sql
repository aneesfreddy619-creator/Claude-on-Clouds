CREATE TABLE "escalations" (
	"escalation_id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"lead_id" uuid NOT NULL,
	"last_user_message" text NOT NULL,
	"classification" text,
	"escalation_reason" text NOT NULL,
	"required_action" text NOT NULL,
	"status" text DEFAULT 'open' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "leads" (
	"lead_id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"whatsapp_phone" text NOT NULL,
	"display_name" text,
	"lead_status" text DEFAULT 'new' NOT NULL,
	"primary_category" text,
	"requested_service_category" text,
	"preferred_date_time" text,
	"branch" text,
	"is_new_or_existing" text DEFAULT 'unknown' NOT NULL,
	"assigned_to" text,
	"escalation_reason" text,
	"last_inbound_at" timestamp with time zone,
	"last_outbound_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"opted_out" boolean DEFAULT false NOT NULL
);
--> statement-breakpoint
CREATE TABLE "message_log" (
	"message_id" text PRIMARY KEY NOT NULL,
	"lead_id" uuid NOT NULL,
	"direction" text NOT NULL,
	"text" text NOT NULL,
	"received_or_sent_at" timestamp with time zone NOT NULL,
	"classification" text,
	"confidence" double precision,
	"automated" boolean DEFAULT true NOT NULL,
	"status" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "escalations" ADD CONSTRAINT "escalations_lead_id_leads_lead_id_fk" FOREIGN KEY ("lead_id") REFERENCES "public"."leads"("lead_id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "message_log" ADD CONSTRAINT "message_log_lead_id_leads_lead_id_fk" FOREIGN KEY ("lead_id") REFERENCES "public"."leads"("lead_id") ON DELETE no action ON UPDATE no action;