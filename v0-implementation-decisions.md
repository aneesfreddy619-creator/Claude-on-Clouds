# V0 Implementation Decisions

## Purpose
This file records the locked implementation choices for Clinic Lead Desk V0 so future work starts from the agreed stack without reopening tool decisions.

## Scope check
Inside locked V0 scope. This file does not change the product requirements, safety rules, approved knowledge, or acceptance criteria defined in `clinic-lead-desk-v0-product-instructions.md`.

## Locked stack
- Backend: Node.js + TypeScript + Fastify
- Database: Supabase Postgres
- ORM: Drizzle
- Deployment: Railway
- Local webhook testing: Cloudflare Tunnel or ngrok
- Admin protection: Basic password protection
- Human handoff: `escalations` table first
- Model layer: None in the current V0 milestone; rule-based handling only
- WhatsApp path: Meta WhatsApp Cloud API test number only

## Locked build rules
- Rules first.
- Approved knowledge second.
- Human handoff whenever uncertain.
- Approved fixed replies only.
- No medical advice.
- No appointment confirmation by the system.
- No extra channels or integrations outside the V0 spec.
- No n8n, Make, Pipedream, or equivalent workflow tooling in the current milestone.
- No LLM classification or extraction in the current milestone.

## Current checkpoint
- Meta dashboard setup and test-number validation have been completed.
- Inbound Meta test webhook payload has been observed.
- Railway production secret values are still pending entry.
- Next Claude task is read-only inspection of exact environment-variable names only.
- No code, deployment, database, migration, or infrastructure changes should happen before that read-only inspection is complete.

## Build order for next chat
1. Inspect `src/config/env.ts` and report the exact required environment-variable names only.
2. Set Railway secret values privately outside chat.
3. Verify deployed environment configuration.
4. Implement or verify `GET /webhook` verification and `POST /webhook` handling.
5. Add signature verification and duplicate protection by WhatsApp message ID.
6. Implement rule-based classification and approved replies.
7. Add missing-detail collection for appointment requests.
8. Add escalation flow and simple admin inspection endpoint/view.
9. Connect the Meta test number to the deployed backend and run acceptance tests.

## Notes
- This file is a working implementation decision record.
- Source of truth for product behavior remains `clinic-lead-desk-v0-product-instructions.md`.
