import { test } from "node:test";
import assert from "node:assert/strict";
import { classifyMessage } from "./classifier.js";

// Section 15 "Acceptance tests" of clinic-lead-desk-v0-product-instructions.md
// — the exact test messages and expected categories from the product
// instructions themselves (the locked source of truth), not restated from
// any other document.
test("Section 15 acceptance messages classify into the expected category", () => {
  const cases: Array<{ text: string; expectedCategory: string; expectedEscalationReason?: string }> = [
    { text: "Hi, I want an appointment on Saturday", expectedCategory: "appointment_request" },
    { text: "What is the consultation fee?", expectedCategory: "published_pricing" },
    { text: "Where are you located and what are your timings?", expectedCategory: "hours_location" },
    { text: "Do you offer laser hair reduction?", expectedCategory: "service_information" },
    { text: "Can I use this treatment while pregnant?", expectedCategory: "human_escalation", expectedEscalationReason: "medical_or_urgent" },
    { text: "I got redness after treatment", expectedCategory: "human_escalation", expectedEscalationReason: "medical_or_urgent" },
    { text: "I want a refund", expectedCategory: "human_escalation", expectedEscalationReason: "refund_dispute" },
    { text: "Talk to a person", expectedCategory: "human_escalation", expectedEscalationReason: "human_request" },
  ];

  for (const testCase of cases) {
    const result = classifyMessage(testCase.text);
    assert.equal(result.category, testCase.expectedCategory, `category for "${testCase.text}"`);
    if (testCase.expectedEscalationReason) {
      assert.equal(result.escalationReason, testCase.expectedEscalationReason, `escalation reason for "${testCase.text}"`);
    }
  }
});

test("existing_appointment is distinguished from a new appointment_request", () => {
  const result = classifyMessage("I'd like to reschedule my appointment");
  assert.equal(result.category, "existing_appointment");
});

test("an unmatched message escalates as unclear_intent rather than guessing a category", () => {
  const result = classifyMessage("asdkjaslkdjaslkdj random gibberish");
  assert.equal(result.category, "human_escalation");
  assert.equal(result.escalationReason, "unclear_intent");
});

test("medical/urgent keywords always win priority over a lower-priority category match in the same message", () => {
  // Contains both a pricing word ("cost") and a medical-safety word
  // ("pregnant") — safety must win regardless of ordering.
  const result = classifyMessage("What is the cost, and is it safe while pregnant?");
  assert.equal(result.category, "human_escalation");
  assert.equal(result.escalationReason, "medical_or_urgent");
});
