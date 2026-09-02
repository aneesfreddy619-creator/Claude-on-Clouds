import { test } from "node:test";
import assert from "node:assert/strict";
import { buildApp } from "../app.js";

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
