# WhatsApp Front-Desk Shell

Version: 0.1 · Status: **DRAFT — not canon** · Last updated: 2026-09-03

A reusable, rule-based WhatsApp front-desk and case-intake shell that can
serve multiple business types from one engine and per-business content
packs.

---

## 0. Status, authority, and naming gate

**This document has no authority over Clinic Lead Desk V0.** Clinic Lead
Desk V0 remains the active implementation instance and demo build, under its
own locked scope in `clinic-lead-desk-v0-product-instructions.md`. Where this
document and the clinic's product instructions disagree, **the clinic's
product instructions win.**

Three gates are set by the operator and are binding on this document:

| Item | Status |
|---|---|
| This spec (design only, no code) | **Approved now** |
| Adopting the name "WhatsApp Front-Desk Shell" for the product | **Deferred** until clinic V0's first real end-to-end WhatsApp outcome |
| Knowledge-architecture restructure of clinic V0 | **Deferred** until that same first outcome |
| Any code, schema, migration, deployment, Railway, GitHub, Meta, or env change | **Not approved** |

Until that first outcome, clinic V0 keeps its current identity, its current
locks, its current reply text, and its current category names. Nothing in
this document is executed against it.

**Definition of the gate:** a real message sent from an approved test
recipient to the Meta test number, producing an approved reply observed in
WhatsApp, with a lead/audit record visible — i.e. §19 "Definition of done"
in the clinic product instructions.

## 1. Product promise

> Help a person identify their case type, collect the facts that case
> genuinely requires, give them an approved answer or a checklist, and route
> them to the right human next step — over WhatsApp, with no guessing.

Deliberately **not** clinic-booking language, and deliberately not a promise
to decide anything on the person's behalf.

## 2. Hard constraints

These are structural, not preferences. A build that breaks any of them is
not this shell.

- **No LLM. No AI. No model layer of any kind.** No classification by model,
  no extraction by model, no generated text, no RAG, no embeddings, no
  multi-model orchestration, no "just for the fallback".
- **Every outbound message is approved text**, authored by a human and held
  in a content pack. The system selects; it never composes.
- **Classification is deterministic** — ordered, explainable rules over
  literal terms and patterns. The same input always produces the same output,
  and the matched rule is always named in the log.
- **Human escalation whenever uncertain.** Unmatched input escalates. It
  never guesses a category and never reasons from an adjacent one.
- **No invented facts, figures, availability, eligibility, or outcomes.**
- **WhatsApp-first.** One channel, done properly.

## 3. Where this shell fits — and where it does not

**Fits** where a business receives repetitive inbound enquiries that fall
into a small, stable set of intents, where the correct answers are already
known and approved, and where anything outside that set should reach a human
quickly.

**Does not fit** where:
- The answer requires professional judgement that must be licensed
  (medical, legal, financial advice). The shell may route to such a
  professional; it may never substitute for one.
- The correct reply genuinely cannot be pre-authored — if every answer is
  bespoke, there is nothing for a rule engine to select.
- Getting it wrong exposes the person to serious harm rather than an
  inconvenience. The escalation-first design mitigates but does not remove
  this.
- The underlying facts change faster than the content pack can be
  maintained.

## 4. Architecture — a fixed engine, swappable content

The central design claim, verified by reading the existing clinic
implementation: **the engine is already generic; only the content is
business-specific.**

| Layer | Varies per business? | Examples in the current codebase |
|---|---|---|
| **Transport** — webhook receipt, signature verification, deduplication by message ID, outbound send | **No** | `routes/webhook.ts`, `security/webhookSignature.ts`, `services/dedupe.ts`, `services/whatsappSender.ts` |
| **Matching engine** — ordered priority scan, first match wins, named rule | **No** | the algorithm in `rules/classifier.ts` |
| **Persistence & audit** — case, message log, escalation | **No** | `services/persistence.ts`, `db/schema/*` |
| **Opt-out** — exact STOP handling | **No** | `rules/stopDetection.ts` |
| **Admin inspection** | **No** | `routes/admin.ts` |
| **Content pack** — keyword tables, approved reply text, enabled categories, required facts, escalation reasons | **Yes** | the *data* inside `rules/classifier.ts` and `rules/approvedReplies.ts` |

Generalising therefore means **hoisting two data tables out of code into a
content pack**, not rewriting the system. This is what makes the direction
viable without an LLM and without a large refactor.

## 5. Standard category taxonomy

Eight categories, sufficient for at least three different-in-nature
businesses. Every one is rule-matched; none is inferred.

| Category | Meaning |
|---|---|
| `new_request` | Wants to start something — a booking, a claim, a job |
| `existing_request` | Asking about something already started |
| `published_pricing` | A published, approved price or fee |
| `access_information` | Hours, location, how to reach a human |
| `offering_information` | What the business does or handles |
| `requirements_checklist` | What the person needs to bring, send, or prepare |
| `eligibility_screen` | Whether their situation may qualify |
| `human_escalation` | Anything uncertain, sensitive, or out of scope |

**Two invariants that must hold in every business configuration:**

1. **`human_escalation` outranks everything.** It is evaluated first and
   wins over any other match in the same message. This is the single most
   important safety property in the current clinic build and it transfers
   unchanged.
2. **`eligibility_screen` is a checklist, never a determination.** It may
   state which conditions exist and what evidence bears on them, then route
   to a human. It must never tell a person that they do or do not qualify.
   In regulated domains that boundary separates guidance from advice, and
   crossing it is the failure mode this shell most needs to avoid. Any
   business whose `eligibility_screen` cannot be expressed as a checklist
   must disable the category.

## 6. Content pack shape

One pack per business. Data only — no logic, no code.

```
business_id, display_name, locale/language hints
enabled_categories        # subset of the eight
category_rules[]          # ordered: { category, escalation_reason?, terms[] }
approved_replies{}        # category -> exact approved text
escalation_reasons[]      # { reason, approved_reply, required_action }
required_facts{}          # category -> facts to collect before answering
content_meta{}            # per block: source, source_date, review_interval
operating_state_refs      # which live signals the validator must consult
```

**Rules the pack must satisfy:**
- Approved reply text is held **once**. Nothing restates it — not tests, not
  documentation, not a second pack.
- Rule order is explicit and is part of the pack, because priority is
  meaning: "reschedule my appointment" must match `existing_request` before
  `new_request`, and any safety term must match before either.
- Every rule match is **named** in the log, so an answer can always be traced
  to the rule that produced it.
- Every content block carries a source and a review interval (see §9).

## 7. Two-layer source-of-emerging truth, validated by rules

Approved without an LLM. The validator is ordinary code — boolean checks
against tables, no inference.

**The two layers deliberately hold different *kinds* of truth, never the
same fact twice:**

| Layer | Nature | Holds |
|---|---|---|
| **Layer 1 — Approved content** | Static, authored, versioned | Reply text, prices, hours, keyword tables, required facts |
| **Layer 2 — Operating state** | Live, observed, per-contact and per-business | Opt-out flag, open escalation, human-taken-over flag, business paused, declared closure, content flagged stale |

**Why not two copies of the same fact:** duplicating a figure across two
sources is how knowledge bases come to contradict themselves, and the
contradiction always surfaces later than it was created. One fact, one home,
pointed at from everywhere else.

**Pre-send validator** — runs after a reply is selected and before it is
sent. Every check is deterministic:

| Check | Action when it fires |
|---|---|
| Contact has opted out | Send nothing (already implemented today) |
| Open escalation with a human assigned | Suppress the automated reply |
| Category disabled in this business's pack | Escalate instead of answering |
| Required facts missing for this category | Send the checklist, not the answer |
| Content block past its review interval | Flag to the operator; still answer |
| Business paused or outside declared operating state | Send the approved out-of-hours text, not the normal reply |
| Selected reply text empty or missing from the pack | **Escalate. Never improvise.** |

The last row is the shell's most important behaviour: when content is
absent, the system says so and hands to a human. It does not reach for the
nearest similar answer.

## 8. Record model

**Recommended name: `contact_case`.**

- `lead` — rejected. Sales framing that silently imports a sales model into
  domains that have none (a person claiming an entitlement is not a lead).
- `case` — rejected despite being the cleanest word: `CASE` is a SQL
  reserved word and would require quoting indefinitely.
- `contact_case` — neutral across selling, rights, and public-sector
  contexts, and it names the two real entities: a **contact** (the WhatsApp
  identity) and a **case** (their situation).

**Longer-term split, not now:** the current `leads` table conflates the
person (phone, display name, opted-out) with the case (status, category,
requested details). One person may have several cases over time. Splitting
`contact` from `contact_case` is the more correct model — and is a
migration, so it is gated behind the first outcome along with everything
else in §0.

## 9. Change over time — business, time, and economy

Content must change without touching code. This is a first-class
requirement, not an afterthought.

- **Business change** — new services, new branches, changed policy: edit the
  content pack. Rule order and approved text are data.
- **Time change** — hours, seasonal closures, campaign periods: held in
  Layer 2 operating state, consulted by the validator, never hard-coded into
  reply text.
- **Economic change** — prices, fees, thresholds: a single value in the pack
  with a source and a review interval. Changing a price is a content edit
  and a regression run, never a code change.

**Versioning:** every pack carries a version and a changelog entry. Any
change to approved content re-runs the accuracy tier of the test suite
before it is trusted. Content past its review interval is **flagged, not
deleted** — deletion loses the audit trail, and a flag is visible to the
operator.

## 10. Three example business configurations

Chosen to stress the shell differently: one sells and one does not; one has
an adversarial counterparty; one involves a physical asset.

**A. Aesthetic clinic front desk** *(the existing demo instance)*
Appointment-led, safety-critical, sells services. Enables all categories
**except `eligibility_screen`**, which is disabled outright — any treatment
suitability question is a hard escalation. Escalation reasons: medical or
urgent, complaint, refund dispute, privacy or legal, abusive language,
custom quote or guarantee, explicit human request, unclear intent.

**B. Tenancy deposit navigator**
User-side, sells nothing, adversarial counterparty. `new_request` starts a
claim; `requirements_checklist` carries most of the value (agreement,
inventory, correspondence, scheme reference); `eligibility_screen` returns a
conditions checklist and routes to a human adjudicator — never a verdict.
Escalation reasons: legal advice sought, deadline-expiry risk, counterparty
threat, unclear intent.

**C. Vehicle service and warranty desk**
Booking and claim hybrid with a physical asset. `new_request` is a service
booking; `eligibility_screen` returns warranty *conditions*, never a
coverage decision; `requirements_checklist` covers registration, service
history, invoice. Escalation reasons: safety defect, coverage dispute,
recall, unclear intent.

## 11. What is proven, and what is not

**Proven in the current clinic implementation:** deterministic
classification with named rules; approved-text-only replies; deduplication
by WhatsApp message ID; signature verification over the raw body;
fail-closed behaviour when the database is unreachable; escalation-record
creation; opt-out suppression; admin inspection. 47 automated tests cover
these.

**Not proven:** that the abstraction holds across businesses. There is
currently **one** instance and **zero** completed real end-to-end WhatsApp
conversations. Every multi-business claim in this document is a considered
design position, not a demonstrated result.

**Consequence for sequencing:** validate this spec on paper first, by
expressing the existing clinic entirely as a content pack. If the clinic
does not fit cleanly, the taxonomy is wrong and that is learned at no cost.
Writing code for three hypothetical businesses before one real business has
worked would pour effort into an unvalidated structure.

## 12. Open slots — decisions required before any build

- Content-pack storage: files in the repository, or database rows
- Whether `contact` and `contact_case` split at first implementation
- Required-facts collection: how many turns, and how state is held between
  them (the current build has no conversation-state tracking)
- Out-of-hours and business-paused approved text
- Review intervals per content class, per business
- Operator interface for editing packs
- Which business becomes instance two, and when

---

*WhatsApp Front-Desk Shell v0.1 — DRAFT. No authority over Clinic Lead Desk
V0. Name adoption, knowledge restructure, and all code changes are gated
behind clinic V0's first real end-to-end WhatsApp outcome.*
