import { test } from "node:test";
import assert from "node:assert/strict";
import { isStopMessage } from "./stopDetection.js";

// Section 15 acceptance test: "STOP" -> opted_out. Matching rule: trimmed,
// case-insensitive, exact match only.
test("exact STOP variants (case/whitespace) are matched", () => {
  const matches = ["STOP", "stop", "Stop", "  stop  ", " StOp "];
  for (const text of matches) {
    assert.equal(isStopMessage(text), true, `"${text}" should match`);
  }
});

test("STOP as part of a longer message is NOT matched (must be the whole message)", () => {
  const nonMatches = ["please stop", "stopping by", "stop it", "", "STOP!"];
  for (const text of nonMatches) {
    assert.equal(isStopMessage(text), false, `"${text}" should not match`);
  }
});
