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
