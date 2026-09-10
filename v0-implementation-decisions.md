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

## Infrastructure identifiers

Identifiers only — never tokens, passwords, or connection strings. Recorded
so sessions stop re-deriving them.

| Resource | Identifier |
|---|---|
| Railway project | `capable-delight` / `f7f61cf1-dd49-431d-ac5c-73af75beb2f4` |
| Railway service | `Claude-on-Clouds` / `ac9aff39-6c11-4f95-a4f5-372849a6653e` |
| Railway environment | `production` / `e7f033ee-44fb-442b-a777-1006d8287049` |
| Supabase project | ref `ewxajlygruucyqbowyev`, region `ap-south-1` |
| Deployed URL | `https://claude-on-clouds-production.up.railway.app` |
| WABA ID | `1579901163932761` — **unverified**, see below |

The Railway and Supabase rows were verified read-only against the live
APIs on 2026-09-05. The WABA ID is carried from session record and has not
been re-verified, because `developers.facebook.com` is blocked from the
Claude sandbox; confirm it in the Meta console before relying on it.

**Trap — the database host reported by the Supabase API is the wrong one.**
`list_projects` reports the host as `db.ewxajlygruucyqbowyev.supabase.co`.
That is the IPv6-only direct host that caused the `/admin` 500. Copying it
from an API response reintroduces the bug. Use the IPv4 session pooler, per
the warning under Current checkpoint.

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
function, protected admin inspection with test-lead deletion and opt-out
reversal, and appointment-detail extraction.

Deployed on Railway from `main`. `GET /health` and `/admin` both return 200
in production. All Railway variables present:
`DATABASE_URL`, `WHATSAPP_VERIFY_TOKEN`, `WHATSAPP_APP_SECRET`,
`WHATSAPP_ACCESS_TOKEN`, `WHATSAPP_PHONE_NUMBER_ID`,
`ADMIN_BASIC_AUTH_USER`, `ADMIN_BASIC_AUTH_PASSWORD`.

**Proven live end-to-end on 2026-09-05, extended 2026-09-10.** §17 acceptance
tests stand at 14 of 14, **at differing strengths — read the strength, not the
count.** Rows 1-9 were proven live against the Meta test number on 2026-09-05,
each verified in Railway logs. Row 10 is database-proven only. Rows 11 and 12
were proven live on 2026-09-10, once commit `a18fb1b` fixed the admin form 415
and made staff resolution reachable in a browser. **Rows 13 and 14 remain
database-proven only and are HELD with no live proof** — see below the table.

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
| 10 | duplicate webhook delivery | — | **database-proven only** in `webhook.persistence.test.ts` against a real database. Not live-triggerable: Meta will not redeliver a `wamid` on demand. |
| 11 | consultation fee?, sent while five escalations were open (2026-09-10) | `published_pricing` | **Open-escalation hold overrode the ordinary reply.** The approved pending-review reply was sent in place of the ₹800 `published_pricing` reply; the inbound persisted with its classification; the lead stayed `human_escalation`; opt-out stayed `false`. One outbound attempt recorded `failed`, and a later one recorded `sent` — **the cause of the failed attempt is unknown** and is not explained by the evidence captured. Recorded, not diagnosed. |
| 12 | consultation fee?, re-sent after the last escalation was resolved (2026-09-10) | `published_pricing` | **Normal automation resumed.** Staff resolved the final open escalation through `/admin`; the lead returned `human_escalation` → `acknowledged`; the same question then received the ordinary ₹800 `published_pricing` reply, outbound status `sent`. Only escalations belonging to this lead were resolved — an unrelated lead's escalation stayed open, so the resolve did not act case-wide. |

**Rows 13 and 14 — HELD, not live-proven, and not scheduled.** Both describe
states the product is built never to produce. Row 13 requires the
escalation-state read to fail while a message arrives; row 14 requires a lead
in `human_escalation` with no open escalation row, which the resolve path
removes by design the moment the last escalation is cleared. Producing either
live means inducing a fault in a production source or editing Supabase by
hand. **Neither is approved.** They stand on their database-backed proof —
including the `CHECK (false) NOT VALID` injection described under
"Contradictory escalation state" — and must never be reported as live passes.

**What the 2026-09-05 run does not prove.** All ten messages came from the single
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

**Test lead 919560640859 — current state (2026-09-10):** `opted_out = false`,
status `acknowledged`, no open escalations.

*History, kept because it is the evidence trail, not the current state:* row 9
set `opted_out = true` on 2026-09-05, and the lead was later held in
`human_escalation` with five open escalations. On 2026-09-10 the opt-out was
cleared and all five escalations resolved through the admin page, in order to
run §17 rows 11–12 — see the row 11/12 entries above. Both actions are
one-click staff actions ("Clear opt-out" since 2026-09-07, "Resolve" since
2026-09-08); see "Admin opt-out reversal" below. Doing either remains a
deliberate choice, never something the system does by itself.

**Known infrastructure gotcha:** `DATABASE_URL` must use the Supabase IPv4
**session pooler** (`aws-0-<region>.pooler.supabase.com:5432`). The direct
`db.<ref>.supabase.co` host resolves IPv6-only and produced `ENETUNREACH`
from Railway. Do not revert to the direct host.

## Run, build, test, deploy

Commands, environment setup, the local-Postgres test prerequisite, and the
manual-migration policy live in `README.md` (developer documentation, not a
project document). Not restated here — one home per fact.

Three operational facts that belong with the decisions rather than the README:

**Known wart — recorded, not fixed.** `src/db/client.ts` opens a
module-level `postgres()` pool that is never closed, and
`webhook.persistence.test.ts` has no `after()` hook to end it. Against the
intentionally unreachable `…/dummy` URL no socket is opened, so `npm test`
exits 0 after hanging for some minutes. **Against a real local Postgres the
run does not terminate at all** — the pool holds live sockets and keeps the
event loop alive indefinitely. Observed 2026-09-10, when per-file runs had to
be used to obtain a valid 87/87 figure. `--test-force-exit`, or closing the
pool in an `after()` hook, would fix it; neither is applied, as both are
changes awaiting their own approval.

**A test that can pass for the wrong reason — recorded, not fixed.** In
`persistence.test.ts`, the case "clearLeadOptOut returns false for a lead that
does not exist" asserts `false`. `clearLeadOptOut` also returns `false` from
its catch path, so an unreachable database produces the expected value without
exercising the behaviour under test. It passed in the void run of 2026-09-10
for exactly that reason. The assertion needs to distinguish "no such lead"
from "the query failed" before it can be trusted. Recorded 2026-09-10; no fix
approved, and none applied.

**Migrations are never automatic**, by decision. Nothing in `build` or
`start` runs `db:migrate`, so a deploy can never silently migrate a database
that is not ready.

## Module and coverage registry

Read from source, never asserted from memory.

| Module | Status | Coverage |
|---|---|---|
| `routes/webhook.ts` | Complete | `webhook.test.ts` (4), `webhook.persistence.test.ts` (21) |
| `security/webhookSignature.ts` | Complete | missing and invalid signature both rejected |
| `services/dedupe.ts` | Complete | `dedupe.test.ts` (1) + duplicate-delivery case |
| `services/persistence.ts` | Complete | `persistence.test.ts` (6) + acceptance cases + `clearLeadOptOut` proven against a real database |
| `rules/classifier.ts` | Complete | `classifier.test.ts` (4) + 8 acceptance cases |
| `rules/approvedReplies.ts` | Complete | `approvedReplies.test.ts` (5) + reply-text assertions |
| `rules/stopDetection.ts` | Complete | `stopDetection.test.ts` (2) + STOP acceptance case |
| `rules/appointmentDetailExtraction.ts` | **Partial** | no dedicated tests; exercised indirectly |
| `routes/admin.ts` | Complete | `admin.test.ts` (30) — includes opt-in and escalation-resolve route auth and UUID guards, plus the form-encoded transport tests added in `a18fb1b` |
| `routes/health.ts` | Complete | verified live via Railway healthcheck |
| `services/preSendValidator.ts` | Complete | `preSendValidator.test.ts` (14) — every reachable state, including unavailable and contradictory |
| `services/whatsappSender.ts` | Complete | fail-closed proven by tests; success path proven live nine times on 2026-09-05 |
| `config/env.ts` | Complete | no validation by design; presence logged at boot |
| `whatsapp/inboundPayload.ts` | Complete | via webhook tests |

**Totals:** 87 tests across 9 files, all passing. Counted from source on
2026-09-10: admin 30, webhook.persistence 21, preSendValidator 14, webhook 4,
persistence 6, approvedReplies 5, classifier 4, stopDetection 2, dedupe 1.

**This table had drifted before it was corrected.** It read 75 while source
held 81, so the maintenance rule below was already being missed by six tests
before `a18fb1b` added six more. A registry that drifts silently is worse than
no registry, because it is quoted with confidence.

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

## Tier-1 trigger for the pending-escalation reply (2026-09-08)

The governing rule above is **"Any change to rules or approved content
re-runs tier 1 in full before it is trusted."** It is scoped to *any*
change to approved content, not only to edits of existing replies.

This milestone adds `pending_escalation` to §9 approved knowledge and a new
deterministic path that can send it. **Tier 1 is therefore triggered.** An
earlier claim that leaving the three existing escalation replies untouched
avoided the requirement was wrong.

**Tier 1 was re-run in full and passed:** all 68 tests green, including the
§17 accuracy assertions, which read expected text from the exported
constants rather than restating it. Tier 1 is satisfied.

**Tier 4 — satisfied for this path, on 2026-09-10.** The verification
requirement recorded here was: one live run against the Meta test number —
escalate, send an ordinary question, confirm the pending reply arrives and the
ordinary reply does not, resolve in `/admin`, confirm the ordinary reply
resumes. That run was performed and passed; it is §17 rows 11 and 12, recorded
in the checkpoint table above.

**Scope of that satisfaction, stated narrowly on purpose.** It covers exactly
one path: escalation hold → staff resolution → normal reply resumption. It
says nothing about any other tier-4 behaviour, and it does not generalise to
rows 13–14, whose paths were never exercised live.

**Resolved — the open question about §17's shape.** This section previously
asked whether §17's ten-row table should gain a row or stop being the complete
acceptance specification. It gained rows: §17 has carried rows 11–14 since
2026-09-08, and remains the complete acceptance specification.

## Contradictory escalation state (2026-09-08)

Independent review of `99e6b3a` found that `createEscalation` returns
`boolean` and `webhook.ts` discarded it. A failed escalation write therefore
left `lead_status = human_escalation` with no open escalation row, sent the
customer an acknowledgement asserting a handoff that was never recorded,
and — because `computeLeadStatus` never downgrades that status while the
lookup keeps reporting `none` — let ordinary automation resume on the next
message.

**Fix:** the webhook captures whether an escalation was successfully
recorded for this message and passes it, with the lead's status, to the
pre-send validator. A lead in `human_escalation` with no open escalation,
where this message did not record one, is `CONTRADICTORY` and sends nothing.
The healthy escalating message is unaffected: its lookup also reports
`none`, but its row was written.

Nothing is invented. Two authoritative sources disagree and the validator
reports the disagreement rather than choosing whichever is convenient —
the same discipline as the tri-state lookup, one level up.

**Proven against a real database** by injecting a `CHECK (false) NOT VALID`
constraint so `SELECT` still succeeds while `INSERT` fails, which is what
makes it the contradiction path rather than the unavailable path. The run
log confirms `CONTRADICTORY` twice — once for the escalating message, once
for the later ordinary one.

**Known limitation:** such a lead has no open escalation, so the Resolve
button never appears and staff cannot clear it from the admin page. The
admin lead row is flagged "Contradictory escalation state — staff review
required", which deliberately does not claim a cause. Recovery semantics
are a separate product decision and nothing is repaired automatically.

## Test isolation for the unavailable-state proof

`webhook.persistence.test.ts` proves the `escalation_state_unavailable`
path by renaming the `escalations` table for the duration of one test and
restoring it in a `finally` block, so the real catch branch executes rather
than a mock.

Node's runner executes test *files* in parallel (4-way on the current
machine), so isolation matters. It holds for three reasons:

1. **Only that one file reaches the local Postgres.** Every other file runs
   under the suite's intentionally unreachable `…/dummy` URL.
2. **`admin.test.ts` references escalations only in URL strings** for auth
   and UUID-guard tests, all of which return before any database access.
3. **Tests within a file run sequentially** by default, so no other
   DB-backed test can execute inside the rename window.

Verified empirically: three consecutive full runs, 68/68 each time, with
`pg_tables` confirming `escalations` intact afterwards.

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

## Engine scaling and architecture findings

Recorded 2026-09-07 after a second-opinion review, each verified against
the source before being written here.

**1. Tenant partitioning — required before a second business.** Opt-out
(`leads.whatsapp_phone`) and deduplication (`message_log.message_id`) key
on the value alone, with no tenant dimension. Correct for one business.
The moment a second exists on the same engine, a person opting out of
business A would be silently suppressed for business B, and classifier
keyword tables would collide across domains ("book" means an appointment
to a clinic and a purchase to a bookshop). Both must key on
`[tenant_id, …]`, and keyword tables must move into per-tenant content.
**Recorded as a requirement. Not built — there is no tenant concept today.**

**2. Selected, never composed.** Two sources compose the **decision** of
which pre-approved reply to send. The **text itself is never composed,
concatenated, templated, or generated** — it is selected whole from
approved content. Stated precisely because loose wording ("composed to
form the answer") could mislead a future session into building string
assembly, which would break the no-AI guarantee just as surely as a model
would.

**3. "Pre-send validator", not "supervisor layer".** The component that
checks a selected reply against live state is a **pre-send validator**.
"Supervisor" is deprecated: it implies catching non-deterministic model
output, which does not exist here. This validator checks a selection
against state the classifier never saw — is the recipient opted out, has a
human taken over, is the content past its review interval, does the
selected reply exist in the pack. One already runs at
`src/routes/webhook.ts` (the `lead.optedOut` check between reply selection
and send).

**4. Admin opt-out reversal — built 2026-09-07.** `clearLeadOptOut` in
`services/persistence.ts`, reachable only from
`POST /admin/leads/:leadId/opt-in` behind the same Basic Auth and UUID
guard as lead deletion. It clears `opted_out` and nothing else: lead
status, category, escalation reason, and escalation rows all survive,
because opting back in is not a reset of the case. **Nothing in the
message pipeline may call it** — an opt-out is reversed only by a person
acting on a request.

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
