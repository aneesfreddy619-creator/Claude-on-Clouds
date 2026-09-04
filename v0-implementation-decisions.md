# V0 Implementation Decisions

Locked implementation choices, current technical state, working method, and
gated future decisions. Product behaviour remains governed by
`clinic-lead-desk-v0-product-instructions.md`.

## Purpose and scope

Inside locked V0 scope. This file does not change product requirements,
safety rules, approved knowledge, or acceptance criteria.

## Locked stack

- Backend: Node.js + TypeScript + Fastify
- Database: Supabase Postgres
- ORM: Drizzle
- Deployment: Railway
- Local webhook testing: Cloudflare Tunnel or ngrok
- Admin protection: Basic password protection
- Human handoff: `escalations` table first
- **Model layer: none, permanently** — no LLM, AI classification or extraction, RAG, embeddings, or multi-model orchestration, in V0 or in the future shell direction
- WhatsApp path: Meta WhatsApp Cloud API test number only

## Locked build rules

Rules first. Approved knowledge second. Human handoff whenever uncertain.
Approved fixed replies only. No medical advice. No appointment confirmation
by the system. No extra channels or integrations. No n8n, Make, Pipedream,
or equivalent workflow tooling.

## Current checkpoint

**Complete and verified:** backend scaffold, environment config, schema and
migrations, `GET /webhook` verification, `POST /webhook` signature
verification over the raw body, deduplication by WhatsApp message ID,
rule-based classification, approved reply selection, lead and message
persistence, escalation row creation, STOP/opt-out handling, outbound send
function, protected admin inspection with test-lead deletion, and
appointment-detail extraction.

Deployed on Railway from `main`. `GET /health` and `/admin` both return 200
in production. All Railway variables present:
`DATABASE_URL`, `WHATSAPP_VERIFY_TOKEN`, `WHATSAPP_APP_SECRET`,
`WHATSAPP_ACCESS_TOKEN`, `WHATSAPP_PHONE_NUMBER_ID`,
`ADMIN_BASIC_AUTH_USER`, `ADMIN_BASIC_AUTH_PASSWORD`.

**Proven live once:** Meta's own sample webhook event arrived and ran the
full pipeline correctly — signature verified, deduplicated, classified, lead
created, message logged, escalation created, outbound send attempted. That
send returned a real Graph API error (`#131030 recipient not in allowed
list`, expected for Meta's fake sample sender), which proves the access
token and phone number ID authenticate correctly.

**Open blocker:** real inbound messages from the approved test recipient
never reach the backend. Confirmed at three independent layers — Railway
logs, Supabase rows, and direct message-ID search — all empty. Meta retries
undeliverable webhooks for up to 7 days; no retry traffic was ever observed,
so Meta is not failing to deliver, it is never dispatching. The gap is
upstream of the backend, so no backend code path is responsible.

**Leading hypothesis, unproven:** the WhatsApp Business Account is not
subscribed to the Meta app. This would explain why the dashboard test button
works (it bypasses the WABA subscription) while real messages never dispatch.

**Next action, read-only:** `GET /{WABA_ID}/subscribed_apps` in Graph API
Explorer (requires `whatsapp_business_management`). Empty `data` confirms the
hypothesis.

**Manual Meta checks, if that is not conclusive:**
1. WhatsApp → Configuration → Callback URL reads exactly the deployed `/webhook` URL
2. Same screen → Webhook fields → `messages` subscribed *there*
3. App-level Webhooks page shows no conflicting callback URL
4. Phone Number ID matches `WHATSAPP_PHONE_NUMBER_ID`
5. WABA is not in a pending or restricted state

**Known infrastructure gotcha:** `DATABASE_URL` must use the Supabase IPv4
**session pooler** (`aws-0-<region>.pooler.supabase.com:5432`). The direct
`db.<ref>.supabase.co` host resolves IPv6-only and produced `ENETUNREACH`
from Railway. Do not revert to the direct host.

## Run, build, test, deploy

Commands, environment setup, the local-Postgres test prerequisite, and the
manual-migration policy live in `README.md` (developer documentation, not a
project document). Not restated here — one home per fact.

Two operational facts that belong with the decisions rather than the README:

**Known wart:** `npm test` exits 0 but hangs for some minutes after tests
pass, because the `postgres.js` pool keeps the event loop alive.
`--test-force-exit` fixes it; not applied, as it is a `package.json` change
awaiting approval.

**Migrations are never automatic**, by decision. Nothing in `build` or
`start` runs `db:migrate`, so a deploy can never silently migrate a database
that is not ready.

## Module and coverage registry

Read from source, never asserted from memory.

| Module | Status | Coverage |
|---|---|---|
| `routes/webhook.ts` | Complete | `webhook.test.ts` (4), `webhook.persistence.test.ts` (12) |
| `security/webhookSignature.ts` | Complete | missing and invalid signature both rejected |
| `services/dedupe.ts` | Complete | `dedupe.test.ts` (1) + duplicate-delivery case |
| `services/persistence.ts` | Complete | `persistence.test.ts` (6) + acceptance cases |
| `rules/classifier.ts` | Complete | `classifier.test.ts` (4) + 8 acceptance cases |
| `rules/approvedReplies.ts` | Complete | `approvedReplies.test.ts` (5) + reply-text assertions |
| `rules/stopDetection.ts` | Complete | `stopDetection.test.ts` (2) + STOP acceptance case |
| `rules/appointmentDetailExtraction.ts` | **Partial** | no dedicated tests; exercised indirectly |
| `routes/admin.ts` | Complete | `admin.test.ts` (13) |
| `routes/health.ts` | Complete | verified live via Railway healthcheck |
| `services/whatsappSender.ts` | **Partial** | fail-closed proven; success path never exercised live |
| `config/env.ts` | Complete | no validation by design; presence logged at boot |
| `whatsapp/inboundPayload.ts` | Complete | via webhook tests |

**Totals:** 47 tests across 8 files, all passing.

**Maintenance rule:** update this table in the same change that alters a
module, or do not keep it. An unmaintained registry produces confident
claims about coverage that does not exist.

## Test tiers and what a pass means

| Tier | Proves |
|---|---|
| 1 — Accuracy | Approved reply text exact; correct category and escalation reason |
| 2 — Application | Right rule applied; lead status; persistence |
| 3 — Edge and failure | Unmatched input escalates; unreachable DB fails closed; bad signature rejected |
| 4 — Conversational | **Not covered.** Requires live WhatsApp. |

A passing result validates what it tested, at the version it tested, within
the coverage it had. **47/47 green does not satisfy Section 19.** Any change
to rules or approved content re-runs tier 1 in full before it is trusted.

## Staleness and review intervals

Approved knowledge carries a source and a review interval. Past the
interval, content is flagged, never silently deleted.

| Content | Governing copy | Source | Review |
|---|---|---|---|
| Consultation fee | `rules/approvedReplies.ts` | product-instructions §8/§9 | Quarterly, or on price change |
| Opening hours | `rules/approvedReplies.ts` | product-instructions §8/§9 | Quarterly, or on schedule change |
| Branch address | `rules/approvedReplies.ts` | product-instructions §8/§9 | Annually, or on relocation |
| Service list | `rules/approvedReplies.ts` | product-instructions §8/§9 | Quarterly |
| Escalation replies | `rules/approvedReplies.ts` | product-instructions §8/§9/§23.4 | Annually, or on safety-policy change |
| Classifier keywords | `rules/classifier.ts` | product-instructions §7 | On any acceptance-test failure; else semi-annually |

**One-copy law:** a figure is written in exactly one place and pointed at
everywhere else. Tests assert against the exported constants and never
restate approved text. Restating a value in a second location is how a
knowledge base comes to contradict itself, and the contradiction always
surfaces later than it was created.

## Future shell decisions — gated, not active

A reusable multi-business WhatsApp front-desk / case-intake shell is an
approved future direction. **No LLM or AI, ever** — deterministic rule-based
classification, approved content packs, and human escalation when uncertain.

Gated until Clinic Lead Desk V0 achieves its first real end-to-end WhatsApp
outcome (Section 19): adopting the name **WhatsApp Front-Desk Shell**, any
knowledge restructure, and all code or schema changes. Until then these are
decisions on paper only, and the clinic instructions win any conflict.

**Key finding that makes this viable:** the engine is already generic.
Transport, matching, persistence, opt-out, and admin layers contain no
clinic concepts. Only the keyword tables and reply text are
business-specific, so generalising means hoisting two data tables into a
content pack, not rewriting the system.

**Standard categories (8):** `new_request`, `existing_request`,
`published_pricing`, `access_information`, `offering_information`,
`requirements_checklist`, `eligibility_screen`, `human_escalation`.

Two invariants: `human_escalation` always outranks every other match; and
`eligibility_screen` is a checklist, never a determination — it may state
conditions and route to a human, never tell a person they do or do not
qualify. A business that cannot express it as a checklist disables it.

**Content pack (data only):** enabled categories, ordered category rules,
approved replies, escalation reasons, required facts per category, and
per-block source plus review interval.

**Two-layer truth, validated by rules, no model:** layer 1 is static
approved content; layer 2 is live operating state (opt-out, open escalation,
human taken over, business paused, content flagged stale). The two layers
hold **different kinds** of truth, never the same fact twice. A deterministic
pre-send validator then suppresses or redirects: opted out → send nothing;
human assigned → suppress; category disabled → escalate; required facts
missing → send checklist; reply text missing from the pack → **escalate,
never improvise**.

**Record model:** rename `lead` → `contact_case` when the gate opens.
`lead` imports sales framing into domains that have none; `case` is a SQL
reserved word. Splitting `contact` from `contact_case` is the correct
long-term model and is a migration, so it is gated too.

**Open slots before any build:** pack storage (files vs database); whether
contact and case split at first implementation; how required-facts
collection holds state across turns (no conversation state exists today);
out-of-hours text; operator editing interface; which business is instance two.

## Notes

Working implementation decision record. Source of truth for product
behaviour remains `clinic-lead-desk-v0-product-instructions.md`.
