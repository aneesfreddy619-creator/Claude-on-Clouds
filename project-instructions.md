# Project Instructions

Source of truth, in order:
1. clinic-lead-desk-v0-product-instructions.md (acceptance tests = §17; definition of done = §19)
2. project-instructions.md
3. v0-implementation-decisions.md
4. task-template.md
5. project-description.md

Read state from those files rather than restating it. If memory and a file disagree, the file wins.

## Five-file rule (project documentation only)

**The project's standing documentation is exactly these five files. Never
create a sixth.** All future project updates accumulate into them.

This governs **project documentation only**. It is not a limit on the
repository. Application code, tests, configuration, database material,
deployment files, and `README.md` (developer documentation — install, run,
test, deploy) are separate and unaffected.

Working documents — status notes, checkpoints, plans, upgrade specs — may be
drafted freely, but their durable content is absorbed into the five and the
working document is then deleted. Never kept as stock.

Where things live:
- Product, safety, approved knowledge, acceptance tests (§17), definition of done (§19), operational clarifications (§23) → clinic-lead-desk-v0-product-instructions.md
- Scope, status, blocker, behavioural rules → project-instructions.md
- Stack, checkpoint, coverage registry, test tiers, staleness, gated shell decisions → v0-implementation-decisions.md
- Task framing, change-control gates, void-vs-failed, commit discipline → task-template.md
- Project summary and future direction → project-description.md
- Install, run, test, deploy commands → README.md (not a project document)

## Current status

**V0 is complete (2026-09-05).**

Backend green: 87 automated tests passing, build clean, deployed on Railway from main,
/health and /admin working, all seven env vars set.

§17 acceptance tests: 14 of 14 pass, **at differing strengths**. Read the strength, not the count.

| Rows | Strength | Evidence |
|---|---|---|
| 1–9 | **Live-proven** (2026-09-05) | End-to-end against the Meta test number, each verified in Railway logs |
| 10 | **Database-proven only** | `webhook.persistence.test.ts` against a real database. Not live-triggerable: Meta will not redeliver a wamid on demand |
| 11–12 | **Live-proven** (2026-09-10) | Live against the Meta test number, once commit a18fb1b made staff resolution reachable in a browser. Detail in v0-implementation-decisions.md |
| 13–14 | **Database-proven only — HELD, no live proof** | Both describe states the product is built never to produce: row 13 needs the escalation-state read to fail, row 14 needs `human_escalation` with no open escalation row. Producing either live requires inducing a source failure or editing Supabase by hand. Neither is approved, so neither is scheduled |

**Rows 13–14 have not passed live and must not be recorded as if they had.**

§19 definition of done: satisfied — a real WhatsApp message produced an approved reply observed
in WhatsApp, with Meta status webhooks confirming sent then read.

Root cause of the long-running blocker: **the Meta app was unpublished.** Meta does not dispatch
production webhook data to apps in Development mode — only dashboard-generated test events.
Fixed by adding PRIVACY.md to supply the required Privacy Policy URL, then switching the app to Live.
The earlier WABA-subscription hypothesis was **disproved** — GET /{WABA_ID}/subscribed_apps returned
the app. Do not re-run that check; it is a dead end.
Full account in v0-implementation-decisions.md.

## Known operational notes

- **Access token expiry.** Outbound sends failed with Meta error 190 immediately after publishing,
  because the temporary developer token had expired. Refreshing WHATSAPP_ACCESS_TOKEN in Railway
  fixed it. Temporary tokens expire on a fixed cycle, so this recurs. A permanent System User token
  is the durable fix; not yet applied.
- **Test lead 919560640859 — current state (2026-09-10):** `opted_out = false`, status
  `acknowledged`, no open escalations. It can receive automated replies again.
  *History, not current state:* it sent STOP during the 2026-09-05 run and carried
  `opted_out = true`; it was later held in `human_escalation` with five open escalations. The
  opt-out was cleared and all five escalations resolved on 2026-09-10 through the admin page, to
  run §17 rows 11–12. Clearing an opt-out stays a deliberate staff action — nothing in the message
  pipeline performs it.
- **Supabase pooler.** DATABASE_URL must stay on the IPv4 session pooler. See
  v0-implementation-decisions.md — do not revert to the direct host.

## What is held — nothing below is in progress

A fresh reader should be able to tell state without reading a chat log.

| Item | State |
|---|---|
| V0 backend, admin, deployment | **Complete**, live-proven (§19 satisfied 2026-09-05) |
| §17 rows 1–9, 11–12 | **Live-proven** |
| §17 row 10 | **Database-proven only** — not live-triggerable |
| §17 rows 13–14 | **HELD, not live-proven.** Live proof needs an induced source failure or a manual Supabase edit; neither approved, so neither scheduled |
| Two test-harness findings (unterminating persistence run; `clearLeadOptOut` false-pass) | **Recorded only.** Not fixed, no fix approved — see v0-implementation-decisions.md |
| Advisory Agent Shell v4 | **Design draft complete and committed.** NOT CANON, NOT PROVEN, NOT DEPLOYED. No implementation, no refactor toward it |
| Airdesk material | **Reference and stress-test only.** Not resumed, not authoritative for anything here |
| Further live WhatsApp testing | **Not scheduled.** No further test-lead mutation without explicit approval |

## Scope lock

Allowed: webhook, capture and storage, rule-based replies, escalation, audit logging,
admin inspection, deployment for the Meta test number, acceptance testing.
Not allowed: sales collateral, ad copy, presentations, production expansion, real-clinic
onboarding, extra channels, n8n/Make/Pipedream, payments, marketing or broadcast messaging.

## No AI, permanently

No LLM, model layer, AI classification or extraction, RAG, embeddings, or multi-model
orchestration — not in V0 and not in the future shell direction. Classification stays
deterministic and rule-based. All outbound text is pre-approved and selected, never composed.

## Future shell (approved as spec only)

A reusable multi-business, rule-based front-desk / case-intake shell. Decisions are recorded in
v0-implementation-decisions.md ("Future shell decisions — gated, not active"). No authority over V0.
The gate was V0's first real end-to-end WhatsApp outcome. That outcome occurred on 2026-09-05, so
the gate is met. Nothing is thereby adopted: the "WhatsApp Front-Desk Shell" name, any knowledge
restructure, and all code or schema changes are now unblocked but each still needs its own approval.
Where the shell and the clinic instructions conflict, the clinic instructions win.

## Working rules

Rules first. Approved knowledge second. Human handoff whenever uncertain.
Work on main only; never create, switch, or merge branches.
Never commit or push without explicit approval of the exact file set and exact commit message.
Never print, request, or infer secret values — variable names and present/absent only.
Flag missing requirements explicitly instead of inventing them.

## Shared Source of Truth Protocol

Canonical sources:
- GitHub `main` = current code and durable project documentation
- Supabase = current database/schema/data truth
- Railway = current deployment/runtime truth

Before any implementation-affecting conclusion:
- refresh the relevant current source directly;
- do not rely on prior chat summaries, remembered line numbers, or another agent's paraphrase when source is available.

Claude and GPT-5.6 Sol must reason independently from the same current authoritative sources.

Claude:
- implementation owner;
- verify GPT findings against current source before acting;
- use compact milestone plans and reports;
- stop after push for independent review.

GPT-5.6 Sol:
- architecture/verifier role;
- inspect current GitHub/Supabase/Railway state directly;
- do not treat Claude's report as verification;
- review the actual commit SHA after push.

Agreement between agents is not verification by itself.

## Never do

Invent clinic facts, prices, services, addresses, doctors, policies, discounts, or availability.
Give medical advice, diagnosis, treatment recommendation, emergency judgement, pregnancy
suitability guidance, or report interpretation.
Confirm appointments independently.
Store health history, reports, photos, prescriptions, ID documents, or payment data.
Treat V0 as production-ready.

## Delivery rule

If a request falls outside locked V0 scope, label it later phase and do not let it change
the current build plan.
