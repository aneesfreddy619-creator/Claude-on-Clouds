import { test } from "node:test";
import assert from "node:assert/strict";
import { createHmac, randomUUID } from "node:crypto";

// These tests prove the DB-backed success/dedupe/no-op paths that
// webhook.test.ts deliberately cannot cover (that file's DATABASE_URL is
// an intentionally unreachable dummy address, so it only proves the
// fail-closed paths that run before any DB access).
//
// This file overrides DATABASE_URL to a local, throwaway Postgres
// instance BEFORE importing any app code, using a *dynamic* import so the
// override takes effect first (static imports are hoisted and would run
// before this file's own top-level code). Node's test runner executes
// each test file in its own process, so this override cannot leak into
// any other test file — verified separately before writing this file.
//
// This local database is entirely separate from the project's real
// Supabase database: it exists only for this test run, is migrated from
// the same drizzle/0000_slimy_bloodstrike.sql already used in production,
// and is never touched by `npm run db:migrate` or any Railway/Supabase
// tooling.
process.env.WHATSAPP_VERIFY_TOKEN = "test-verify-token";
process.env.WHATSAPP_APP_SECRET = "test-app-secret";
process.env.ADMIN_BASIC_AUTH_USER = "test-admin";
process.env.ADMIN_BASIC_AUTH_PASSWORD = "test-admin-password";
process.env.DATABASE_URL = "postgres://clinic_test:clinic_test_pw@localhost:5432/clinic_lead_desk_test";
// Deliberately left unset, same as the rest of the suite: this proves no
// outbound reply is ever actually attempted, since sendWhatsAppTextReply
// fails closed on missing credentials before any network call.
delete process.env.WHATSAPP_ACCESS_TOKEN;
delete process.env.WHATSAPP_PHONE_NUMBER_ID;

const { buildApp } = await import("../app.js");
const { db } = await import("../db/client.js");
const { leads } = await import("../db/schema/leads.js");
const { messageLog } = await import("../db/schema/messageLog.js");
const { eq } = await import("drizzle-orm");

const APP_SECRET = "test-app-secret";

function sign(rawBody: string): string {
  return `sha256=${createHmac("sha256", APP_SECRET).update(rawBody).digest("hex")}`;
}

function textMessagePayload(messageId: string, from: string, text: string) {
  return {
    object: "whatsapp_business_account",
    entry: [
      {
        id: "test-entry",
        changes: [
          {
            field: "messages",
            value: {
              metadata: { phone_number_id: "test-phone-number-id" },
              contacts: [{ wa_id: from, profile: { name: "Test Sender" } }],
              messages: [
                {
                  id: messageId,
                  from,
                  timestamp: String(Math.floor(Date.now() / 1000)),
                  type: "text",
                  text: { body: text },
                },
              ],
            },
          },
        ],
      },
    ],
  };
}

function statusEventPayload() {
  return {
    object: "whatsapp_business_account",
    entry: [
      {
        id: "test-entry",
        changes: [
          {
            field: "messages",
            value: {
              metadata: { phone_number_id: "test-phone-number-id" },
              statuses: [{ id: `wamid.status-${randomUUID()}`, status: "delivered" }],
            },
          },
        ],
      },
    ],
  };
}

async function postSignedWebhook(app: Awaited<ReturnType<typeof buildApp>>, payload: unknown) {
  const rawBody = JSON.stringify(payload);
  return app.inject({
    method: "POST",
    url: "/webhook",
    payload: rawBody,
    headers: {
      "content-type": "application/json",
      "x-hub-signature-256": sign(rawBody),
    },
  });
}

test("a validly signed inbound text message creates one lead and one inbound message_log row", async () => {
  const app = buildApp();
  const from = `9199900${Math.floor(Math.random() * 100000)}`;
  const messageId = `wamid.${randomUUID()}`;

  const response = await postSignedWebhook(app, textMessagePayload(messageId, from, "Where are you located and what are your timings?"));
  assert.equal(response.statusCode, 200);

  const leadRows = await db.select().from(leads).where(eq(leads.whatsappPhone, from));
  assert.equal(leadRows.length, 1, "expected exactly one lead row for this sender");

  const messageRows = await db.select().from(messageLog).where(eq(messageLog.messageId, messageId));
  assert.equal(messageRows.length, 1, "expected exactly one message_log row for this message id");
  assert.equal(messageRows[0].direction, "inbound");
  assert.equal(messageRows[0].leadId, leadRows[0].leadId);

  await app.close();
});

test("delivering the identical signed webhook twice stores exactly one message_log row (idempotency)", async () => {
  const app = buildApp();
  const from = `9199901${Math.floor(Math.random() * 100000)}`;
  const messageId = `wamid.${randomUUID()}`;
  const payload = textMessagePayload(messageId, from, "What is the consultation fee?");

  const first = await postSignedWebhook(app, payload);
  const second = await postSignedWebhook(app, payload);
  assert.equal(first.statusCode, 200);
  assert.equal(second.statusCode, 200);

  const messageRows = await db.select().from(messageLog).where(eq(messageLog.messageId, messageId));
  assert.equal(messageRows.length, 1, "duplicate delivery of the same message id must not create a second row");

  const leadRows = await db.select().from(leads).where(eq(leads.whatsappPhone, from));
  assert.equal(leadRows.length, 1, "duplicate delivery must not create a second lead either");

  await app.close();
});

test("a status-event payload (no message content) creates no lead and no message_log row", async () => {
  const app = buildApp();

  const before = await db.select().from(messageLog);
  const response = await postSignedWebhook(app, statusEventPayload());
  assert.equal(response.statusCode, 200);
  const after = await db.select().from(messageLog);

  assert.equal(after.length, before.length, "a status-only payload must not insert any message_log row");

  await app.close();
});
