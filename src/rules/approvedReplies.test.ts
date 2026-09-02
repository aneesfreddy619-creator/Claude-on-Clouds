import { test } from "node:test";
import assert from "node:assert/strict";
import { NON_ESCALATION_REPLIES, ESCALATION_REPLIES, selectApprovedReply } from "./approvedReplies.js";
import type { ClassificationResult, EnquiryCategory, EscalationReason } from "./classifier.js";

// These expectations are sourced from the codebase's own exported reply
// constants (NON_ESCALATION_REPLIES / ESCALATION_REPLIES), which were
// copied verbatim from Sections 8/9 of clinic-lead-desk-v0-product-
// instructions.md — not restated independently from any other document.
// This test asserts selectApprovedReply's routing logic matches those
// constants exactly; it does not re-derive the reply text itself.

function classification(category: EnquiryCategory, escalationReason: EscalationReason | null = null): ClassificationResult {
  return { category, escalationReason, matchedRule: "test", languageHint: "english" };
}

test("non-escalation categories return their own approved reply text and requiredAction 'reply'", () => {
  const categories: Exclude<EnquiryCategory, "human_escalation">[] = [
    "appointment_request",
    "published_pricing",
    "service_information",
    "hours_location",
    "existing_appointment",
  ];
  for (const category of categories) {
    const result = selectApprovedReply(classification(category));
    assert.equal(result.text, NON_ESCALATION_REPLIES[category]);
    assert.equal(result.requiredAction, "reply");
  }
});

test("medical_or_urgent uses the medical reply text and requiredAction 'clinical team review'", () => {
  const result = selectApprovedReply(classification("human_escalation", "medical_or_urgent"));
  assert.equal(result.text, ESCALATION_REPLIES.medicalOrUrgent);
  assert.equal(result.requiredAction, "clinical team review");
});

test("complaint/refund/privacy/abuse all use the complaint reply text and requiredAction 'review complaint'", () => {
  const reasons: EscalationReason[] = ["complaint", "refund_dispute", "privacy_or_legal", "abusive_language"];
  for (const reason of reasons) {
    const result = selectApprovedReply(classification("human_escalation", reason));
    assert.equal(result.text, ESCALATION_REPLIES.complaint, `reply text for ${reason}`);
    assert.equal(result.requiredAction, "review complaint", `requiredAction for ${reason}`);
  }
});

test("human_request/custom_quote/unclear_intent all use the human_request reply text and requiredAction 'reply'", () => {
  const reasons: EscalationReason[] = ["human_request", "custom_quote_or_discount_or_guarantee", "unclear_intent"];
  for (const reason of reasons) {
    const result = selectApprovedReply(classification("human_escalation", reason));
    assert.equal(result.text, ESCALATION_REPLIES.humanRequest, `reply text for ${reason}`);
    assert.equal(result.requiredAction, "reply", `requiredAction for ${reason}`);
  }
});

test("no code path ever assigns requiredAction 'call' automatically", () => {
  const allReasons: EscalationReason[] = [
    "medical_or_urgent",
    "complaint",
    "refund_dispute",
    "privacy_or_legal",
    "abusive_language",
    "human_request",
    "custom_quote_or_discount_or_guarantee",
    "unclear_intent",
  ];
  for (const reason of allReasons) {
    const result = selectApprovedReply(classification("human_escalation", reason));
    assert.notEqual(result.requiredAction, "call");
  }
});
