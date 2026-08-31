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
- Model layer: None in V0; rule-based handling only
- WhatsApp path: Meta WhatsApp Cloud API test number only

## Locked build rules
- Rules first.
- Approved knowledge second.
- Model assistance third.
- Human handoff whenever uncertain.
- Approved fixed replies only.
- No medical advice.
- No appointment confirmation by the system.
- No extra channels or integrations outside the V0 spec.

## Not included in V0
- LLM classification for the current milestone
- n8n, Make, or Pipedream
- Automated calendar booking
- Payment collection
- Instagram, Facebook, or web-form integrations
- Multi-client packaging
- Advanced RAG or knowledge-base ingestion

## Build order for next chat
1. Scaffold backend, environment configuration, and health check.
2. Define Drizzle schema and migrations for leads, message_log, and escalations.
3. Implement `GET /webhook` verification and `POST /webhook` handling.
4. Add signature verification and duplicate protection by WhatsApp message ID.
5. Implement rule-based classification and approved replies.
6. Add missing-detail collection for appointment requests.
7. Add escalation flow and simple admin inspection endpoint/view.
8. Connect Meta test number and run acceptance tests.

## Notes
- This file is a working implementation decision record.
- Source of truth for product behavior remains `clinic-lead-desk-v0-product-instructions.md`.
