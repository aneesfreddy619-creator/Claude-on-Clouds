# Clinic Lead Desk V0 — Simple Visual System Map

This file explains what the system is, what the user sees, what you see, and what the backend does.

## 1) Big picture

The customer-facing product is a WhatsApp chat experience.

The operator-facing product is a small backend system plus a simple admin inspection view.

```text
Customer on WhatsApp
        |
        v
Meta WhatsApp Cloud API
        |
        v
Your Backend Server (Fastify)
        |
        +--> Rule engine
        +--> Lead database
        +--> Message log
        +--> Escalations queue
        +--> Simple admin view / API
```

## 2) What the customer sees

```text
[Customer opens WhatsApp]
        |
        v
[Customer messages clinic number]
        |
        v
[Gets automated admin reply]
        |
        +--> If normal admin request:
        |       gets approved reply
        |
        +--> If appointment request:
        |       gets asked for missing details
        |
        +--> If risky / medical / complaint / unclear:
                gets handoff message
```

The customer does not see the backend or database.

They only see the WhatsApp chat.

## 3) What you see

```text
You / Clinic staff
      |
      v
Simple admin page or admin API
      |
      +--> Leads list
      +--> Message history
      +--> Escalations queue
      +--> Lead status
      +--> Deletion for test data
```

This is for inspection and follow-up.

It is not the main customer-facing product.

## 4) What the backend does

```text
Incoming WhatsApp message
        |
        v
1. Verify webhook request
        |
        v
2. Ignore duplicate message if already processed
        |
        v
3. Find or create lead by phone number
        |
        v
4. Store inbound message in message_log
        |
        v
5. Check STOP / opted out
        |
        +--> If opted out: stop
        |
        v
6. Classify message by rules
        |
        +--> appointment_request
        +--> hours_location
        +--> service_information
        +--> published_pricing
        +--> existing_appointment
        +--> human_escalation
        |
        v
7. Choose next action
        |
        +--> send approved fixed reply
        |
        +--> collect missing appointment details
        |
        +--> create escalation and stop automation
        |
        v
8. Log outbound reply and update lead
```

## 5) Safety-first logic

```text
If message looks medical, urgent, complaint-related, refund-related,
privacy-related, abusive, or still unclear after one clarification:

        => HUMAN ESCALATION
```

That means the system should:

```text
- create escalation record
- send approved handoff acknowledgment once
- stop automated conversational handling
```

## 6) Main system parts

### A. WhatsApp layer
- Meta WhatsApp Cloud API test number
- Receives and sends WhatsApp messages

### B. Backend layer
- Node.js + TypeScript + Fastify
- Public webhook endpoint
- Rule-based message handling

### C. Database layer
- Supabase Postgres
- Leads table
- Message log table
- Escalations table

### D. Admin layer
- Simple protected admin page or API
- Used by you to inspect leads and escalations

## 7) Customer journey examples

### Example A: price question
```text
User: What is the consultation fee?
  -> backend classifies as published_pricing
  -> backend sends approved ₹800 reply
  -> lead + message are logged
```

### Example B: appointment request
```text
User: I want an appointment on Saturday
  -> backend classifies as appointment_request
  -> backend asks for missing name / service / preferred time
  -> lead is updated
```

### Example C: risky medical question
```text
User: I got redness after treatment
  -> backend classifies as human_escalation
  -> backend sends approved medical handoff message
  -> escalation record is created
  -> automation stops
```

## 8) What V0 is NOT

```text
NOT a doctor
NOT a treatment advisor
NOT a live booking calendar
NOT payment collection
NOT a marketing bot
NOT production-ready clinic software
```

## 9) Final mental model

```text
WhatsApp number = the front door
Backend server = the brain + traffic controller
Database = the memory
Admin page = your control desk
Escalations queue = the human handoff tray
```

## 10) Launch target for V0

The first successful V0 launch looks like this:

```text
Test user sends WhatsApp message
        |
        v
Correct automated reply is sent
        |
        v
Lead record is created/updated
        |
        v
Message log is stored
        |
        v
Sensitive cases appear in escalation queue
```

That is the system you are building now.
