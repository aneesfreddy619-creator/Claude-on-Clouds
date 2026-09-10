import { test } from "node:test";
import assert from "node:assert/strict";
import { buildApp } from "../app.js";
import { serializeError, flattenErrorForLogging, statusMessageFromQuery } from "./admin.js";

// Auth gating happens before any database access, so it is deterministic
// without a live database. Successful-auth data rendering is NOT tested
// here since it requires a real Postgres connection this environment
// doesn't have — see the report's "remaining risks/unknowns" section.

test("GET /admin with no credentials is rejected", async () => {
  const app = buildApp();
  const response = await app.inject({ method: "GET", url: "/admin" });
  assert.equal(response.statusCode, 401);
  await app.close();
});

test("GET /admin with the wrong credentials is rejected", async () => {
  const app = buildApp();
  const credentials = Buffer.from("wrong-user:wrong-password").toString("base64");
  const response = await app.inject({
    method: "GET",
    url: "/admin",
    headers: { authorization: `Basic ${credentials}` },
  });
  assert.equal(response.statusCode, 401);
  await app.close();
});

test("POST /admin/leads/:leadId/delete with no credentials is rejected (same auth as GET /admin)", async () => {
  const app = buildApp();
  const response = await app.inject({
    method: "POST",
    url: "/admin/leads/00000000-0000-0000-0000-000000000000/delete",
  });
  assert.equal(response.statusCode, 401);
  await app.close();
});

test("POST /admin/leads/:leadId/delete with valid credentials but a malformed lead id is rejected before touching the database", async () => {
  const app = buildApp();
  const credentials = Buffer.from("test-admin:test-admin-password").toString("base64");
  const response = await app.inject({
    method: "POST",
    url: "/admin/leads/not-a-uuid/delete",
    headers: { authorization: `Basic ${credentials}` },
  });
  assert.equal(response.statusCode, 302);
  assert.equal(response.headers.location, "/admin?error=invalid_lead_id");
  await app.close();
});

// DATABASE_URL (set by the "test" npm script) points at an unreachable
// address, so an authorized GET /admin genuinely exercises the
// admin_data_fetch_failed catch path. This is exactly the regression this
// change targets: the response behavior seen by a caller must stay a
// plain 500 (unchanged), even though the *logged* detail behind it is now
// richer (see the serializeError unit tests below).
test("GET /admin with correct credentials still returns 500 (unchanged HTTP behavior) when the database is unreachable", async () => {
  const app = buildApp();
  const credentials = Buffer.from("test-admin:test-admin-password").toString("base64");
  const response = await app.inject({
    method: "GET",
    url: "/admin",
    headers: { authorization: `Basic ${credentials}` },
  });
  assert.equal(response.statusCode, 500);
  await app.close();
});

test("serializeError captures name/message for a plain Error with no cause or code", () => {
  const result = serializeError(new Error("plain failure"));
  assert.equal(result.name, "Error");
  assert.equal(result.message, "plain failure");
  assert.equal(result.code, undefined);
  assert.equal(result.cause, undefined);
});

test("serializeError captures a string error code (e.g. a driver/SQLSTATE code) when present", () => {
  const error = Object.assign(new Error("connection refused"), { code: "ECONNREFUSED" });
  const result = serializeError(error);
  assert.equal(result.code, "ECONNREFUSED");
});

test("serializeError walks .cause to expose the underlying driver error Drizzle wraps", () => {
  const driverError = Object.assign(new Error("relation \"leads\" does not exist"), {
    name: "PostgresError",
    code: "42P01",
  });
  const wrapperError = Object.assign(new Error('Failed query: select ... from "leads" ...\nparams: 50'), {
    cause: driverError,
  });

  const result = serializeError(wrapperError);
  assert.equal(result.name, "Error");
  assert.match(result.message, /Failed query/);
  assert.ok(result.cause, "expected the wrapper's cause to be captured");
  assert.equal(result.cause?.name, "PostgresError");
  assert.equal(result.cause?.message, 'relation "leads" does not exist');
  assert.equal(result.cause?.code, "42P01");
});

test("serializeError handles a non-Error thrown value without crashing", () => {
  const result = serializeError("just a string");
  assert.equal(result.name, "UnknownError");
  assert.equal(result.message, "just a string");
});

// flattenErrorForLogging exists specifically because a nested "error"
// object attribute was observed on Railway rendering as only its own
// .message, hiding the .cause detail — see admin_data_fetch_failed. These
// assert every field lands as its own TOP-LEVEL key, not nested under an
// "error" (or any other) object.
test("flattenErrorForLogging puts error_name/error_message at the top level for a plain error with no cause/code", () => {
  const fields = flattenErrorForLogging(new Error("plain failure"));
  assert.equal(fields.error_name, "Error");
  assert.equal(fields.error_message, "plain failure");
  assert.equal(fields.error_code, undefined);
  assert.equal(fields.cause_name, undefined);
  assert.equal(fields.cause_message, undefined);
  assert.equal(fields.cause_code, undefined);
  assert.equal((fields as { error?: unknown }).error, undefined, "must not also nest the fields under an 'error' key");
});

test("flattenErrorForLogging includes error_code at the top level when present", () => {
  const error = Object.assign(new Error("connection refused"), { code: "ECONNREFUSED" });
  const fields = flattenErrorForLogging(error);
  assert.equal(fields.error_code, "ECONNREFUSED");
});

test("flattenErrorForLogging exposes the Drizzle-wrapped driver cause as top-level cause_name/cause_message/cause_code", () => {
  const driverError = Object.assign(new Error('relation "leads" does not exist'), {
    name: "PostgresError",
    code: "42P01",
  });
  const wrapperError = Object.assign(new Error('Failed query: select ... from "leads" ...\nparams: 50'), {
    cause: driverError,
  });

  const fields = flattenErrorForLogging(wrapperError);
  assert.equal(fields.error_name, "Error");
  assert.match(fields.error_message, /Failed query/);
  assert.equal(fields.cause_name, "PostgresError");
  assert.equal(fields.cause_message, 'relation "leads" does not exist');
  assert.equal(fields.cause_code, "42P01");
});

test("flattenErrorForLogging handles a non-Error thrown value without crashing", () => {
  const fields = flattenErrorForLogging("just a string");
  assert.equal(fields.error_name, "UnknownError");
  assert.equal(fields.error_message, "just a string");
});

// Opt-out clearing: same fail-closed auth and UUID guard as the delete
// route above. Both checks resolve before any database access, so they are
// deterministic without a live database.
test("POST /admin/leads/:leadId/opt-in with no credentials is rejected (same auth as GET /admin)", async () => {
  const app = buildApp();
  const response = await app.inject({
    method: "POST",
    url: "/admin/leads/00000000-0000-0000-0000-000000000000/opt-in",
  });
  assert.equal(response.statusCode, 401);
  await app.close();
});

test("POST /admin/leads/:leadId/opt-in with the wrong credentials is rejected", async () => {
  const app = buildApp();
  const credentials = Buffer.from("wrong-user:wrong-password").toString("base64");
  const response = await app.inject({
    method: "POST",
    url: "/admin/leads/00000000-0000-0000-0000-000000000000/opt-in",
    headers: { authorization: `Basic ${credentials}` },
  });
  assert.equal(response.statusCode, 401);
  await app.close();
});

test("POST /admin/leads/:leadId/opt-in with valid credentials but a malformed lead id is rejected before touching the database", async () => {
  const app = buildApp();
  const credentials = Buffer.from("test-admin:test-admin-password").toString("base64");
  const response = await app.inject({
    method: "POST",
    url: "/admin/leads/not-a-uuid/opt-in",
    headers: { authorization: `Basic ${credentials}` },
  });
  assert.equal(response.statusCode, 302);
  assert.equal(response.headers.location, "/admin?error=invalid_lead_id");
  await app.close();
});

// Escalation resolve: same fail-closed auth and UUID guard as the routes
// above. Both checks resolve before any database access.
test("POST /admin/escalations/:escalationId/resolve with no credentials is rejected", async () => {
  const app = buildApp();
  const response = await app.inject({
    method: "POST",
    url: "/admin/escalations/00000000-0000-0000-0000-000000000000/resolve",
  });
  assert.equal(response.statusCode, 401);
  await app.close();
});

test("POST /admin/escalations/:escalationId/resolve with the wrong credentials is rejected", async () => {
  const app = buildApp();
  const credentials = Buffer.from("wrong-user:wrong-password").toString("base64");
  const response = await app.inject({
    method: "POST",
    url: "/admin/escalations/00000000-0000-0000-0000-000000000000/resolve",
    headers: { authorization: `Basic ${credentials}` },
  });
  assert.equal(response.statusCode, 401);
  await app.close();
});

test("POST /admin/escalations/:escalationId/resolve with a malformed id is rejected before touching the database", async () => {
  const app = buildApp();
  const credentials = Buffer.from("test-admin:test-admin-password").toString("base64");
  const response = await app.inject({
    method: "POST",
    url: "/admin/escalations/not-a-uuid/resolve",
    headers: { authorization: `Basic ${credentials}` },
  });
  assert.equal(response.statusCode, 302);
  assert.equal(response.headers.location, "/admin?error=invalid_escalation_id");
  await app.close();
});

// ---------------------------------------------------------------------------
// Transport. Every admin POST test above injects without a Content-Type, so
// Fastify never invokes a body parser and the handler runs regardless: those
// tests exercise the routes but not the transport. A browser form always
// sends application/x-www-form-urlencoded, which Fastify has no built-in
// parser for, so all three actions returned 415 before reaching a handler.
// The tests below send the header a browser actually sends. Reaching the
// handler's own redirect is the proof the parser ran.
// ---------------------------------------------------------------------------

const FORM_CONTENT_TYPE = "application/x-www-form-urlencoded";

test("form-encoded POST to clear opt-out reaches the handler instead of failing with 415", async () => {
  const app = buildApp();
  const credentials = Buffer.from("test-admin:test-admin-password").toString("base64");
  const response = await app.inject({
    method: "POST",
    url: "/admin/leads/not-a-uuid/opt-in",
    headers: { authorization: `Basic ${credentials}`, "content-type": FORM_CONTENT_TYPE },
    payload: "",
  });
  assert.notEqual(response.statusCode, 415);
  assert.equal(response.statusCode, 302);
  assert.equal(response.headers.location, "/admin?error=invalid_lead_id");
  await app.close();
});

test("form-encoded POST to delete a lead reaches the handler instead of failing with 415", async () => {
  const app = buildApp();
  const credentials = Buffer.from("test-admin:test-admin-password").toString("base64");
  const response = await app.inject({
    method: "POST",
    url: "/admin/leads/not-a-uuid/delete",
    headers: { authorization: `Basic ${credentials}`, "content-type": FORM_CONTENT_TYPE },
    payload: "",
  });
  assert.notEqual(response.statusCode, 415);
  assert.equal(response.statusCode, 302);
  assert.equal(response.headers.location, "/admin?error=invalid_lead_id");
  await app.close();
});

// One registration is meant to cover all three actions. These three tests
// prove that rather than asserting it.
test("form-encoded POST to resolve an escalation reaches the handler instead of failing with 415", async () => {
  const app = buildApp();
  const credentials = Buffer.from("test-admin:test-admin-password").toString("base64");
  const response = await app.inject({
    method: "POST",
    url: "/admin/escalations/not-a-uuid/resolve",
    headers: { authorization: `Basic ${credentials}`, "content-type": FORM_CONTENT_TYPE },
    payload: "",
  });
  assert.notEqual(response.statusCode, 415);
  assert.equal(response.statusCode, 302);
  assert.equal(response.headers.location, "/admin?error=invalid_escalation_id");
  await app.close();
});

// Accepting the content type must not put a parser ahead of the auth gate.
test("an unauthenticated form-encoded POST is still rejected with 401, not parsed into the handler", async () => {
  const app = buildApp();
  const response = await app.inject({
    method: "POST",
    url: "/admin/leads/00000000-0000-0000-0000-000000000000/opt-in",
    headers: { "content-type": FORM_CONTENT_TYPE },
    payload: "",
  });
  assert.equal(response.statusCode, 401);
  assert.match(response.headers["www-authenticate"] as string, /^Basic realm=/);
  await app.close();
});

// Today's forms are bare submit buttons with no named inputs, so the body is
// empty and every value travels in the URL path. This guards the day one of
// them gains a field: a populated body must not change the outcome.
test("a form-encoded POST carrying a field still reaches the same handler behavior", async () => {
  const app = buildApp();
  const credentials = Buffer.from("test-admin:test-admin-password").toString("base64");
  const response = await app.inject({
    method: "POST",
    url: "/admin/leads/not-a-uuid/opt-in",
    headers: { authorization: `Basic ${credentials}`, "content-type": FORM_CONTENT_TYPE },
    payload: "confirm=yes",
  });
  assert.notEqual(response.statusCode, 415);
  assert.equal(response.statusCode, 302);
  assert.equal(response.headers.location, "/admin?error=invalid_lead_id");
  await app.close();
});

// The parser is registered on the admin plugin's encapsulated instance. If it
// ever leaks to the root, POST /webhook would begin accepting form-encoded
// bodies without its raw-body JSON parser running — signature verification
// would then hash an empty buffer and fail closed, but the webhook's accepted
// content types would have widened for no reason. This test fails if that
// happens.
test("POST /webhook still rejects form-encoded bodies with 415 (admin parser stayed encapsulated)", async () => {
  const app = buildApp();
  const response = await app.inject({
    method: "POST",
    url: "/webhook",
    headers: { "content-type": FORM_CONTENT_TYPE },
    payload: "object=whatsapp_business_account",
  });
  assert.equal(response.statusCode, 415);
  await app.close();
});

// ---------------------------------------------------------------------------
// Admin status line. Every branch is a claim shown to staff and must be
// traceable to a fact the acting route actually reported.
// ---------------------------------------------------------------------------

test("clearing an opt-out reports success rather than a blank status line", () => {
  const message = statusMessageFromQuery({ opted_in: "1" });
  assert.equal(message?.kind, "success");
  assert.match(message?.text ?? "", /Opt-out cleared/);
});

test("a failed opt-out clear reports an error rather than a blank status line", () => {
  const message = statusMessageFromQuery({ error: "opt_in_failed" });
  assert.equal(message?.kind, "error");
  assert.match(message?.text ?? "", /Could not clear the opt-out/);
});

// resolveEscalation returns remainingOpen AND leadReactivated because
// leadReactivated === false covers two opposite situations. The status line
// must not collapse them.
test("resolve with another escalation still open says replies remain held", () => {
  const message = statusMessageFromQuery({ resolved: "1", remaining: "1", reactivated: "0" });
  assert.match(message?.text ?? "", /Another escalation is still open/);
});

test("resolve of the last escalation on an escalated lead reports the hold released, not that replies will be sent", () => {
  const message = statusMessageFromQuery({ resolved: "1", remaining: "0", reactivated: "1" });
  assert.match(message?.text ?? "", /returned to acknowledged/);
  assert.doesNotMatch(message?.text ?? "", /still open/);
});

test("resolve of the last escalation on a staff-set lead must not claim another is open", () => {
  // remainingOpen === 0 and leadReactivated === false: no escalation remains,
  // and the lead's status was deliberately not human_escalation. Claiming
  // "another escalation is still open" here is wrong on both counts — no
  // escalation remains, and the open-escalation hold does not apply.
  const message = statusMessageFromQuery({ resolved: "1", remaining: "0", reactivated: "0" });
  assert.doesNotMatch(message?.text ?? "", /still open/);
  assert.doesNotMatch(message?.text ?? "", /remain held/);
  assert.match(message?.text ?? "", /was not human_escalation/);
});
