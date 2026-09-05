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

**Proven live end-to-end on 2026-09-05.** §17 acceptance tests stand at 10
of 10. Nine rows were proven live against the Meta test number, each
verified in Railway logs; row 10 is unit-proven only.

| # | Message sent | Category / escalation reason | Observed result |
|---|---|---|---|
| 1 | appointment on Saturday | `appointment_request` | reply sent, marked **read** in WhatsApp |
| 2 | consultation fee? | `published_pricing` | ₹800 approved reply sent |
| 3 | located / timings? | `hours_location` | approved reply sent |
| 4 | laser hair reduction? | `service_information` | approved reply sent |
| 5 | while pregnant? | `human_escalation` / `medical_or_urgent` | escalation row created; escalation reply sent |
| 6 | redness after treatment | `human_escalation` / `medical_or_urgent` | escalation row created; escalation reply sent |
| 7 | I want a refund | `human_escalation` / `refund_dispute` | escalation row created; escalation reply sent |
| 8 | Talk to a person | `human_escalation` / `human_request` | escalation row created; escalation reply sent |
| 9 | "Stop" (capital S) | STOP match, case-insensitive | `opted_out = true`; no classification, no escalation, **no reply** |
| 10 | duplicate webhook delivery | — | **unit-proven only** in `webhook.persistence.test.ts` against a real database. Not live-triggerable: Meta will not redeliver a `wamid` on demand. |

**What this run does not prove.** All ten messages came from the single
approved test recipient, whose lead was already in `human_escalation` from
row 1's follow-ups. Per §23.5 an escalated lead's status is never
downgraded, so rows 2–4 could not move it to `acknowledged` or
`appointment_requested`. That is correct behaviour, but it means live
evidence for those status transitions does not exist — they remain covered
by automated tests only.

**Root cause of the long-running blocker: the Meta app was unpublished.**
Meta does not dispatch production webhook data to apps in Development mode;
only dashboard-generated test events. This explains every observation:
the `GET` verification handshake succeeded (not production data), Meta's own
sample webhook arrived and ran the entire pipeline correctly, real messages
never arrived, and zero retry traffic was ever seen despite Meta retrying
undeliverable webhooks for up to seven days — nothing was ever dispatched to
fail. No backend code path was ever responsible.

**Fixed by** adding `PRIVACY.md` at the repository root (commit `b9d3938`)
to supply the Privacy Policy URL that was the only blocker on Meta's Publish
screen, then switching the app Development → Live. Neither App Review nor
Business Verification was required; secondary sources routinely conflate
those three, and they are distinct.

**Disproved hypothesis — do not re-run.** An earlier high-confidence
hypothesis held that the WhatsApp Business Account was not subscribed to the
Meta app. `GET /{WABA_ID}/subscribed_apps` returned the app, disproving it.
The five manual Meta configuration checks that hung off that hypothesis
(callback URL, `messages` field subscription, conflicting app-level webhook,
phone number ID, WABA state) were all verified correct and are a dead end.

**Secondary issue, resolved:** immediately after publishing, outbound replies
failed with Meta error `190` (`401 Authentication Error`) — the temporary
developer access token had expired. Refreshing `WHATSAPP_ACCESS_TOKEN` in
Railway restored sending. Temporary tokens expire on a fixed cycle, so this
recurs; a permanent System User token is the durable fix and is not yet
applied.

**Live state left behind:** the test recipient's lead carries
`opted_out = true` from row 9 and will receive no further automated replies
until that flag is cleared, which is a deliberate database change and is not
yet approved.

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
| `services/whatsappSender.ts` | Complete | fail-closed proven by tests; success path proven live nine times on 2026-09-05 |
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
| 4 — Conversational | **Not covered by automated tests.** Proven once live on 2026-09-05 (nine §17 rows end to end). |

A passing result validates what it tested, at the version it tested, within
the coverage it had. **47/47 green does not by itself satisfy Section 19** —
Section 19 was satisfied by the live run, not by the suite. Any change to
rules or approved content re-runs tier 1 in full before it is trusted.

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

The gate was Clinic Lead Desk V0 achieving its first real end-to-end
WhatsApp outcome (Section 19). That happened on 2026-09-05, so the gate is
**met**. Nothing is thereby adopted: the name **WhatsApp Front-Desk Shell**,
any knowledge restructure, and all code or schema changes are now unblocked
but each still requires its own explicit approval. Until one is given these
remain decisions on paper only, and the clinic instructions win any conflict.

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
