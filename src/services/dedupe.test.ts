import { test } from "node:test";
import assert from "node:assert/strict";
import { checkDedupeStatus } from "./dedupe.js";

// This test relies on DATABASE_URL (set by the "test" npm script) pointing
// at an unreachable address, so the query genuinely fails. That is the
// actual safety property worth testing here: a failed dedupe lookup must
// resolve to "dedupe_unavailable" — a distinct, fail-closed value — never
// throw uncaught, and never silently resolve as "not_duplicate" (which
// would risk a second reply for an already-seen message, per Section 15's
// "same webhook delivered twice" acceptance test).
test("checkDedupeStatus resolves to dedupe_unavailable (not a throw, not a false not_duplicate) when the database is unreachable", async () => {
  const result = await checkDedupeStatus("test-message-id-dedupe-unavailable-check");
  assert.equal(result, "dedupe_unavailable");
});
