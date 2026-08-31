# Task Template

Use this template for any work inside this project.

## Task
[State one exact task only.]

## Goal
[State the exact output or change required.]

## Scope check
[Confirm that the task is inside locked V0 scope. If not, label it as later phase and stop.]

## Files allowed for reference
- clinic-lead-desk-v0-product-instructions.md
- v0-implementation-decisions.md
- v0-operational-clarifications.md
- task-template.md
- generated-image.png

## Execution rules
- Work on only one explicitly requested task at a time.
- Do not bundle adjacent, optional, or follow-on tasks unless explicitly approved.
- If the requested task depends on another missing behavior, stop and state that dependency before implementing anything.
- Prefer the smallest viable implementation slice that satisfies the task.
- Do not make unrelated refactors or cleanup changes.
- Do not widen schema, types, workflows, or route behavior unless strictly required for the exact task.
- Do not invent product behavior, clinic facts, or operational rules.
- Keep product behavior unchanged unless the task explicitly asks for a behavior change.
- Follow clarifications when they intentionally narrow or operationalize the product instructions.
- Never commit or push unless explicitly instructed.

## Plan first
For any non-trivial task, provide a short plan before coding that includes:
1. exact task requested,
2. files expected to change,
3. assumptions,
4. dependency risks or approval questions,
5. what will not be changed.

If the task touches workflow logic, persistence, or external API behavior, wait for approval before editing.

## Constraints
- Follow `clinic-lead-desk-v0-product-instructions.md`.
- Follow `v0-implementation-decisions.md`.
- Follow `v0-operational-clarifications.md`.
- Stay within approved knowledge.
- Do not invent missing clinic details.
- Flag assumptions explicitly.
- Keep outputs practical and implementation-oriented.
- Use environment variables only for secrets.
- Keep structured logging, safety checks, and duplicate protection intact.

## Output format
After completing the task, stop and report only:
1. files changed,
2. plain-English summary,
3. build/test result,
4. env vars required,
5. anything still pending, mocked, or not validated.

Do not continue automatically to the next task.

## Done when
[State the acceptance condition for this one task only.]
