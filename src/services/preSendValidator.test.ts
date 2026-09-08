import { test } from "node:test";
import assert from "node:assert/strict";
import { validateBeforeSend } from "./preSendValidator.js";

// The validator is pure, so every rule is provable without a database.
// These assert the full decision — state, permitted reply, and reason —
// because the state alone does not say what the customer receives.

test("no restriction: ordinary approved reply is permitted", () => {
  const result = validateBeforeSend({ optedOut: false, openEscalationStatus: "none", leadStatus: "acknowledged", escalationRecordedThisMessage: false });
  assert.equal(result.state, "VALID");
  assert.equal(result.permittedReply, "ordinary");
});

test("observed open escalation: pending reply replaces the ordinary reply", () => {
  const result = validateBeforeSend({ optedOut: false, openEscalationStatus: "open", leadStatus: "human_escalation", escalationRecordedThisMessage: false });
  assert.equal(result.state, "HUMAN_REQUIRED");
  assert.equal(result.permittedReply, "pending_escalation");
});

// The locked missingness invariant: unknown stays unknown. A failed lookup
// must not be reported as an observed escalation, and must not be reported
// as no escalation either.
test("escalation state unavailable: INCOMPLETE, and nothing at all is sent", () => {
  const result = validateBeforeSend({ optedOut: false, openEscalationStatus: "escalation_state_unavailable", leadStatus: "human_escalation", escalationRecordedThisMessage: false });
  assert.equal(result.state, "INCOMPLETE");
  assert.equal(result.permittedReply, "none");
  assert.equal(result.reason, "escalation_state_unavailable");
});

test("escalation state unavailable is INCOMPLETE, never BLOCKED", () => {
  const result = validateBeforeSend({ optedOut: false, openEscalationStatus: "escalation_state_unavailable", leadStatus: "human_escalation", escalationRecordedThisMessage: false });
  // BLOCKED would assert that an explicit rule prohibited the send. No rule
  // fired — a required fact could not be read. Recording BLOCKED would put
  // a restriction in the audit trail that was never observed.
  assert.notEqual(result.state, "BLOCKED");
});

test("unavailable state must not send the pending reply, which asserts an unverified fact", () => {
  const result = validateBeforeSend({ optedOut: false, openEscalationStatus: "escalation_state_unavailable", leadStatus: "human_escalation", escalationRecordedThisMessage: false });
  // The pending reply says a message is awaiting review. That is precisely
  // what could not be established.
  assert.notEqual(result.permittedReply, "pending_escalation");
});

test("opted out: nothing is sent even when no escalation is open", () => {
  const result = validateBeforeSend({ optedOut: true, openEscalationStatus: "none", leadStatus: "acknowledged", escalationRecordedThisMessage: false });
  assert.equal(result.state, "BLOCKED");
  assert.equal(result.permittedReply, "none");
});

// Rule order is part of the contract: opt-out is the customer's own
// standing instruction and outranks every internal operating state.
test("opt-out outranks an open escalation: not even the pending reply is sent", () => {
  const result = validateBeforeSend({ optedOut: true, openEscalationStatus: "open", leadStatus: "human_escalation", escalationRecordedThisMessage: false });
  assert.equal(result.state, "BLOCKED");
  assert.equal(result.permittedReply, "none");
});

test("opt-out outranks unavailable escalation state", () => {
  const result = validateBeforeSend({ optedOut: true, openEscalationStatus: "escalation_state_unavailable", leadStatus: "human_escalation", escalationRecordedThisMessage: false });
  assert.equal(result.state, "BLOCKED");
  assert.equal(result.permittedReply, "none");
});

// ---------------------------------------------------------------------------
// Contradiction: the lead row says a human owns the case, the escalations
// table says otherwise, and this message did not just record one.
// ---------------------------------------------------------------------------

test("escalated lead with no open escalation, not recorded this message: CONTRADICTORY, nothing sent", () => {
  const result = validateBeforeSend({
    optedOut: false,
    openEscalationStatus: "none",
    leadStatus: "human_escalation",
    escalationRecordedThisMessage: false,
  });
  assert.equal(result.state, "CONTRADICTORY");
  assert.equal(result.permittedReply, "none");
  assert.equal(result.reason, "escalated_lead_without_open_escalation");
});

// The healthy escalating message: its pre-message lookup is also "none",
// because the lookup deliberately runs before the row is written. What
// separates it from the stranded lead is that the write succeeded.
test("escalating message whose escalation WAS recorded still sends its own escalation reply", () => {
  const result = validateBeforeSend({
    optedOut: false,
    openEscalationStatus: "none",
    leadStatus: "human_escalation",
    escalationRecordedThisMessage: true,
  });
  assert.equal(result.state, "VALID");
  assert.equal(result.permittedReply, "ordinary");
});

test("a resolved lead (acknowledged) with no open escalation is not a contradiction", () => {
  const result = validateBeforeSend({
    optedOut: false,
    openEscalationStatus: "none",
    leadStatus: "acknowledged",
    escalationRecordedThisMessage: false,
  });
  assert.equal(result.state, "VALID");
});

test("opt-out outranks the contradiction rule", () => {
  const result = validateBeforeSend({
    optedOut: true,
    openEscalationStatus: "none",
    leadStatus: "human_escalation",
    escalationRecordedThisMessage: false,
  });
  assert.equal(result.state, "BLOCKED");
  assert.equal(result.permittedReply, "none");
});

test("unavailable escalation state outranks the contradiction rule", () => {
  const result = validateBeforeSend({
    optedOut: false,
    openEscalationStatus: "escalation_state_unavailable",
    leadStatus: "human_escalation",
    escalationRecordedThisMessage: false,
  });
  assert.equal(result.state, "INCOMPLETE");
});

test("an observed open escalation is HUMAN_REQUIRED, never CONTRADICTORY", () => {
  const result = validateBeforeSend({
    optedOut: false,
    openEscalationStatus: "open",
    leadStatus: "human_escalation",
    escalationRecordedThisMessage: false,
  });
  assert.equal(result.state, "HUMAN_REQUIRED");
  assert.equal(result.permittedReply, "pending_escalation");
});
