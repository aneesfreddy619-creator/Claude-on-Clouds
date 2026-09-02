# Claude-on-Clouds

Clinic Lead Desk V0 — a safe WhatsApp front-desk test system for a fictional
Delhi-NCR aesthetic dermatology / premium wellness clinic. See
`clinic-lead-desk-v0-product-instructions.md` for the product spec and
`v0-implementation-decisions.md` for the locked implementation stack.

This is a test shell, not a production medical assistant.

## Backend scaffold

Stack: Node.js + TypeScript + Fastify + Drizzle + Supabase Postgres.

### Prerequisites

- Node.js 20+
- A Supabase Postgres project (or any reachable Postgres instance) for `DATABASE_URL`

### Run locally

1. Install dependencies:
   ```bash
   npm install
   ```
2. Copy the env template and fill in real values (never commit `.env`):
   ```bash
   cp .env.example .env
   ```
3. Generate and run database migrations:
   ```bash
   npm run db:generate
   npm run db:migrate
   ```
4. Start the dev server (auto-reloads on file changes):
   ```bash
   npm run dev
   ```
5. Confirm it's running:
   ```bash
   curl http://localhost:3000/health
   ```
   Expect `{"status":"ok"}` (or the port you set in `.env`).

### Production-style run

```bash
npm run build
npm start
```

### Tests

```bash
npm test
```

Runs the deterministic unit/route tests (Node's built-in test runner via
`tsx --test`) — no new dependency was added for this. These tests use
fixed, non-secret test credentials and an intentionally unreachable
`DATABASE_URL`, so they never touch a real database or send a real
WhatsApp message; anything that requires a live Postgres connection or a
live Meta test number is out of this suite's scope (see the test files'
own comments for which cases are and aren't covered).

### Deployment (Railway + Supabase)

There is no Railway config file in this repo, and `npm run db:migrate` is
**not** run automatically on deploy or app startup — nothing in `build`/
`start` calls it. Before (or immediately after) deploying a build whose
schema changed, run `npm run db:migrate` against the target `DATABASE_URL`
yourself (locally, pointed at the production database, or via Railway's
one-off command runner) to avoid the running app hitting a schema that
doesn't match its code. This is a manual step by design — not automated —
so a deploy never silently runs a migration against a database that isn't
ready for it.

### Notes

- All secrets (WhatsApp tokens, verify token, admin credentials, database URL)
  come from environment variables only — never hardcode them.
- `GET /webhook` verification, `POST /webhook` signature verification,
  duplicate protection, rule-based classification, approved-reply
  selection, lead/inbound-message persistence, and sending the approved
  reply back through the WhatsApp Cloud API are implemented. Creating
  `escalations` rows, wiring `/admin` to real data, appointment detail
  collection, and STOP/opt-out handling are not yet implemented — see the
  `TODO` comments in `src/routes/webhook.ts` and
  `v0-implementation-decisions.md`.
- `src/routes/webhook.ts` is orchestration only. Signature verification
  lives in `src/security/`, dedupe and persistence in `src/services/`,
  payload parsing in `src/whatsapp/`, and classification/reply selection in
  `src/rules/`.
