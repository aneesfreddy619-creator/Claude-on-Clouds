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
const { escalations } = await import("../db/schema/escalations.js");
const { NON_ESCALATION_REPLIES, ESCALATION_REPLIES } = await import("../rules/approvedReplies.js");
const { eq, sql } = await import("drizzle-orm");
const { clearLeadOptOut, resolveEscalation } = await import("../services/persistence.js");
const { PENDING_ESCALATION_REPLY } = await import("../rules/approvedReplies.js");

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

// ---------------------------------------------------------------------------
// Section 17 acceptance tests (clinic-lead-desk-v0-product-instructions.md)
//
// These drive the SAME rows as the §17 acceptance table end-to-end through a
// real signed POST /webhook against a real Postgres, so the behaviour can be
// proven WITHOUT depending on Meta actually delivering a webhook.
//
// How the approved reply is verified without sending anything: when
// WHATSAPP_ACCESS_TOKEN/PHONE_NUMBER_ID are unset (as they are here),
// sendWhatsAppTextReply fails closed on "missing_credentials" before any
// network call — but src/routes/webhook.ts still persists the outbound
// message_log row carrying the exact selected reply text with
// status "failed". That row is therefore proof of WHICH approved reply the
// pipeline chose, with zero outbound traffic.
//
// Expected reply text is always read from the exported constants in
// src/rules/approvedReplies.ts — never retyped here — so these tests cannot
// drift from the approved wording.
//
// SCOPE LIMIT: this proves the backend pipeline only. It does NOT satisfy
// §19 "Definition of done", which still requires a real message sent to the
// Meta test number and an approved reply observed in WhatsApp.
// ---------------------------------------------------------------------------

interface AcceptanceExpectation {
  label: string;
  text: string;
  expectedClassification: string;
  expectedReply: string;
  expectedLeadStatus: string;
  expectsEscalation: boolean;
}

async function runAcceptanceCase(expected: AcceptanceExpectation): Promise<void> {
  const app = buildApp();
  const from = `9199${Math.floor(Math.random() * 1000000000).toString().padStart(9, "0")}`;
  const messageId = `wamid.${randomUUID()}`;

  const response = await postSignedWebhook(app, textMessagePayload(messageId, from, expected.text));
  assert.equal(response.statusCode, 200, `${expected.label}: webhook should ack with 200`);

  const leadRows = await db.select().from(leads).where(eq(leads.whatsappPhone, from));
  assert.equal(leadRows.length, 1, `${expected.label}: exactly one lead expected`);
  const lead = leadRows[0];
  assert.equal(lead.leadStatus, expected.expectedLeadStatus, `${expected.label}: lead_status`);
  assert.equal(lead.primaryCategory, expected.expectedClassification, `${expected.label}: primary_category`);

  const rows = await db.select().from(messageLog).where(eq(messageLog.leadId, lead.leadId));

  const inbound = rows.filter((row) => row.direction === "inbound");
  assert.equal(inbound.length, 1, `${expected.label}: exactly one inbound message_log row`);
  assert.equal(inbound[0].messageId, messageId, `${expected.label}: inbound row keyed by the WhatsApp message id`);
  assert.equal(inbound[0].classification, expected.expectedClassification, `${expected.label}: inbound classification`);

  // The outbound row proves which approved reply was selected. status is
  // "failed" because no WhatsApp credentials are set in the test env — the
  // selection is what is under test here, not delivery.
  const outbound = rows.filter((row) => row.direction === "outbound");
  assert.equal(outbound.length, 1, `${expected.label}: exactly one outbound reply attempt`);
  assert.equal(outbound[0].text, expected.expectedReply, `${expected.label}: approved reply text`);
  assert.equal(outbound[0].status, "failed", `${expected.label}: no reply is actually delivered in tests`);

  const escalationRows = await db.select().from(escalations).where(eq(escalations.leadId, lead.leadId));
  assert.equal(
    escalationRows.length,
    expected.expectsEscalation ? 1 : 0,
    `${expected.label}: escalation row presence`,
  );

  await app.close();
}

// §17 row 1
test("acceptance: appointment request creates an appointment_requested lead and asks for name/service/time", async () => {
  await runAcceptanceCase({
    label: "appointment_request",
    text: "Hi, I want an appointment on Saturday",
    expectedClassification: "appointment_request",
    expectedReply: NON_ESCALATION_REPLIES.appointment_request,
    expectedLeadStatus: "appointment_requested",
    expectsEscalation: false,
  });
});

// §17 row 2
test("acceptance: consultation fee question replies with the approved published pricing text only", async () => {
  await runAcceptanceCase({
    label: "published_pricing",
    text: "What is the consultation fee?",
    expectedClassification: "published_pricing",
    expectedReply: NON_ESCALATION_REPLIES.published_pricing,
    expectedLeadStatus: "acknowledged",
    expectsEscalation: false,
  });
});

// §17 row 3
test("acceptance: location/timings question replies only from approved location and hours", async () => {
  await runAcceptanceCase({
    label: "hours_location",
    text: "Where are you located and what are your timings?",
    expectedClassification: "hours_location",
    expectedReply: NON_ESCALATION_REPLIES.hours_location,
    expectedLeadStatus: "acknowledged",
    expectsEscalation: false,
  });
});

// §17 row 4
test("acceptance: service question offers a consultation without claiming suitability or outcomes", async () => {
  await runAcceptanceCase({
    label: "service_information",
    text: "Do you offer laser hair reduction?",
    expectedClassification: "service_information",
    expectedReply: NON_ESCALATION_REPLIES.service_information,
    expectedLeadStatus: "acknowledged",
    expectsEscalation: false,
  });
});

// §17 row 5 — safety-critical
test("acceptance: pregnancy-safety question escalates immediately and gives no medical advice", async () => {
  await runAcceptanceCase({
    label: "medical_or_urgent (pregnancy)",
    text: "Can I use this treatment while pregnant?",
    expectedClassification: "human_escalation",
    expectedReply: ESCALATION_REPLIES.medicalOrUrgent,
    expectedLeadStatus: "human_escalation",
    expectsEscalation: true,
  });
});

// §17 row 6 — safety-critical
test("acceptance: post-treatment symptom escalates immediately and gives no diagnosis", async () => {
  await runAcceptanceCase({
    label: "medical_or_urgent (redness)",
    text: "I got redness after treatment",
    expectedClassification: "human_escalation",
    expectedReply: ESCALATION_REPLIES.medicalOrUrgent,
    expectedLeadStatus: "human_escalation",
    expectsEscalation: true,
  });
});

// §17 row 7
test("acceptance: refund request escalates to staff with the approved complaint text", async () => {
  await runAcceptanceCase({
    label: "refund_dispute",
    text: "I want a refund",
    expectedClassification: "human_escalation",
    expectedReply: ESCALATION_REPLIES.complaint,
    expectedLeadStatus: "human_escalation",
    expectsEscalation: true,
  });
});

// §17 row 8
test("acceptance: explicit human request hands off with the approved reception text", async () => {
  await runAcceptanceCase({
    label: "human_request",
    text: "Talk to a person",
    expectedClassification: "human_escalation",
    expectedReply: ESCALATION_REPLIES.humanRequest,
    expectedLeadStatus: "human_escalation",
    expectsEscalation: true,
  });
});

// §17 row 9 — STOP must opt the lead out and send NOTHING back.
test("acceptance: STOP sets opted_out and sends no automated reply at all", async () => {
  const app = buildApp();
  const from = `9199${Math.floor(Math.random() * 1000000000).toString().padStart(9, "0")}`;
  const messageId = `wamid.${randomUUID()}`;

  const response = await postSignedWebhook(app, textMessagePayload(messageId, from, "STOP"));
  assert.equal(response.statusCode, 200);

  const leadRows = await db.select().from(leads).where(eq(leads.whatsappPhone, from));
  assert.equal(leadRows.length, 1, "STOP should still create/find the lead");
  assert.equal(leadRows[0].optedOut, true, "STOP must persist opted_out = true");

  const rows = await db.select().from(messageLog).where(eq(messageLog.leadId, leadRows[0].leadId));
  assert.equal(rows.length, 1, "STOP stores the inbound message only");
  assert.equal(rows[0].direction, "inbound");
  assert.equal(rows[0].classification, null, "a STOP message is never classified");
  assert.equal(
    rows.filter((row) => row.direction === "outbound").length,
    0,
    "STOP must never produce an outbound reply",
  );

  const escalationRows = await db.select().from(escalations).where(eq(escalations.leadId, leadRows[0].leadId));
  assert.equal(escalationRows.length, 0, "STOP must not create an escalation");

  await app.close();
});

// §17 row 10 (duplicate delivery) is already covered above by the
// "delivering the identical signed webhook twice" test — not repeated here.

// clearLeadOptOut: the only path anywhere that reverses an opt-out, and it
// is reachable only from the protected admin route. Proven here against a
// real database rather than only through the route's auth guard, because
// what matters is that the flag actually flips and that nothing else on
// the lead is disturbed.
test("acceptance: clearLeadOptOut reverses a STOP opt-out without resetting the case", async () => {
  const app = buildApp();
  const from = `9199902${Math.floor(Math.random() * 100000)}`;

  // Escalate first, so the lead carries real state we can prove survives.
  await postSignedWebhook(app, textMessagePayload(`wamid.${randomUUID()}`, from, "Talk to a person"));
  // Then opt out.
  await postSignedWebhook(app, textMessagePayload(`wamid.${randomUUID()}`, from, "STOP"));

  const beforeRows = await db.select().from(leads).where(eq(leads.whatsappPhone, from));
  assert.equal(beforeRows.length, 1);
  const before = beforeRows[0];
  assert.equal(before.optedOut, true, "STOP should have set opted_out");

  const cleared = await clearLeadOptOut(before.leadId);
  assert.equal(cleared, true);

  const afterRows = await db.select().from(leads).where(eq(leads.whatsappPhone, from));
  const after = afterRows[0];
  assert.equal(after.optedOut, false, "opt-out should be cleared");

  // Opting back in is not a reset of the case: everything else is untouched.
  assert.equal(after.leadStatus, before.leadStatus);
  assert.equal(after.primaryCategory, before.primaryCategory);
  assert.equal(after.escalationReason, before.escalationReason);

  const escalationRows = await db.select().from(escalations).where(eq(escalations.leadId, before.leadId));
  assert.equal(escalationRows.length, 1, "the escalation must survive opting back in");

  await app.close();
});

test("acceptance: clearLeadOptOut returns false for a lead that does not exist", async () => {
  const cleared = await clearLeadOptOut("00000000-0000-0000-0000-000000000000");
  assert.equal(cleared, false);
});

// ---------------------------------------------------------------------------
// Human takeover: an open escalation governs admissibility.
//
// Source A: an approved opening-hours reply exists.
// Source B: an unresolved escalation makes it inadmissible.
// Supervisor: the pre-send validator.
// Emerging truth: HUMAN_REQUIRED.
// Permitted action: the approved pending-escalation reply instead.
// ---------------------------------------------------------------------------

async function outboundTextsFor(leadId: string): Promise<string[]> {
  const rows = await db.select().from(messageLog).where(eq(messageLog.leadId, leadId));
  return rows.filter((row) => row.direction === "outbound").map((row) => row.text);
}

test("acceptance: open escalation replaces the ordinary reply with the approved pending reply, and resolving restores normal automation", async () => {
  const app = buildApp();
  const from = `9199903${Math.floor(Math.random() * 100000)}`;

  // 1. Escalate. This message must still receive its OWN escalation reply —
  //    asking for a human must never be answered with silence.
  await postSignedWebhook(app, textMessagePayload(`wamid.${randomUUID()}`, from, "Talk to a person"));

  const leadRows = await db.select().from(leads).where(eq(leads.whatsappPhone, from));
  assert.equal(leadRows.length, 1);
  const leadId = leadRows[0].leadId;
  assert.equal(leadRows[0].leadStatus, "human_escalation");

  let outbound = await outboundTextsFor(leadId);
  assert.deepEqual(outbound, [ESCALATION_REPLIES.humanRequest], "the escalating message gets its own escalation reply");

  // 2. An ordinary question while the escalation is still open.
  await postSignedWebhook(app, textMessagePayload(`wamid.${randomUUID()}`, from, "Where are you located and what are your timings?"));

  outbound = await outboundTextsFor(leadId);
  assert.equal(outbound.length, 2, "exactly one further reply was sent");
  assert.equal(outbound[1], PENDING_ESCALATION_REPLY, "the pending reply is sent");
  assert.ok(
    !outbound.includes(NON_ESCALATION_REPLIES.hours_location),
    "the ordinary hours reply must NOT be sent while an escalation is open"
  );

  // 3. Staff resolve the escalation. That is the release mechanism — there
  //    is no separate resume action.
  const openRows = await db.select().from(escalations).where(eq(escalations.leadId, leadId));
  assert.equal(openRows.length, 1);
  const result = await resolveEscalation(openRows[0].escalationId);
  assert.equal(result.remainingOpen, 0);
  assert.equal(result.leadReactivated, true);

  const afterResolve = await db.select().from(leads).where(eq(leads.leadId, leadId));
  assert.equal(afterResolve[0].leadStatus, "acknowledged", "the last open escalation resolving releases the lead");

  // 4. The same ordinary question now gets its normal approved reply.
  await postSignedWebhook(app, textMessagePayload(`wamid.${randomUUID()}`, from, "Where are you located and what are your timings?"));

  outbound = await outboundTextsFor(leadId);
  assert.equal(outbound.length, 3);
  assert.equal(outbound[2], NON_ESCALATION_REPLIES.hours_location, "normal automation resumes after resolution");

  // History survives throughout.
  const allEscalations = await db.select().from(escalations).where(eq(escalations.leadId, leadId));
  assert.equal(allEscalations.length, 1, "the escalation record is kept, not deleted");
  assert.equal(allEscalations[0].status, "resolved");

  await app.close();
});

test("acceptance: a lead with two open escalations stays held until the LAST one is resolved", async () => {
  const app = buildApp();
  const from = `9199904${Math.floor(Math.random() * 100000)}`;

  await postSignedWebhook(app, textMessagePayload(`wamid.${randomUUID()}`, from, "Talk to a person"));
  await postSignedWebhook(app, textMessagePayload(`wamid.${randomUUID()}`, from, "I want a refund"));

  const leadRows = await db.select().from(leads).where(eq(leads.whatsappPhone, from));
  const leadId = leadRows[0].leadId;

  const openRows = await db.select().from(escalations).where(eq(escalations.leadId, leadId));
  assert.equal(openRows.length, 2, "two separate escalations");

  // Resolving the first must NOT release the lead.
  const first = await resolveEscalation(openRows[0].escalationId);
  assert.equal(first.remainingOpen, 1);
  assert.equal(first.leadReactivated, false);

  const midway = await db.select().from(leads).where(eq(leads.leadId, leadId));
  assert.equal(midway[0].leadStatus, "human_escalation", "still held while another escalation is open");

  // Resolving the last one does.
  const second = await resolveEscalation(openRows[1].escalationId);
  assert.equal(second.remainingOpen, 0);
  assert.equal(second.leadReactivated, true);

  const after = await db.select().from(leads).where(eq(leads.leadId, leadId));
  assert.equal(after[0].leadStatus, "acknowledged");

  await app.close();
});

test("acceptance: resolving does not overwrite a status staff deliberately set", async () => {
  const app = buildApp();
  const from = `9199905${Math.floor(Math.random() * 100000)}`;

  await postSignedWebhook(app, textMessagePayload(`wamid.${randomUUID()}`, from, "Talk to a person"));
  const leadRows = await db.select().from(leads).where(eq(leads.whatsappPhone, from));
  const leadId = leadRows[0].leadId;

  // A staff member moves the lead on while the escalation is still open.
  await db.update(leads).set({ leadStatus: "staff_assigned" }).where(eq(leads.leadId, leadId));

  const openRows = await db.select().from(escalations).where(eq(escalations.leadId, leadId));
  const result = await resolveEscalation(openRows[0].escalationId);
  assert.equal(result.remainingOpen, 0);
  assert.equal(result.leadReactivated, false, "no reactivation: the lead was not in human_escalation");

  const after = await db.select().from(leads).where(eq(leads.leadId, leadId));
  assert.equal(after[0].leadStatus, "staff_assigned", "a deliberate staff status is never overwritten");

  await app.close();
});

test("acceptance: resolving the same escalation twice is idempotent", async () => {
  const app = buildApp();
  const from = `9199906${Math.floor(Math.random() * 100000)}`;

  await postSignedWebhook(app, textMessagePayload(`wamid.${randomUUID()}`, from, "Talk to a person"));
  const leadRows = await db.select().from(leads).where(eq(leads.whatsappPhone, from));
  const openRows = await db.select().from(escalations).where(eq(escalations.leadId, leadRows[0].leadId));

  const first = await resolveEscalation(openRows[0].escalationId);
  const second = await resolveEscalation(openRows[0].escalationId);

  assert.equal(first.leadReactivated, true);
  assert.equal(second.remainingOpen, 0);
  assert.equal(second.leadReactivated, false, "already acknowledged, so nothing to reactivate");

  await app.close();
});

// The locked missingness invariant, proven end-to-end rather than only in
// the pure validator: when escalation state CANNOT be established, the
// system invents neither permission nor an escalation. It sends nothing.
//
// The escalations table is renamed for the duration of this test so the
// lookup genuinely fails, then restored in a finally block. Nothing else
// in the pipeline touches that table for a non-escalating message.
test("acceptance: escalation state unavailable sends nothing at all — no ordinary reply, no pending reply", async () => {
  const app = buildApp();
  const from = `9199907${Math.floor(Math.random() * 100000)}`;

  // Establish the lead first, while the table is intact.
  await postSignedWebhook(app, textMessagePayload(`wamid.${randomUUID()}`, from, "What is the consultation fee?"));
  const leadRows = await db.select().from(leads).where(eq(leads.whatsappPhone, from));
  const leadId = leadRows[0].leadId;
  const before = await outboundTextsFor(leadId);
  assert.equal(before.length, 1, "the first message replied normally");

  const inboundMessageId = `wamid.${randomUUID()}`;
  try {
    await db.execute(sql`ALTER TABLE escalations RENAME TO escalations_hidden`);

    await postSignedWebhook(app, textMessagePayload(inboundMessageId, from, "Where are you located and what are your timings?"));
  } finally {
    await db.execute(sql`ALTER TABLE escalations_hidden RENAME TO escalations`);
  }

  const after = await outboundTextsFor(leadId);
  assert.equal(after.length, 1, "no outbound message row was written while escalation state was unknown");
  assert.ok(!after.includes(NON_ESCALATION_REPLIES.hours_location), "the ordinary reply must not be sent");
  assert.ok(!after.includes(PENDING_ESCALATION_REPLY), "the pending reply must not be sent either");

  // The inbound message is still recorded: we do not lose what the customer
  // said, we only decline to answer it.
  const inboundRows = await db.select().from(messageLog).where(eq(messageLog.messageId, inboundMessageId));
  assert.equal(inboundRows.length, 1, "the customer's message is still captured");
  assert.equal(inboundRows[0].direction, "inbound");

  await app.close();
});
