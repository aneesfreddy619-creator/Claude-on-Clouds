# Read these files first

Clinic Lead Desk V0 — a rule-based WhatsApp front-desk test system for a
fictional demo clinic. No LLM, no AI, no model layer.

**This file is a pointer. It holds no project state — no status, no
figures, no decisions.** Everything mutable lives in the five project
documents below. Do not add state here; it would go stale and start
misdirecting sessions, which is exactly what these pointers exist to
prevent.

## Where to start

Read **`project-instructions.md`** first. It is the index: it names the
source-of-truth order, current status, scope lock, and where each kind of
fact lives. Follow it to the other four:

1. `clinic-lead-desk-v0-product-instructions.md` — product, safety,
   approved knowledge, acceptance tests (§17), definition of done (§19),
   operational clarifications (§23)
2. `project-instructions.md` — scope, status, behavioural rules
3. `v0-implementation-decisions.md` — stack, checkpoint, coverage
   registry, infrastructure identifiers, gated future decisions
4. `task-template.md` — task framing, change-control gates, commit
   discipline
5. `project-description.md` — summary and future direction

**When memory and a file disagree, the file wins.** Read state from these
files rather than restating it, and never re-derive what they already
record.

`README.md` holds install, run, test, and deploy commands. It is developer
documentation, not a project document.

## Before you act

These three are restated here on purpose, because a session could act
before reading `task-template.md`, which is their canonical home:

- **Work on `main` only.** Never create, switch, or merge branches.
- **Never commit or push without explicit approval of the exact file set
  and the exact commit message.** This applies to every file type,
  documentation included. Silence is never approval.
- **Never print, request, reveal, infer, or transform secret values.**
  Refer to secret names only, with present/absent status where needed.
  All secrets live in environment variables.

The five-file rule governs project documentation only: those five files
are the complete set and there is never a sixth. It is not a limit on the
repository — application code, tests, configuration, database material,
deployment files, `README.md`, and this file are separate and unaffected.
