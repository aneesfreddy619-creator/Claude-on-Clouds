# Task Template

Use this template for any work inside this project.

## Task
[State the exact task.]

## Goal
[State what should be produced.]

## Scope check
[Confirm that the task is inside locked V0 scope. If not, label it as later phase.]

## Mode
[Choose one: Read-only | Modification allowed]

## Current checkpoint
[State the current project checkpoint relevant to this task.]

## Files allowed to change
[List exact files that may be modified. If read-only, write: None.]

## Secret handling
- Never print, request, reveal, infer, or transform secret values.
- Refer to secret names only when explicitly required.
- Keep all secrets in environment variables only.

## Constraints
- Follow `clinic-lead-desk-v0-product-instructions.md`.
- Follow `project-instructions.md`.
- Respect `v0-implementation-decisions.md`.
- Stay within approved knowledge.
- Do not invent missing clinic details.
- Flag assumptions explicitly.
- Keep outputs practical and implementation-oriented.

## Output format
[Examples: markdown plan, SQL schema, API routes, webhook logic, admin view fields, test checklist.]

## Done when
[State the acceptance condition.]

---

# Working method

Applies to every task, whether or not the template above is filled in.

## Change-control gates

Nothing enters code, schema, deployment config, or approved content without
passing these in order:

1. **Propose** — state exactly what changes and why.
2. **Check** — report, never assume: does it duplicate something held
   elsewhere; does it contradict a locked decision; is it against the
   current version; what evidence supports it; does it move the current
   bottleneck or add to it.
3. **Approve** — an explicit go from the owner. **Silence is never approval.**
4. **Execute** — make the change; run build and tests before committing.
5. **Log** — record it in the commit message and update affected files.

Gate weight scales with what is touched. Full gates for code, schema,
approved reply text, deployment, and secrets. Light gates — execute and
report — for scratch files and working notes.

## Commit and branch discipline

- Work on `main` only. Never create, switch, or merge branches.
- **Never commit or push without explicit approval of the exact file set and
  the exact commit message.** This applies to **all** changes, documentation
  included.
- Run `npm run build` and the test suite before every commit.

**Not adopted:** a relaxation allowing markdown-only changes to be committed
and reported without pre-approval was proposed but never approved. Until the
owner says otherwise, the full gate above applies to every file type. Any
outside note describing that relaxation as active is wrong.

## Division of labour

Canonical sources, source-refresh duties, compact reporting, and the
stop-after-push rule live in `project-instructions.md` ("Shared Source of
Truth Protocol"). Not repeated here. What follows is only what that section
does not cover.

- **Claude — implementation and execution owner.** All code, tests,
  migrations, repository, Railway, Supabase, and live diagnosis. The only
  party that changes anything.
- **GPT-5.6 Sol — independent architecture and verification layer.** It
  replaces Gemini, which replaced Perplexity; both are retired. It may hold
  direct access to the connected GitHub, Supabase and Railway systems, so
  its findings are checkable claims about real source rather than guesses.
  **Under this protocol it operates read-only for implementation and
  deployment, unless the owner explicitly changes that role.** That is a
  division of labour, not a limit on what it is able to do.
- **The owner is the sole approval authority.** Neither system commits,
  pushes, deploys, or changes approved content without explicit approval of
  the exact file set and the exact commit message. A disagreement between
  the two systems is resolved by the owner, not by whichever argued last.
- **Execution and its evidence stay with Claude.** Because implementation
  and deployment run through one party, a claim about behaviour under
  execution is a hypothesis until Claude runs it and reports the result.
- **Never accept code from it.** Take the reasoning; write the
  implementation against this repository's actual patterns. A reviewer
  proposing code for the wrong stack has happened here and cost a cycle.
- **Neither system treats the other's claim as source truth.** Every finding
  from either side is checked against the source before it is acted on, and
  the check is reported. On this project a second opinion has been
  confidently and specifically wrong (three of eight claims in one review),
  and confidently and specifically right about a real defect Claude had
  shipped. Neither record earns trust without evidence.
- **Classify every finding** as BLOCKER, SHOULD FIX NOW, or RECORD — see
  "Finding severity" below.
- **Neither** re-derives state already recorded in the five project files,
  and neither restates it in a handoff. Pass the decision or the action;
  state lives in the files.

## Milestone protocol — substantial architecture or state changes

Adopted 2026-09-08, after a milestone took six plan-critique-rewrite rounds
before implementation. Each round found something real; the cost was that
they were found sequentially. This front-loads them.

**Applies to** changes touching invariants, persisted state, authoritative
sources, or customer-facing behaviour. Not to typo fixes, comment
corrections, or count synchronisation.

### The pre-implementation package — five parts, all required

**A. Locked invariant.** The exact business or system rule being proven, in
one sentence.

**B. Authoritative-state table.** For every fact the decision uses, name its
authoritative source: lead/customer state, transaction/escalation state,
opt-out/permission state, this message's persistence result, outbound-send
result, staff-controlled state. **Two related fields are not equivalent
unless the product says so.** `lead_status = human_escalation` and "an open
escalation row exists" looked interchangeable and were not; that assumption
was the defect.

**C. State-transition table.** For each current state plus event: observed
inputs, required persistent result, Supervisor result, permitted action or
reply. Healthy *and* failure states.

**D. Failure matrix.** Assess every one of these explicitly — a case left
implicit is a case not handled:

- required read fails
- required write fails
- partial persistence
- contradictory authoritative state
- duplicate or idempotent action
- concurrent requests
- stale pre-read state
- staff change state mid-lifecycle
- customer-facing wording asserting more than persistence proves
- operational visibility when the system fails closed

Classify each as: **handled in milestone**, **impossible by source
evidence** (cite the evidence), **accepted limitation**, or **separate
future invariant**.

**E. Acceptance proof.** Map each new invariant and failure behaviour to a
unit proof, a DB-backed proof, a live proof where applicable, and its
documentation or §17 acceptance-row impact.

### Order of work

Invariant → authoritative-state table → transition and failure matrix →
independent review → owner approval → **one implementation pass** →
independent review of the committed diff → live verification.

GPT reviews the package **before code is written**. That is the point: move
adversarial findings ahead of implementation instead of after it.

### Finding severity

Classify every finding, from either side:

- **BLOCKER** — violates a locked invariant, creates false business truth,
  leaves unsafe or contradictory persisted state, or makes the milestone
  claim something it does not prove.
- **SHOULD FIX NOW** — a small correction directly caused by this milestone,
  cheaper and safer to fix before commit than after.
- **RECORD** — real, but outside this milestone. Record it; do not expand
  scope. Not every adjacent improvement is milestone work.

### Contradiction semantics are decided before implementation

If two authoritative sources can disagree, define what that disagreement
means **before** writing code. Never silently pick one, average them, infer
the missing fact, or coerce UNKNOWN into a convenient value. Use the
explicit states: `INCOMPLETE`, `CONTRADICTORY`, `BLOCKED`, `HUMAN_REQUIRED`.

### Customer-facing claims are tied to observed facts

For every new reply or action, state which persisted or observed facts
justify the wording. If the system proves only "an open escalation row
exists", the text may say the matter is awaiting review — it may not imply
email, a response time, ownership, notification, or a completed handoff
unless each is separately proven.

### During implementation

Implement the approved scope only. A new BLOCKER found mid-implementation
stops work and is reported before anything broadens. SHOULD FIX NOW items
may be included only when directly caused by the milestone, and must be
reported explicitly. RECORD items stay recorded. Do not redesign the
milestone mid-implementation unless a blocker makes the approved design
invalid.

### After commit

Per the Shared Source of Truth Protocol, Claude stops after push and GPT
reviews the committed SHA. What this protocol adds: the review is **against
the approved invariant and failure matrix**, and **live verification happens
only after it.**

## Void versus failed

A run executed under the wrong configuration is **void**. Discard and re-run.
Never record it as a failure, and never as a pass.

Void conditions: wrong environment variables, missing test database, a run
killed by the operator or harness, output truncated or buffered such that the
result cannot be read, or the wrong code version under test.

"Void — re-running" is an honest report. Reporting a void run as a pass is not.

## Files hold state, memory holds pointers

No decision, version, status, or figure exists only in a conversation. Those
live in the five project files. **When memory and a file disagree, the file
wins.** Work produced outside the repository that touches behaviour or
approved content enters through the gates above, or it does not enter.

## Evidence discipline

Always distinguish what is proven by automated tests, what is proven live,
and what is still inferred. State blockers together with the evidence behind
them. Never present an inference as a confirmed fact.
