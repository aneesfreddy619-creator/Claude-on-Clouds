# Clinic Lead Desk — V0 Product Instructions

## 1. Project

**Project name:** Clinic Lead Desk

**Purpose:** Build a safe WhatsApp front-desk test system for a fictional Delhi-NCR aesthetic dermatology / premium wellness clinic.

This V0 system must:
- Capture inbound WhatsApp enquiries.
- Create or update a lead record.
- Reply only with approved administrative information.
- Collect missing booking details when appropriate.
- Route sensitive, medical, urgent, complaint, refund, privacy, abusive, or unclear cases to a human.
- Log messages, classifications, statuses, timestamps, and escalation reasons.

**This is a test shell, not a production medical assistant.** It must run on a Meta-provided WhatsApp Cloud API test number and communicate only with approved test recipients in V0.

## 2. Product promise

> Every inbound enquiry is acknowledged, captured as a lead, handled only within approved administrative rules, and either moved toward a consultation request or handed to a human.

## 3. Locked scope for now

Until V0 works end to end on the Meta WhatsApp test number, keep the project locked to this scope.

### In scope now
- Webhook verification and signature verification.
- Inbound WhatsApp message handling.
- Lead creation and updates.
- Rule-based classification.
- Approved fixed replies only.
- Missing-detail collection for appointment requests.
- Human escalation.
- Message and audit logging.
- Simple admin inspection view or API.
- End-to-end V0 acceptance testing.

### Out of scope for now
- Sales decks, presentations, ads, outbound campaigns, and promotional email flows.
- Client-facing marketing copy beyond short project description text.
- Production rollout for real clinics.
- Real patient data.
- Automated calendar booking.
- Payment collection.
- Marketing broadcasts or template-message campaigns.
- Instagram, Facebook, or web-form integrations.
- Multi-client packaging.
- Advanced RAG or knowledge-base ingestion.
- Any feature not required to make the test shell run safely on WhatsApp.

## 4. Current milestone status

Current checkpoint for this workspace:
- Meta developer app, WhatsApp product, test number, and an approved test recipient are all set up and verified.
- Outbound Meta test-template send has been validated.
- Backend is complete, tested, and deployed: webhook verification, signature verification, deduplication, rule-based classification, approved replies, lead/message/escalation persistence, STOP handling, and protected admin inspection.
- All Railway environment variables are entered; `GET /health` and `/admin` work in production.
- The Meta app was **published (Live) on 2026-09-05**, which was the final blocker: Meta does not dispatch production webhook data to unpublished apps, only dashboard test events.
- **Section 17 acceptance tests: 10 of 10 pass.** Nine proven live end-to-end against the Meta test number on 2026-09-05; row 10 (duplicate webhook) proven against a real database in `src/routes/webhook.persistence.test.ts` and not live-triggerable, since Meta will not redeliver a `wamid` on demand.
- **Section 19 Definition of done: satisfied.** A real WhatsApp message produced an approved reply observed in WhatsApp, with Meta status webhooks confirming `sent` then `read`.

**V0 is complete.**

Treat this as the current state unless explicitly updated. Detailed
implementation state, coverage, and diagnosis live in
`v0-implementation-decisions.md`.

## 5. V0 goal

When a test user sends a WhatsApp message, the system should:

1. Receive the incoming message through the WhatsApp Cloud API webhook.
2. Create or update a lead record.
3. Classify the message into one of six supported categories.
4. Reply using only approved information and rules.
5. Ask for missing booking details when appropriate.
6. Create a human-handoff task for sensitive, uncertain, medical, complaint, or urgent messages.
7. Record the message, classification, reply, status, timestamps, and escalation reason.

## 6. Demo clinic configuration

Use a fictional clinic. Do not use real patient or clinic data.

```yaml
clinic:
  name: "NCR Skin & Wellness — Demo"
  city: "Delhi-NCR"
  branches:
    - name: "Gurugram Demo Branch"
      address: "Demo address only — Gurugram"
      hours: "Monday–Saturday, 10:00–19:00"
  languages: ["English", "Hindi-English"]
  consultation_fee: "₹800"
  services:
    - "Acne and pigmentation consultation"
    - "Skin and hair consultation"
    - "Laser hair-reduction consultation"
    - "Chemical-peel consultation"
    - "Wellness consultation"
  booking_policy: "Appointments are requested through WhatsApp and confirmed by clinic staff. The system must never independently confirm a clinical appointment."
  escalation_contact: "demo-reception@example.com"
```

## 7. Supported enquiry categories

Classify every inbound message into exactly one primary category:

1. `appointment_request`
2. `hours_location`
3. `service_information`
4. `published_pricing`
5. `existing_appointment`
6. `human_escalation`

### Human-escalation triggers

Immediately classify as `human_escalation` if the message includes or appears to include:

- Symptoms, diagnosis requests, medical advice requests, medication, side effects, adverse events, emergency concerns, pregnancy-related suitability questions, lab reports, photographs, or treatment suitability.
- Complaint, refund dispute, harassment, privacy/data request, legal threat, abusive language, or serious dissatisfaction.
- A request for a custom quote, a discount, guaranteed outcome, or a treatment recommendation.
- Unclear intent after one allowed clarification question.

## 8. Hard safety rules

The assistant must never:

- Diagnose, prescribe, recommend treatment, comment on medical suitability, interpret photographs or reports, or provide emergency advice.
- Promise results, safety, cure, recovery, or a treatment outcome.
- Confirm a slot, charge a payment, alter an appointment, or issue a refund.
- Invent prices, offers, clinic policies, doctors, availability, services, or addresses.
- Request detailed health information, photographs, prescriptions, test results, or identity documents.
- Send marketing messages, promotions, or post-window follow-ups in V0.
- Continue automated interaction after a user asks to stop or asks for a human.

When in doubt: hand off to a human.

## 9. Approved knowledge

The system may use only the following source of truth in V0:

```yaml
faq:
  hours: "Monday–Saturday, 10:00–19:00"
  location: "Gurugram Demo Branch, Demo address only — Gurugram"
  consultation_fee: "The consultation fee is ₹800. Any treatment plan and final treatment cost are discussed by the clinic team after assessment."
  services: "We offer consultations for acne and pigmentation, skin and hair concerns, laser hair reduction, chemical peels, and wellness services. The clinic team can guide you on the appropriate next step."
  booking: "Please share your name, the service or concern category you want to discuss, and your preferred date/time. The reception team will check availability and confirm your appointment."
  reschedule: "I can pass your request to the reception team. Please share the name used for the booking and your preferred new date/time."
  medical_or_urgent: "I’m unable to provide medical guidance on WhatsApp. I’m notifying the clinic team so they can assist you. If this is an emergency, please contact local emergency services or seek urgent medical care."
  complaint: "I’m sorry to hear that. I’m notifying the clinic team so they can review this and contact you directly."
  human_request: "I’m notifying the reception team. They will assist you as soon as possible during clinic hours."
```

## 10. Conversation behaviour

### Tone
- Polite, short, calm, and professional.
- Use English by default; mirror simple Hindi-English if the user writes that way.
- Never claim to be a doctor.
- Do not mention AI unless asked. If asked, say: "I’m the clinic’s automated front-desk assistant and can help with appointment and administrative requests."

### Reply patterns

**Appointment request**
> Hello! I can help you request a consultation. Please share your name, the service or concern category you want to discuss, and your preferred date/time. The reception team will check availability and confirm it.

**Price query**
> The consultation fee is ₹800. Final treatment plans and costs are discussed by the clinic team after assessment. Would you like to request a consultation?

**Service query**
> We offer consultations for acne and pigmentation, skin and hair concerns, laser hair reduction, chemical peels, and wellness services. For personalised medical guidance, the clinic team will need to assist you. Would you like to request a consultation?

**Location/hours**
> Our Gurugram Demo Branch is open Monday–Saturday, 10:00–19:00. The address is Demo address only — Gurugram. Would you like to request an appointment?

**Medical, urgent, or treatment-suitability request**
> I’m unable to provide medical guidance on WhatsApp. I’m notifying the clinic team so they can assist you. If this is an emergency, please contact local emergency services or seek urgent medical care.

**Complaint**
> I’m sorry to hear that. I’m notifying the clinic team so they can review this and contact you directly.

**Human request**
> I’m notifying the reception team. They will assist you as soon as possible during clinic hours.

## 11. Lead data model

Store only minimum administrative data.

```yaml
lead:
  lead_id: "generated UUID"
  whatsapp_phone: "string"
  display_name: "string or null"
  lead_status: "new | acknowledged | information_captured | qualified | staff_assigned | appointment_requested | human_escalation | closed"
  primary_category: "one supported category"
  requested_service_category: "string or null"
  preferred_date_time: "string or null"
  branch: "string or null"
  is_new_or_existing: "new | existing | unknown"
  assigned_to: "string or null"
  escalation_reason: "string or null"
  last_inbound_at: "ISO timestamp"
  last_outbound_at: "ISO timestamp"
  created_at: "ISO timestamp"
  updated_at: "ISO timestamp"
  opted_out: "boolean"

message_log:
  message_id: "WhatsApp message ID"
  lead_id: "reference"
  direction: "inbound | outbound"
  text: "string"
  received_or_sent_at: "ISO timestamp"
  classification: "string or null"
  confidence: "number or null"
  automated: "boolean"
  status: "received | sent | delivered | read | failed"
```

Do not store photographs, medical reports, detailed health history, prescriptions, or payment data.

## 12. Workflow specification

```text
Incoming WhatsApp message
  -> verify webhook signature
  -> ignore duplicate event by WhatsApp message ID
  -> find or create lead by sender phone number
  -> log inbound message
  -> if opted out: do not send automated reply
  -> classify message using rules only in the current V0 milestone
  -> if human escalation trigger:
       set lead_status = human_escalation
       create staff task/notification
       send approved acknowledgment once
       stop automated conversational handling
  -> else:
       generate reply only from approved FAQ and fixed reply patterns
       if appointment information is missing:
           ask for one or more of: name, desired service category, preferred date/time
       update lead fields from the message when confidently extracted
       set appropriate lead status
       send reply through WhatsApp Cloud API
       log outbound reply
  -> write audit event and errors to logs
```

## 13. Human handoff

V0 handoff must be a row in an `escalations` table first.

The notification or record must include:
- Lead phone number and available display name.
- Last user message.
- Classification and escalation reason.
- Link or reference to the lead record.
- Timestamp.
- Required action: `reply`, `call`, `review complaint`, or `clinical team review`.

## 14. Simple system map

Mental model for the build:

```text
Customer on WhatsApp
        |
        v
Meta WhatsApp Cloud API
        |
        v
Backend Server (Fastify)
        |
        +--> Rule engine
        +--> Leads table
        +--> Message log table
        +--> Escalations table
        +--> Simple protected admin view / API
```

The customer-facing experience is only the WhatsApp chat. The operator-facing experience is the protected admin inspection layer.

## 15. Implementation requirements

### Required components
- Meta WhatsApp Cloud API test number.
- Public HTTPS webhook endpoint.
- `GET /webhook` for Meta verification challenge.
- `POST /webhook` for incoming WhatsApp events.
- Signature verification for incoming webhook events.
- WhatsApp message send function using the Cloud API.
- Database: PostgreSQL / Supabase for the deployable test environment.
- Environment variables for all secrets.
- Structured logs.
- Simple admin page or API endpoint to inspect leads, messages, statuses, and escalations.

### Locked implementation stack for current V0

```yaml
backend: "Node.js + TypeScript + Fastify"
database: "Supabase Postgres"
orm: "Drizzle"
deployment: "Railway"
local_tunnel: "Cloudflare Tunnel or ngrok"
admin_protection: "Basic password protection"
human_handoff: "escalations table first"
model_layer: "None in the current V0 milestone"
workflow_tools: "No n8n, Make, or Pipedream in the current V0 milestone"
whatsapp_path: "Meta WhatsApp Cloud API test number only"
```

### Security requirements
- Never hardcode access tokens, app secrets, API keys, or verify tokens.
- Use `.env` locally and Railway secret storage after deployment.
- Verify Meta webhook signatures before processing events.
- Deduplicate webhook deliveries using WhatsApp message IDs.
- Restrict admin access using a password or basic authentication in V0.
- Keep test data separate from future client data.
- Provide a clear deletion function for a test lead and its message history.

## 16. WhatsApp setup requirements

1. Create a Meta developer app of the appropriate business type.
2. Add the WhatsApp product.
3. Use the Meta-provided test phone number for V0.
4. Add and verify one or more permitted test-recipient WhatsApp numbers.
5. Store the Phone Number ID, test access token, App Secret, and Verify Token securely.
6. Deploy the webhook endpoint to a public HTTPS URL.
7. Configure the callback URL and verify token in Meta.
8. Subscribe to `messages` events; subscribe to message status events if available.
9. Send a test message and confirm incoming messages create lead records and replies.

## 17. Acceptance tests

| Test message | Expected outcome |
|---|---|
| "Hi, I want an appointment on Saturday" | Appointment category; ask for name, service category, preferred time; create or update lead |
| "What is the consultation fee?" | Reply ₹800 only; offer consultation request |
| "Where are you located and what are your timings?" | Reply only from approved location and hours |
| "Do you offer laser hair reduction?" | State that consultation is offered; do not claim suitability or outcomes |
| "Can I use this treatment while pregnant?" | Immediate human escalation; no medical advice |
| "I got redness after treatment" | Immediate human escalation; no diagnosis |
| "I want a refund" | Immediate human escalation; notify staff |
| "Talk to a person" | Human handoff; stop automation |
| "STOP" | Set `opted_out = true`; send no further automated messages |
| Same webhook delivered twice | One stored inbound message; one reply maximum |

## 18. Non-goals for V0

- Real clinic deployment.
- Production patient data.
- Automated calendar booking.
- Instagram, Facebook, or web-form integrations.
- Payment collection.
- Marketing campaigns, broadcasts, or template-message flows.
- Multi-client packaging.
- Advanced RAG or knowledge-base ingestion.
- Analytics beyond a simple lead and escalation dashboard.

## 19. Definition of done

V0 is complete when a test user can message the Meta-provided WhatsApp test number and reliably observe:

1. An approved administrative response.
2. A lead record in the admin view or database.
3. A message audit trail.
4. Correct categorisation for common enquiries.
5. Immediate human escalation for safety-sensitive messages.
6. No medical advice, invented facts, duplicate replies, or exposed secrets.

## 20. Build sequence

1. Scaffold backend, database schema, environment configuration, and health check.
2. Implement webhook verification and signature verification.
3. Implement inbound message parsing, deduplication, lead and message persistence, and logs.
4. Implement fixed rule-based categories and replies without an LLM.
5. Implement human handoff and simple admin inspection endpoint.
6. Connect the Meta test number and verify end-to-end WhatsApp testing.
7. Run all acceptance tests and document failures.

## 21. Non-coder launch checklist

Use this checklist to track V0 setup progress without needing to read code.

### Setup foundations
- Project folder/repo is created.
- `clinic-lead-desk-v0-product-instructions.md` is present in the repo.
- `project-instructions.md` is present in the repo.
- `v0-implementation-decisions.md` is present in the repo.
- `task-template.md` is present in the repo.
- `project-description.md` is present in the repo.
- Claude Code or another coding assistant can access the repo.

### Backend scaffold
- Node.js + TypeScript + Fastify backend scaffold is created.
- `.env.example` exists.
- `GET /health` works.
- `GET /webhook` route exists.
- `POST /webhook` route exists.

### Database
- Supabase project is created.
- `DATABASE_URL` is added to environment variables.
- Drizzle schema exists for `leads`, `message_log`, and `escalations`.
- Database migrations run successfully.

### WhatsApp and Meta
- Meta developer app is created.
- WhatsApp product is added in Meta.
- Meta test phone number is available.
- At least one test recipient number is verified.
- Verify token is created and stored.
- App secret is stored securely.
- WhatsApp access token is stored securely.
- Phone Number ID is stored securely.

### Deployment
- Railway project is created.
- Backend is deployed to a public HTTPS URL.
- All production environment variables are added in Railway.
- Deployed `GET /health` works.

### Webhook connection
- Meta callback URL is set to the deployed webhook endpoint.
- Meta verify token matches the backend verify token.
- Webhook verification succeeds.
- `messages` event subscription is enabled.
- Message status events are enabled if available.

### Safety and rules
- Signature verification is implemented.
- Duplicate protection by WhatsApp message ID is implemented.
- Rule-based classification is implemented.
- Approved fixed replies are implemented.
- `STOP` handling is implemented.
- Human-request handling is implemented.
- One-clarification fallback is implemented.
- Human escalation flow is implemented.

### Admin and inspection
- Admin inspection route or page exists.
- Leads can be viewed.
- Message history can be viewed.
- Escalations queue can be viewed.
- Admin access is protected with basic authentication.
- Test lead deletion works.

### End-to-end V0 test
- A test WhatsApp message reaches the backend.
- A lead record is created or updated.
- The correct automated reply is sent.
- A risky message creates an escalation.
- Duplicate webhook delivery does not create duplicate replies.
- Acceptance tests from this document are run and checked.

### V0 ready
- Test user can message the Meta test number successfully.
- System responds only with approved administrative replies.
- Sensitive cases are handed off correctly.
- Logs and records are visible.
- No medical advice, invented facts, duplicate replies, or exposed secrets are observed.

## 22. Operating principle

**Rules first. Approved knowledge second. Human handoff whenever uncertain.**

## 23. Operational clarifications

Operational detail that needs an explicit rule so implementation stays
consistent. These narrow and operationalise the sections above; they never
expand scope. Code comments cite these by number.

### 23.1 Unclear intent

Section 6 mentions escalation after one allowed clarification question.
Until multi-turn conversation state is explicitly built:

- If an inbound message matches no supported safe administrative category, classify it immediately as `human_escalation`.
- Set `escalation_reason = unclear_intent`.
- Do not implement a clarification-turn workflow.
- Use only the approved `human_request` acknowledgment.
- Revisit only when multi-turn conversation state is explicitly added.

### 23.2 STOP and opt-out

- Match case-insensitively when the trimmed message text is exactly `STOP`.
- Set `lead.opted_out = true`.
- Update `lead.updated_at` and `lead.last_inbound_at`.
- Store the inbound STOP message in `message_log`.
- Do not send an automated reply to STOP.
- Do not run classification, reply, appointment, or escalation handling for that message.
- Do not automatically clear `opted_out` if the person messages again later.
- Only a human staff action may re-enable automation.

### 23.3 Escalation actions

Required-action defaults for `human_escalation`:

- `medical_or_urgent` → `clinical team review`
- `complaint`, `refund_dispute`, `privacy_or_legal`, `abusive_language` → `review complaint`
- `human_request`, `custom_quote_or_discount_or_guarantee`, `unclear_intent` → `reply`

For V0, never automatically assign `call`. A callback decision is
staff-controlled.

### 23.4 Escalation replies

Use only the already-approved escalation replies from Section 9:

- `medical_or_urgent` → approved `medical_or_urgent` reply
- `complaint`, `refund_dispute`, `privacy_or_legal`, `abusive_language` → approved `complaint` reply
- `human_request`, `custom_quote_or_discount_or_guarantee`, `unclear_intent` → approved `human_request` reply

Never create, translate, rewrite, or add escalation reply text unless this
document is updated first.

### 23.5 Lead status rules

- A newly created lead starts as `new`.
- A safe non-escalation administrative message may move a lead from `new` to `acknowledged`.
- An `appointment_request` sets `lead_status = appointment_requested`.
- A `human_escalation` sets `lead_status = human_escalation`.
- Automation must not reopen a `closed` lead unless the new message is itself a `human_escalation`.
- Automation must not clear or downgrade an existing `human_escalation`.
- Automation must not downgrade staff-controlled statuses such as `qualified` or `staff_assigned`.
- Automation never sets `information_captured`, `qualified`, `staff_assigned`, or `closed`.

### 23.6 New or existing leads

- `is_new_or_existing = new` when a lead is created for a phone number not already stored.
- `is_new_or_existing = existing` when a lead already exists for that number.
- Use `unknown` only where a manual admin action, migration, or import creates ambiguity.
- Never infer this field from treatment history, booking history, or any clinical relationship.

### 23.7 Hindi-English messages

- Hindi-English detection may be used for logging only.
- Automated replies remain the approved English text exactly as written.
- Never create Hindi, Hindi-English, translated, or paraphrased reply variants unless added to approved knowledge first.
