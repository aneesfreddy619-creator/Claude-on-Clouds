# V0 Working Disciplines

Version: 0.1 · Last updated: 2026-09-03

How work is done on this project. **State** lives in
`docs/v0-session-checkpoint.md`; **method** lives here. One home each — a
rule this document also imposes on itself.

Scope: process and documentation only. Nothing here changes product
behaviour, and nothing here overrides
`clinic-lead-desk-v0-product-instructions.md`.

---

## 1. Change control gates

Nothing enters code, schema, deployment config, or approved content without
passing these in order:

1. **PROPOSE** — state exactly what changes and why.
2. **CHECK** — report, never assume: does it duplicate something held
   elsewhere; does it contradict a locked decision; is it against the
   current version; what evidence supports it; does it move the current
   bottleneck or add to it.
3. **APPROVE** — an explicit go from the owner. **Silence is never
   approval.**
4. **EXECUTE** — make the change; run build and tests before committing.
5. **LOG** — record it (commit message + this project's checkpoint doc).

Gate weight scales with what is touched. Full gates for code, schema,
approved reply text, deployment, and secrets. Light gates — execute and
report — for scratch files and working notes.

**Commit discipline:** never commit or push without explicit approval of
the **exact file set** and the **exact commit message**. Work on `main`
only; no branch creation, switching, or merging.

## 2. Void versus failed

A test or verification run executed under the wrong configuration is
**void**. It is discarded and re-run. It is never recorded as a failure and
never recorded as a pass.

Void conditions include: wrong environment variables, missing test database,
a run killed by the operator or the harness, output truncated or buffered
such that the result cannot be read, or the wrong code version under test.

This concept exists because both situations occurred during development:
a run terminated by a self-matching `pkill` pattern, and a run whose output
was buffered by a pipe and briefly misread as a hang. Neither was a product
failure; recording either as one would have been false evidence.

**Rule:** state which it was. "Void — re-running" is an honest report.
Reporting a void run as a pass is not.

## 3. Staleness and review intervals

Approved knowledge carries a source and a review interval. Past the
interval, content is **flagged, not deleted**, and the flag is surfaced to
the operator.

| Content class | Governing copy | Source of truth | Review interval |
|---|---|---|---|
| Consultation fee | `src/rules/approvedReplies.ts` | product-instructions §8/§9 | Quarterly, or on any price change |
| Opening hours | `src/rules/approvedReplies.ts` | product-instructions §8/§9 | Quarterly, or on any schedule change |
| Branch address | `src/rules/approvedReplies.ts` | product-instructions §8/§9 | Annually, or on relocation |
| Service list | `src/rules/approvedReplies.ts` | product-instructions §8/§9 | Quarterly |
| Escalation reply text | `src/rules/approvedReplies.ts` | product-instructions §8/§9 | Annually, or on any safety-policy change |
| Classifier keyword tables | `src/rules/classifier.ts` | product-instructions §7 | On every acceptance-test failure; otherwise semi-annually |

**The one-copy law:** a figure is written in exactly one place and pointed
at everywhere else. Approved reply text lives in
`src/rules/approvedReplies.ts`, copied verbatim from the product
instructions. Tests assert against those exported constants and never
restate the text. Restating a value in a second location is how knowledge
bases come to contradict themselves, and the contradiction is always found
later than it was created.

## 4. Module and coverage registry

Status is read from source, never asserted from memory.

| Module | Status | Test coverage |
|---|---|---|
| `src/routes/webhook.ts` | Complete | `webhook.test.ts` (4), `webhook.persistence.test.ts` (12) |
| `src/security/webhookSignature.ts` | Complete | via `webhook.test.ts` — missing and invalid signature both rejected |
| `src/services/dedupe.ts` | Complete | `dedupe.test.ts` (1) + live duplicate-delivery case |
| `src/services/persistence.ts` | Complete | `persistence.test.ts` (6) + persistence/acceptance cases |
| `src/rules/classifier.ts` | Complete | `classifier.test.ts` (4) + 8 acceptance cases |
| `src/rules/approvedReplies.ts` | Complete | `approvedReplies.test.ts` (5) + reply-text assertions |
| `src/rules/stopDetection.ts` | Complete | `stopDetection.test.ts` (2) + STOP acceptance case |
| `src/rules/appointmentDetailExtraction.ts` | **Partial** | No dedicated test file; exercised indirectly |
| `src/routes/admin.ts` | Complete | `admin.test.ts` (13) |
| `src/routes/health.ts` | Complete | Verified live via Railway healthcheck |
| `src/services/whatsappSender.ts` | **Partial** | Fail-closed path proven; success path never exercised live |
| `src/config/env.ts` | Complete | No validation by design; boot presence logged |
| `src/whatsapp/inboundPayload.ts` | Complete | via webhook tests |

**Totals:** 47 tests across 8 test files, all passing.

**Maintenance rule:** update this table in the same change that alters a
module, or do not keep the table at all. An unmaintained registry is worse
than none, because it produces confident claims about coverage that does
not exist.

## 5. Test tiers, and what a passing result means

| Tier | What it proves | Where |
|---|---|---|
| **1 — Accuracy** | Approved reply text exact; correct category; correct escalation reason | `classifier.test.ts`, `approvedReplies.test.ts`, acceptance cases |
| **2 — Application** | Right rule applied to a realistic message; lead status; persistence | `persistence.test.ts`, `webhook.persistence.test.ts` |
| **3 — Edge and failure** | Unmatched input escalates rather than guessing; unreachable DB fails closed; bad signature rejected | fallback case, `dedupe.test.ts`, `admin.test.ts`, `webhook.test.ts` |
| **4 — Conversational** | The arc across a real exchange | **Not covered.** Requires live WhatsApp. |

**Scope of a passing result:** it validates what it tested, at the version
it tested, within the coverage it had. 47/47 green does **not** satisfy
§19 "Definition of done", which requires a real message to the Meta test
number producing an approved reply observed in WhatsApp.

**Regression rule:** any change to rules or approved content re-runs tier 1
in full before it is trusted.

## 6. Files hold state, memory holds pointers

No decision, version, status, or figure exists only in a conversation or a
summary. Those live in files. When memory and a file disagree, **the file
wins, without discussion.**

Work produced outside the repository that touches behaviour or approved
content enters through the change-control gates above, or it does not
enter. Work that exists only in a chat will be rediscovered later at a
cost, or lost.

## 7. Test-environment prerequisite

`src/routes/webhook.persistence.test.ts` requires a local throwaway
PostgreSQL instance; setup commands are in `README.md` under "Tests". This
is deliberately a manual step and is not automated in `package.json`.

Known wart: `npm test` completes and exits 0, but hangs for some minutes
after the tests pass because the `postgres.js` pool keeps the event loop
alive. Adding `--test-force-exit` resolves it. Not applied — it is a
`package.json` change awaiting approval.
