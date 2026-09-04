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
  the exact commit message.**
- Run `npm run build` and the test suite before every commit.

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
