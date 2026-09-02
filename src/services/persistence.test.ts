import { test } from "node:test";
import assert from "node:assert/strict";
import { computeLeadStatus } from "./persistence.js";

// Section 10 lead_status enum safety rules — deterministic, no DB needed.
test("human_escalation always wins, regardless of current status", () => {
  assert.equal(computeLeadStatus("new", "human_escalation"), "human_escalation");
  assert.equal(computeLeadStatus("appointment_requested", "human_escalation"), "human_escalation");
  assert.equal(computeLeadStatus("closed", "human_escalation"), "human_escalation");
});

test("automation never reopens a closed lead for a non-escalation message", () => {
  assert.equal(computeLeadStatus("closed", "hours_location"), "closed");
  assert.equal(computeLeadStatus("closed", "appointment_request"), "closed");
});

test("automation never overrides an active, unresolved escalation for a non-escalation message", () => {
  assert.equal(computeLeadStatus("human_escalation", "hours_location"), "human_escalation");
});

test("appointment_request moves a lead to appointment_requested", () => {
  assert.equal(computeLeadStatus("new", "appointment_request"), "appointment_requested");
  assert.equal(computeLeadStatus("acknowledged", "appointment_request"), "appointment_requested");
});

test("a brand-new lead's first non-appointment message moves it to acknowledged", () => {
  assert.equal(computeLeadStatus("new", "hours_location"), "acknowledged");
  assert.equal(computeLeadStatus("new", "published_pricing"), "acknowledged");
});

test("automation never downgrades a staff-advanced status for a non-appointment message", () => {
  assert.equal(computeLeadStatus("qualified", "hours_location"), "qualified");
  assert.equal(computeLeadStatus("staff_assigned", "published_pricing"), "staff_assigned");
});
