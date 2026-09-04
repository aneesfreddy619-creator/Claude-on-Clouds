# Project Instructions

Source of truth, in order:
1. clinic-lead-desk-v0-product-instructions.md (acceptance tests = §17; definition of done = §19)
2. project-instructions.md
3. v0-implementation-decisions.md
4. task-template.md
5. project-description.md

Live state: docs/v0-session-checkpoint.md. Working method: docs/v0-working-disciplines.md.
Read state from those files rather than restating it. If memory and a file disagree, the file wins.

## Current status

Backend complete and green: 47 automated tests passing, build clean, deployed on Railway from main,
/health and /admin working, all four WhatsApp env vars set.
V0 is NOT done. §19 requires a real WhatsApp message producing an approved reply observed in WhatsApp.

## Open blocker

Real inbound messages never reach Railway — confirmed via Railway logs, Supabase rows, and
message-ID search. Meta's own sample webhook DID arrive and ran the full pipeline correctly.
Leading hypothesis, unproven: the WABA is not subscribed to the Meta app.
Next action, read-only: GET /{WABA_ID}/subscribed_apps in Graph API Explorer
(requires whatsapp_business_management).
Do not propose backend code fixes for this — no backend code path ever executed.

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

whatsapp-front-desk-shell.md — reusable multi-business, rule-based front-desk / case-intake
shell. DRAFT, no authority over V0.
Gated until V0's first real end-to-end WhatsApp outcome: adopting the "WhatsApp Front-Desk Shell"
name, any knowledge restructure, and all code or schema changes.
Where the shell and the clinic instructions conflict, the clinic instructions win.

## Working rules

Rules first. Approved knowledge second. Human handoff whenever uncertain.
Work on main only; never create, switch, or merge branches.
Never commit or push without explicit approval of the exact file set and exact commit message.
Never print, request, or infer secret values — variable names and present/absent only.
Flag missing requirements explicitly instead of inventing them.

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
