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
`tsx --test`) — no new dependency was added for this. Most of these tests
use fixed, non-secret test credentials and an intentionally unreachable
`DATABASE_URL`, so they never touch a real database or send a real
WhatsApp message; a live Meta test number is out of this suite's scope
entirely (see the test files' own comments for which cases are and aren't
covered).

One exception: `src/routes/webhook.persistence.test.ts` proves the
DB-backed success/dedupe paths (a signed inbound message creates a lead
and one `message_log` row; a duplicate delivery creates only one; a
status-event payload creates neither) that an unreachable database can't
exercise. It needs a **local, throwaway PostgreSQL instance** reachable at
`postgres://clinic_test:clinic_test_pw@localhost:5432/clinic_lead_desk_test`
before you run `npm test`. This is a manual prerequisite, not automated by
`npm test` itself:

```bash
# start a local Postgres (e.g. the OS package) and then:
psql -c "CREATE ROLE clinic_test LOGIN PASSWORD 'clinic_test_pw';"
psql -c "CREATE DATABASE clinic_lead_desk_test OWNER clinic_test;"
PGPASSWORD=clinic_test_pw psql -h localhost -U clinic_test -d clinic_lead_desk_test \
  -f drizzle/0000_slimy_bloodstrike.sql
```

This local database is entirely separate from the project's real
Supabase database — it's only ever used by this one test file, is never
touched by `npm run db:migrate`, and can be dropped after the test run.
If it isn't set up, only that test file's 3 cases fail with a connection
error; the rest of the suite is unaffected.

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
- The webhook pipeline is complete: `GET /webhook` verification,
  `POST /webhook` signature verification over the raw body, duplicate
  protection by WhatsApp message ID, rule-based classification,
  approved-reply selection, lead/message/escalation persistence,
  appointment-detail extraction, STOP/opt-out handling, sending the
  approved reply through the WhatsApp Cloud API, and protected admin
  inspection with test-lead deletion.
- **This file does not track project status.** For what is built, proven,
  and outstanding, read the five project documents — start with
  `project-instructions.md`. Keeping a second copy of status here is how
  the two come to disagree.
- `src/routes/webhook.ts` is orchestration only. Signature verification
  lives in `src/security/`, dedupe and persistence in `src/services/`,
  payload parsing in `src/whatsapp/`, and classification/reply selection in
  `src/rules/`.
