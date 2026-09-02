import { test } from "node:test";
import assert from "node:assert/strict";
import { buildApp } from "../app.js";

// These cases are all resolved before any database access happens (Meta
// verify-token check and HMAC signature check both short-circuit first),
// so they're deterministic without a live database — matching this
// project's existing dedupe-gated pipeline order.

test("GET /webhook with the correct verify token echoes the challenge (Meta verification, Section 13/14)", async () => {
  const app = buildApp();
  const response = await app.inject({
    method: "GET",
    url: "/webhook?hub.mode=subscribe&hub.verify_token=test-verify-token&hub.challenge=12345",
  });
  assert.equal(response.statusCode, 200);
  assert.equal(response.body, "12345");
  await app.close();
});

test("GET /webhook with the wrong verify token is rejected", async () => {
  const app = buildApp();
  const response = await app.inject({
    method: "GET",
    url: "/webhook?hub.mode=subscribe&hub.verify_token=wrong-token&hub.challenge=12345",
  });
  assert.equal(response.statusCode, 403);
  await app.close();
});

test("POST /webhook with no signature header is rejected before any processing", async () => {
  const app = buildApp();
  const response = await app.inject({
    method: "POST",
    url: "/webhook",
    payload: JSON.stringify({ object: "whatsapp_business_account", entry: [] }),
    headers: { "content-type": "application/json" },
  });
  assert.equal(response.statusCode, 401);
  await app.close();
});

test("POST /webhook with an incorrect signature is rejected", async () => {
  const app = buildApp();
  const response = await app.inject({
    method: "POST",
    url: "/webhook",
    payload: JSON.stringify({ object: "whatsapp_business_account", entry: [] }),
    headers: {
      "content-type": "application/json",
      "x-hub-signature-256": "sha256=0000000000000000000000000000000000000000000000000000000000000000",
    },
  });
  assert.equal(response.statusCode, 401);
  await app.close();
});
