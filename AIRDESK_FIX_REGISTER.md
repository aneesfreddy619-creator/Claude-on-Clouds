# AIRDESK — FIX AND DECISION REGISTER
# Stable filename (AIRDESK_FIX_REGISTER.md). Version lives here, not
# in the filename. Internal revision: R9 (August 2026).
# Filename retained deliberately although the file now also holds the
# decision log — working documents are never renamed. See DL-15.
#
# FOUR PARTS, AND ONLY FOUR:
#   PART 0 — change-control procedure (rarely changes)
#   PART 1 — decision log (append-only, one line per locked decision)
#   PART 2 — pending work queue (changes constantly)
#   PART 3 — change record (append-only history of what was done)
#
# The milestone status tracker that used to live here has moved into
# Project Instructions V4, where the criteria already lived. If a
# fifth part is ever proposed, split the file instead of adding it.
#
# Item status: PENDING → APPROVED → DONE. Only the founder moves an
# item to APPROVED. RETIRED means the item died with an architecture
# change and will never be built.

─────────────────────────────────────────────────────────────────
PART 0 — CHANGE CONTROL PROCEDURE
─────────────────────────────────────────────────────────────────

NOTHING updates the project — no file edit, no upload, no canon
change, no shelf change — without passing all five gates in order.

GATE 1 — PROPOSE. State what will change and why, before anything is
  produced.

GATE 2 — CHECK. Before approval is requested, run and report:
  □ Leak check — no figure duplicated outside its governing block in
    the knowledge base; no behaviour duplicated outside the prompt.
  □ Drift check — nothing contradicts a locked decision in Master
    Decisions or the decision log without the founder reopening it.
  □ Version check — filename, internal header, and manifest agree.
  □ Evidence check — new airline-behaviour claims carry a basis tag
    and an audit entry path.
  □ Bottleneck check — does this block or unblock a milestone
    criterion, or create a dependency that did not exist before?

GATE 3 — APPROVE. The founder says go, explicitly. Silence is never
  approval. Partial approval is stated as partial.

GATE 4 — EXECUTE AND UPLOAD SAME DAY. Delivered as a file and
  uploaded in the same session. Work living only in chat is at risk.

GATE 5 — EXPLAIN AND LOG. Explain what changed. This register
  updates: the item moves to DONE, dated; any decision made along the
  way is written into the decision log in the same session; the
  manifest updates if the shelf changed.

DESIGN INTENT: loose enough to grow — anything can be proposed and
ideas flow freely — strong enough to stand, since nothing lands
without the gates, and honest enough to see, since a failed check is
reported rather than silently fixed.

TWO-CLASS CANON. Deployment artifacts (the knowledge base, the
prompt) carry versioned filenames: the version is the identity and
test runs bind to it. Working documents (this register, Master
Decisions, the contributions audit, project instructions) carry
stable filenames with the version in a one-line internal header, and
updates replace in place. Never rename a working document.

ONE CHANGELOG HOME. This register is the single change journal. Other
files carry a one-line pointer here, never their own changelog.

BATCH GATE. The five gates run per session batch, not per item —
provided the batch was proposed as a batch and approved as a batch.

MANIFEST BY NAMES ONLY. The manifest lists stable names plus current
deployment-artifact versions. It changes only on a genuine add or
remove.

NON-NEGOTIABLE: propose before build; explicit approval; same-day
upload; single source of truth; one canonical version; the founder's
screen is the authority on what exists; nothing is deleted without a
local backup confirmed out loud.

─────────────────────────────────────────────────────────────────
PART 1 — DECISION LOG
Append-only. One line per locked decision, dated. Never rewritten.
A decision made in conversation lands here the same session.
This part exists so that no decision's only home is a memory summary.
─────────────────────────────────────────────────────────────────

DL-01  Aug 2026  SINGLE PERSONA. The two-persona architecture is
       retired. One prompt, one voice, from the passenger's first
       message through the full depth of the case. No free tier, no
       intake persona, no register switch, no handoff.

DL-02  Aug 2026  ANCHOR TRIGGER MECHANIC RETIRED, no replacement.
       The three firing conditions and the count guardrails (floor
       three, ceiling six, crisis override two) are dead. Master
       Decisions section 15 is queued for deletion.

DL-03  Aug 11 2026  PAYMENT BEFORE USAGE — LOCKED. The passenger has
       paid before the conversation begins. The product never
       mentions payment, price, tiers, or upgrades. All persuasion
       content lives on the public site. Standing consequence: the
       free conversation that was to produce the first behavioural
       data no longer exists, so the first paying stranger is both
       the revenue test and the only behavioural evidence.

DL-04  Aug 11 2026  ELICITATION — STATE-ADAPTIVE BUNDLING. The party
       seeking situation clarity carries the cost of getting it.
       Bundle two or three related questions when the passenger has
       room; contract to a single question under crisis, distress, an
       unanswered previous message, or where the answer would be
       guesswork. Replaces the one-question-at-a-time rule. This also
       closes the long-open one-question-law decision.

DL-05  Aug 11 2026  BOTH PROMPT FILES OBSOLETE AS ARTIFACTS, absorbed
       into the Wingman prompt version 2.0 with an absorption ledger
       recording what came from each and what died. Neither ships
       again.

DL-06  Aug 11 2026  BUILD ROADMAP ABSORBED into Project Instructions
       version 4. Status and criteria now live together. The file is
       retired from the shelf.

DL-07  Aug 11 2026  THE TARGET LIVES AS A SECTION in Project
       Instructions, not as a separate shelf file. It owns only what
       nothing else owns and points to Master Decisions for anything
       governed there.

DL-08  Aug 11 2026  THE DECISION LOG LIVES IN THIS REGISTER, not as a
       separate file. Fewer files wins; the register had room because
       its status tracker left.

DL-09  Aug 11 2026  THREE SKILLS, NOT MORE. Project discipline
       (existing, one edit) owns whether a change is allowed.
       Progress check (new) owns whether the project is going
       anywhere. File maintenance (new) owns how a file is changed
       correctly. No skill contains a project fact — skills hold
       verbs, files hold nouns.

DL-10  Aug 11 2026  THE PROGRESS CHECK RUNS AUTOMATICALLY at session
       start, beside the shelf check. Automatic catches drift when
       the founder is deep in building and least likely to notice.

DL-11  Aug 11 2026  THE MILESTONE LINE IN THE DISCIPLINE SKILL STRIPS
       TO A POINTER, so the procedure lives in one place only.

DL-12  Aug 2026  NAMING DISCIPLINE. Full descriptive names always, in
       files and in conversation. Never a bare code. Whether trailing
       short identifiers survive at all is deferred, not decided.

DL-13  Aug 11 2026  MEMORY HOLDS POINTERS, NEVER STATE. Decisions,
       versions, statuses and figures live in files. When memory and
       a file disagree, the file wins without discussion.

DL-14  Aug 11 2026  PATENTS ASSESSED AND REJECTED. An advisory
       workflow over public regulations is unlikely to clear novelty
       and subject-matter requirements, would be slow and costly, and
       would require publishing the method. Copyright over the
       compilation, plus the outcome record, is the real protection.
       Revisit only if a genuinely novel technical mechanism appears.

DL-15  Aug 11 2026  THIS FILE KEEPS ITS FILENAME although it now
       holds decisions as well as fixes. Renaming a working document
       would contradict the two-class rule stated in Part 0. The four
       parts are named in the header instead.

DL-16  Aug 11 2026  VALIDATED BRAIN TRUST CAVEAT STANDS. The
       twenty-out-of-twenty result validated accuracy within its
       tested scope at that knowledge base version, with zero India
       coverage in the suite. It is never presented as more settled
       than that. A first-tier regression run is required before any
       new knowledge base version is trusted.

─────────────────────────────────────────────────────────────────
PART 2 — PENDING WORK QUEUE
Re-scoped August 2026 against the single-persona architecture.
Items that assumed two prompts, a free tier, or an anchor moment are
either rewritten or marked RETIRED.
─────────────────────────────────────────────────────────────────

## BATCH ONE — SHELF CORRECTION (in progress)

F37 DONE (Aug 11 2026) — Merged prompt authored:
    AIRDESK_PROMPT_WINGMAN_v2_0.md. Single persona, payment before
    usage, state-adaptive bundling, anchor removed, absorption ledger
    included. UNVALIDATED — no graded run against it yet.

F38 DONE (Aug 11 2026) — Project Instructions version 4 authored.
    Roadmap absorbed, target section added, single-persona
    architecture written in, memory law added, session start becomes
    two rituals, full descriptive naming throughout.

F39 DONE (Aug 11 2026) — This register rewritten at revision R9:
    decision log added as Part 1, milestone tracker removed, pending
    items re-scoped.

F40 PENDING — Shelf removals: the intake prompt, the Wingman prompt
    version 1.0, and the Build Roadmap. BLOCKED until the founder
    confirms out loud that local copies of all three exist. Shelf
    goes to 22 files on execution.

## MASTER DECISIONS — FIVE STALE SECTIONS

F41 PENDING — Product identity section: remove the two-persona
    architecture, the free tier, the payment-unlock-within-one-thread
    mechanic, and the one-question-at-a-time rule. Replace with the
    single persona and state-adaptive bundling per DL-01 and DL-04.

F42 PENDING — Platform decisions section: the two named prompt files
    are obsolete. Replace with the single Wingman prompt version 2.0.
    Re-verify the per-conversation and monthly operating cost figures,
    which are legacy estimates carried since June and flagged for
    re-verification at deploy but never re-verified.

F43 PENDING — Pricing section: currently assumes a free conversation
    ahead of payment. Rewrite for payment before usage. The
    subscription structure discussed in conversation is a proposal,
    not a locked decision, and must not be written in as locked.

F44 PENDING — Anchor trigger mechanic section: delete entirely per
    DL-02. The only section that dies rather than being edited.

F45 PENDING — Advisory Product Shell section: currently points at a
    framework that no longer matches the product. Rewrite the pointer
    and note the framework's own correction as F46.

F19 PENDING (re-scoped) — Test-dependent Master Decisions edits,
    after a clean run only: closure protocol wording, end-of-the-road
    protocol, checkpoint line. The anchor mechanics and free-tier
    closure line are removed from this item — both retired.

## OTHER FILES

F46 PENDING — Advisory Product Shell correction. An entire section is
    the retired two-persona architecture, including both prompt
    templates, plus a firing logic built around converting a free
    user. This is the asset retained on any exit, so a framework that
    contradicts the product it was extracted from is a real defect.
    Gates no milestone; not urgent; genuinely worth doing.

F22 NOTED (unchanged) — Demo build: the embedded prompt is ancient,
    with hardcoded figures and a duplicated block. Must not deploy.
    The interface shell is keepable. Prompt replacement belongs to
    the Deployable Product build.

## TESTING

F47 PENDING — Re-scope the conversational test file against the
    Wingman prompt version 2.0. The current file grades a
    free-to-paid arc across two prompts with a seam between blocks.
    The seam does not exist. This is a rewrite, not a patch. New
    criteria needed for: state-adaptive bundling under each passenger
    state, protective move placement without an anchor, first-message
    behaviour when the passenger has already paid, and continuity of
    empathy without a register shift to observe.

F15 PENDING (re-scoped) — Test Bench update. ONE configuration now,
    not two: the Wingman prompt version 2.0 as instructions, the
    knowledge base version 3.2 as the sole knowledge file, nothing
    else — never the test file itself. Confirm the instructions field
    before every batch; a leg run under the wrong configuration is
    void, not failed.

F16 PENDING (re-scoped) — Run and grade. Sonnet only, fresh chats,
    graded in the build project against the answer key. The weakest
    model is banned from all runs. Scope is set by F47 and cannot be
    fixed until F47 lands.

F48 PENDING — First-tier regression run against the Validated Brain
    suite, required before any new knowledge base version is trusted.
    Per DL-16.

## DECISIONS THE FOUNDER STILL OWES

F49 PENDING — Excluded-market handling: what the product does when a
    passenger's case sits in a market we do not cover. Under-evidenced.
    Needed before the expanded test run.

F50 PENDING — Refund-demand rule: whether the product ever directs a
    passenger to demand a refund outright. Under-evidenced. Needed
    before the expanded test run.

F51 PENDING — Kill criteria numbers: how many paying strangers with
    zero documented outcomes, and how long with no paying user at
    all. Placeholders sit in Project Instructions version 4.

F52 PENDING — Module 6 document extraction: four questions posed to
    the founder and unanswered — common document mismatches on
    rebooking; airline-required documents before processing;
    the most common document-related agent error when fixing a
    disrupted booking; country-level variation in requirements.

## BEFORE ANY MONEY IS TAKEN — HARD BLOCKERS

F53 PENDING — Open the metered developer account with its own billing
    and a hard spend cap plus alert. The founder's own subscription
    cannot legally power a live customer-facing product. This is a
    blocker, not a preference.

F54 PENDING — Verify the tax and consumer-law positions before the
    payment path is built: whether the payment provider acts as
    merchant of record for European and United Kingdom value-added
    tax; United States state sales tax and economic nexus exposure;
    and whether the locked no-refunds rule survives the European and
    United Kingdom right of withdrawal on digital services, which is
    commonly waivable only with express consent to immediate
    performance captured in the payment flow. All need primary-source
    verification. None of this is legal advice.

F55 PENDING — Trademark search in the primary markets before the
    product name appears on anything public or any money is spent on
    branding. Not done.

F56 PENDING — Account security pass: two-factor authentication
    everywhere, strongest available factor on the domain registrar
    and primary email, model keys in environment variables only and
    never in client-side code or the repository, key rotation policy,
    and canon files backed up locally independent of this project.

## SKILLS

F57 PENDING — Build the progress-check skill: criteria met over
    criteria total, current binding constraint, smallest next action,
    plus flags for proposals stacking on an unmoved blocker and for a
    criterion sitting unchanged too long. Reads the criteria from
    Project Instructions and restates none of them. Writes nothing.

F58 PENDING — Build the file-maintenance skill: register entry
    format, header-sync rule, manifest-update step, which change
    lands in which file, two-class filename rule as procedure, and a
    session-close pass covering headers, manifest, register entries,
    unwritten decisions, and backup confirmation.

F59 PENDING — Strip the milestone line in the project-discipline
    skill to a pointer, per DL-11.

## DEPLOYABLE PRODUCT BUILD ITEMS

F60 PENDING — Build the smallest real slice first: one persona,
    payment before the first message, one subscription tier, no
    drafting, no voice. Tests the architecture through use rather
    than description.

F30 PENDING (re-scoped) — Payment path: takes payment before the
    conversation begins. The cashier-not-salesman principle holds —
    the payment layer must not carry persuasion, and swapping it must
    not move conversion.

F29 PENDING (unchanged) — Case recording: eight fields auto-captured
    from day one, with RECORD and DOCUMENTED OUTCOME status levels.

F27 PENDING (unchanged) — Loyalty case database: record created at
    payment, case summary written on pause or close, restored on
    return by email match. Never stored: transcripts, uploaded
    documents, booking references, card data.

F28 PENDING (unchanged) — Upload pipeline: extract, structure,
    delete, with the plain-language promise shown to the passenger.

F23 PENDING (unchanged) — Interaction mechanics: moves render as
    tap-to-progress blocks rather than text walls; response buttons
    at critical moments.

F24 PENDING (unchanged) — Installable from the browser, link-
    shareable, no app store.

F26 PENDING (deferred out of the first slice) — Voice input via the
    free browser speech interface, zero model cost.

F61 PENDING — Shareable outcome artifact. Required by the Deployable
    Product criteria and by the word-of-mouth requirement: the
    shareable unit is the outcome, not the app.

F25 RETIRED — Blurred reveal at the anchor moment. Died with the
    anchor per DL-02. There is no locked reveal because there is no
    free conversation preceding payment.

## DEFERRED — GATES NOTHING

F31 DEFERRED — Richer voice, visual and interactive layers, designed
    by passenger moment rather than by ratio. After usage data.
F32 DEFERRED — Live website link checking. Technically possible;
    costs latency, money, and introduces a conflict failure mode
    against the knowledge base. Research note only.
F33 DEFERRED — Insights unload session, which enriches the prompt's
    insights layer. Scheduled by the founder when ready.
F34 DEFERRED — Dynamic module loading. A cost optimisation, never a
    build gate.
F62 DEFERRED — Whether trailing short identifiers survive at all,
    per DL-12.
F63 DEFERRED — Product scope beyond disruption, toward broader trip
    companionship. A proposal, not a decision.

## OPPORTUNISTIC — NEVER DELAYS A MILESTONE

Five further airline profiles; Module 6 expansion; agent policy
document extraction for the eight covered carriers; airline profile
completion; two known knowledge base content gaps; a dedicated tax
section, which the knowledge base lacks entirely.

─────────────────────────────────────────────────────────────────
PART 3 — CHANGE RECORD
Append-only history. Completed items keep their original text.
Where a completed item built something since retired, that is marked
rather than deleted — the record says what happened at the time.
─────────────────────────────────────────────────────────────────

## AUGUST 2026 — REVISION R9

Architecture change session. The two-persona architecture, the anchor
trigger mechanic, and the one-question-at-a-time rule were retired;
payment before usage was locked; both prompt files were merged into a
single Wingman prompt version 2.0; the Build Roadmap was absorbed
into Project Instructions version 4; the decision log was added to
this register as Part 1 and the milestone status tracker removed from
it; the pending queue was re-scoped. Sixteen decisions backfilled
into Part 1. Items F37 to F39 done, F40 blocked on backup
confirmation. Full detail in Parts 1 and 2 above.

## JULY 2026 — REVISIONS R6 TO R8

Fix path Steps 1 to 3 executed. The intake prompt and the first
Wingman prompt were authored and shelved; the conversational test
file was authored at version 1.1 with the pass bar locked; the
Validated Brain suite's Scenario 12 answer key was corrected from an
overstated Berlin–Rome distance to roughly 1,183 kilometres, placing
it in the €250 tier, with the failure log annotated; the knowledge
base internal header was corrected from 3.1 to 3.2; the Build Roadmap
was synchronised; several decisions were written into Master
Decisions covering no refunds, the cashier principle, voice input,
upload handling and the loyalty case database. The stable-filename
regime and the batch gate were adopted. The conversational test scope
question was resolved as a full continuous arc, and the keep-cut
question on two extra scenarios was resolved as keep.

SUPERSEDED BY THE AUGUST CHANGE — recorded, not deleted: the intake
prompt items covering the policy index, the three-level structure,
the free-tier closure and the anchor trigger; the first Wingman
prompt's continuity item; and the two-configuration test design. The
work was real and its surviving content lives in the Wingman prompt
version 2.0 absorption ledger.

## JUNE 2026 AND EARLIER

Validated Brain completed, graded twenty out of twenty on each of
three tiers, with the trust caveat recorded at DL-16. Knowledge base
version 3.2 built. Master Decisions established. The change-control
protocol and the two-class canon adopted after work was nearly lost.

*Fix and Decision Register — revision R9, August 2026.*
*Four parts. If a fifth is proposed, split the file.*
