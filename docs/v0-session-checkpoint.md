# Clinic Lead Desk V0 — Session Checkpoint

Last verified: 2026-09-03.

Durable handoff for any future session (Claude Code, Perplexity, or a human).
Read this first to resume without re-deriving the whole diagnostic trail.

## 1. Source of truth

In precedence order:

1. `clinic-lead-desk-v0-product-instructions.md` — product, safety, approved
   knowledge, categories, exact reply text, acceptance tests (§17),
   definition of done (§19)
2. `project-instructions.md`
3. `v0-implementation-decisions.md`
4. `task-template.md` — task framing and report format
5. `project-description.md` — reference context

Note: the acceptance-test table moved from §15 to §17 in the 2026-09-03
update of the product instructions. Cite §17.

Related documents (neither overrides the five above):
- `docs/v0-working-disciplines.md` — how work is done: change-control gates,
  void-vs-failed runs, staleness intervals, module registry, test tiers.
  **State lives here; method lives there.**
- `whatsapp-front-desk-shell.md` — DRAFT spec for a reusable multi-business
  shell. No authority over V0. Its name adoption and any restructure are
  gated behind V0's first real end-to-end WhatsApp outcome.

## 2. Verified system sync state

| System | State | Verdict |
|---|---|---|
| GitHub `main` | `0fe76d6`, working tree clean | ✅ |
| Railway deployment `6e7b616d` | commit `0fe76d6`, branch `main`, `SUCCESS` | ✅ exact match with GitHub |
| Old scaffold branch `claude/clinic-lead-desk-v0-scaffold-0l4uro` | `1a42ffc`, fully merged into `main` | ✅ no duplication, safe to ignore |
| Supabase `ewxajlygruucyqbowyev` (ap-south-1) | reachable, healthy | ✅ |
| Migrations | single `drizzle/0000_slimy_bloodstrike.sql`, applied | ✅ |
| Public URL | `https://claude-on-clouds-production.up.railway.app` | ✅ |

Railway env var names present (values never read):
`DATABASE_URL`, `WHATSAPP_VERIFY_TOKEN`, `WHATSAPP_APP_SECRET`,
`WHATSAPP_ACCESS_TOKEN`, `WHATSAPP_PHONE_NUMBER_ID`,
`ADMIN_BASIC_AUTH_USER`, `ADMIN_BASIC_AUTH_PASSWORD`.

## 3. What is proven working

- **`/admin`** returns HTTP 200 and renders. (Earlier 500 was fixed by
  pointing `DATABASE_URL` at Supabase's IPv4 **session pooler**
  `aws-0-ap-south-1.pooler.supabase.com:5432` — the direct
  `db.<ref>.supabase.co` host resolves to IPv6-only and produced
  `ENETUNREACH` from Railway. Do not revert to the direct host.)
- **`GET /health`** returns 200 (confirmed via Railway healthcheck logs).
- **`GET /webhook`** Meta verification handshake succeeded (200 + challenge).
- **Full inbound pipeline**, proven end-to-end by Meta's own sample webhook
  event on 2026-09-03 `05:01:02 UTC`: signature verified → dedupe
  (`not_duplicate`) → classified → lead created → `message_log` row →
  escalation row → outbound send attempted.
- **Outbound credentials reach Meta**: that send attempt returned a real
  structured Graph API error (`#131030 Recipient phone number not in
  allowed list`) — an authorisation-scoped error, not an auth failure,
  proving the token and phone number ID were valid at that time.
- **Automated test suite** covers §17 rows 1–10 at the backend level
  (see section 5 below).

## 4. Open blocker (unresolved)

**Real inbound WhatsApp messages from the verified test recipient never
reach Railway at all.**

Evidence (three independent layers, all agreeing):

1. Railway logs — zero entries for either real message ID, searched
   deployment-scoped and unscoped, windowed and unbounded.
2. Supabase — zero `leads` rows for the sender phone; zero `message_log`
   rows for either message ID. Only the one sample-event lead exists.
3. Direct message-ID substring search across both — no match.

Meanwhile Meta's dashboard shows those messages as real `messages` events
with valid `wamid.` IDs.

**Status of the cause: INFERRED, not proven.** No Meta Graph API or
dashboard access has been available in any session so far, so the Meta-side
configuration could not be read directly. What *is* directly proven is that
the gap is upstream of Railway — the backend never received the requests,
so no backend code path can be responsible.

Leading hypothesis: a webhook subscription/routing mismatch on Meta's side —
most likely the app-level Webhooks config and the WhatsApp-product
Configuration screen pointing at different places, so verification and
Meta's own sample-event tooling succeed while real WABA message traffic is
never dispatched to this callback.

## 5. Manual Meta check list (5 fields)

Cannot be done from code — requires the Meta dashboard:

1. **WhatsApp → Configuration → Callback URL** — must read exactly
   `https://claude-on-clouds-production.up.railway.app/webhook`
2. **Same screen → Webhook fields → `messages`** — must show subscribed
   *on that screen*, not only elsewhere
3. **App-level "Webhooks" sidebar item** — if it shows a *different*
   callback URL or subscription state than #1/#2, that split is the most
   likely cause
4. **Phone Number ID** on the WhatsApp Configuration screen — must match
   what is stored in Railway's `WHATSAPP_PHONE_NUMBER_ID`
5. **WABA status in Meta Business Manager** — a pending/restricted WABA can
   surface messages in Meta's own dashboard without dispatching webhook
   events to a subscriber

Also note: the Step 1 access token is temporary and expires repeatedly;
each regeneration must be re-entered in Railway (which triggers a redeploy).

## 6. Test coverage and its limits

`npm test` covers, deterministically and without Meta:

- §17 rows 1–8 — end-to-end through signed `POST /webhook` against a real
  local Postgres: classification, `lead_status`, inbound `message_log` row,
  escalation presence/absence, and the exact approved reply text selected
- §17 row 9 (STOP) — `opted_out = true` persisted, and no outbound reply
- §17 row 10 — duplicate delivery stores exactly one inbound row
- Auth gating, signature rejection, and fail-closed behaviour on an
  unreachable database

**Prerequisite:** `src/routes/webhook.persistence.test.ts` needs a local
throwaway Postgres at
`postgres://clinic_test:clinic_test_pw@localhost:5432/clinic_lead_desk_test`
— setup commands are in `README.md` under "Tests". This is a documented
manual step, deliberately not automated in `package.json`.

**These tests do NOT satisfy §19 "Definition of done".** That still requires
a real message sent to the Meta test number from an approved recipient and
an approved reply *observed in WhatsApp*. The suite proves the backend would
behave correctly given delivery; it cannot prove delivery.

## 7. Standing working rules

- Work on `main` only. Never create, switch, or merge branches.
- Never commit or push without explicit approval of the exact file set and
  the exact commit message.
- Never print, request, or infer secret values (`DATABASE_URL`, tokens, app
  secret, admin credentials). Variable *names* and present/absent booleans
  only.
- Locked V0 scope: rules-based only. No LLM/model layer, no RAG, no n8n /
  Make / Pipedream, no extra channels, no production expansion.
- No medical advice, no appointment confirmation, no payments, no invented
  clinic facts. Approved reply text only, changed in the product
  instructions first.
- Migrations are never automatic — `npm run db:migrate` is a deliberate
  manual step.
- Fictional demo clinic and Meta test number only; approved test recipients
  only; no real clinic or patient data.
