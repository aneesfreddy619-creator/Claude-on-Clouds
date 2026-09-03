import { test } from "node:test";
import assert from "node:assert/strict";
import { buildApp } from "../app.js";
import { serializeError, flattenErrorForLogging } from "./admin.js";

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
