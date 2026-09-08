import { test } from "node:test";
import assert from "node:assert/strict";
import { validateBeforeSend } from "./preSendValidator.js";

// The validator is pure, so every rule is provable without a database.
// These assert the full decision — state, permitted reply, and reason —
// because the state alone does not say what the customer receives.

test("no restriction: ordinary approved reply is permitted", () => {
  const result = validateBeforeSend({ optedOut: false, openEscalationStatus: "none" });
  assert.equal(result.state, "VALID");
  assert.equal(result.permittedReply, "ordinary");
});

test("observed open escalation: pending reply replaces the ordinary reply", () => {
  const result = validateBeforeSend({ optedOut: false, openEscalationStatus: "open" });
  assert.equal(result.state, "HUMAN_REQUIRED");
  assert.equal(result.permittedReply, "pending_escalation");
});

// The locked missingness invariant: unknown stays unknown. A failed lookup
// must not be reported as an observed escalation, and must not be reported
// as no escalation either.
test("escalation state unavailable: INCOMPLETE, and nothing at all is sent", () => {
  const result = validateBeforeSend({ optedOut: false, openEscalationStatus: "escalation_state_unavailable" });
  assert.equal(result.state, "INCOMPLETE");
  assert.equal(result.permittedReply, "none");
  assert.equal(result.reason, "escalation_state_unavailable");
});

test("escalation state unavailable is INCOMPLETE, never BLOCKED", () => {
  const result = validateBeforeSend({ optedOut: false, openEscalationStatus: "escalation_state_unavailable" });
  // BLOCKED would assert that an explicit rule prohibited the send. No rule
  // fired — a required fact could not be read. Recording BLOCKED would put
  // a restriction in the audit trail that was never observed.
  assert.notEqual(result.state, "BLOCKED");
});

test("unavailable state must not send the pending reply, which asserts an unverified fact", () => {
  const result = validateBeforeSend({ optedOut: false, openEscalationStatus: "escalation_state_unavailable" });
  // The pending reply says a message is awaiting review. That is precisely
  // what could not be established.
  assert.notEqual(result.permittedReply, "pending_escalation");
});

test("opted out: nothing is sent even when no escalation is open", () => {
  const result = validateBeforeSend({ optedOut: true, openEscalationStatus: "none" });
  assert.equal(result.state, "BLOCKED");
  assert.equal(result.permittedReply, "none");
});

// Rule order is part of the contract: opt-out is the customer's own
// standing instruction and outranks every internal operating state.
test("opt-out outranks an open escalation: not even the pending reply is sent", () => {
  const result = validateBeforeSend({ optedOut: true, openEscalationStatus: "open" });
  assert.equal(result.state, "BLOCKED");
  assert.equal(result.permittedReply, "none");
});

test("opt-out outranks unavailable escalation state", () => {
  const result = validateBeforeSend({ optedOut: true, openEscalationStatus: "escalation_state_unavailable" });
  assert.equal(result.state, "BLOCKED");
  assert.equal(result.permittedReply, "none");
});
