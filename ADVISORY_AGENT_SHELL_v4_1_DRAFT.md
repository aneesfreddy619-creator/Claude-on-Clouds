# ADVISORY AGENT SHELL — VERSION 4.1, DRAFT

## Generic Emerging Truth Engine

**STATUS: DESIGN DRAFT. NOT CANON. NOT PROVEN. NOT DEPLOYED.**

This document supersedes `ADVISORY_AGENT_SHELL_v4_0_DRAFT.md` as the current design draft of the generic shell. **v4.0 is preserved unchanged as the historical design draft** — not renamed, not archived, not deleted. This document does not automatically modify, govern, or replace any live WhatsApp implementation, any Airdesk implementation, or any other project. It becomes authoritative only if the owner explicitly approves that status.

v4.1 is the **finalisation candidate**, pending owner review of the completed text. It carries the v3 lineage, the v4.0 architecture, Airdesk stress-testing, and two rounds of independent adversarial review. What it adds to v4.0: adaptive customer intake with deterministic read-back and confirmation; and comparison-triggered verification, with `Upamana` promoted from candidate vocabulary to a defined verification method. It intentionally defines invariants before implementation mechanisms.

---

# 1. WHAT THIS DOCUMENT IS

This shell defines a deterministic customer-advisory and business-automation architecture called the **Emerging Truth Engine**.

It defines:

- the two-source knowledge model;
- the Source → Element → Branch structure;
- the deterministic Supervisor / Brain;
- Joint Contracts connecting relevant Source A and Source B conditions;
- verification and provenance requirements;
- question-specific Emerging Truth;
- progressive narrowing of customer answers;
- confidence as verification completeness rather than probability;
- multi-question and multi-subject handling;
- customer-facing explanation and approved-output boundaries;
- adaptive customer intake with deterministic read-back and confirmation;
- comparison-triggered verification and check nomination;
- human escalation and action handling;
- integrity, audit and change-control requirements.

It does **not** contain domain knowledge. Airdesk aviation knowledge, clinic knowledge, or any other business-specific information belongs in a domain package built on top of this shell.

It does **not** define a system prompt or an AI agent.

---

# 2. HARD ENGINE BOUNDARY

The Emerging Truth Engine is deterministic.

The engine must not use:

- LLM inference;
- generative AI;
- RAG;
- embeddings;
- vectors;
- model-generated reasoning;
- invented missing facts;
- generated free-form customer advice.

Business truth comes only from authoritative facts, governing rules, explicit deterministic relationships and approved verification methods.

Customer-facing content remains selected from approved content. A future deterministic mechanism such as **approved template + verified typed parameters** may be adopted, but template parameterisation must not become unconstrained text generation.

---

# 3. GENERIC ENGINE AND DOMAIN PACKAGES

The intended architecture is:

```text
GENERIC EMERGING TRUTH ENGINE
        |
        +---- WhatsApp / MVP reference implementation
        |
        +---- Airdesk aviation domain package
        |
        +---- Other deterministic business domains
```

The generic engine knows **how to reason deterministically**.

A domain package knows **what the business/domain facts, rules, dependencies and approved customer content are**.

A domain package may provide:

1. Source A hierarchy;
2. Source B hierarchy;
3. Elements and Branches;
4. Joint Contracts;
5. deterministic check definitions;
6. verification-method assignments;
7. dependency relationships;
8. approved customer content;
9. plain-language terminology mappings;
10. journey/question rules;
11. provenance, authority, scope and effective-time metadata.

This is deterministic configuration and authored knowledge, not model training.

---

# 4. THE SUPERVISOR / BRAIN

The Supervisor is the deterministic Brain of the Emerging Truth Engine.

Its working character is:

> Remain present through the customer's journey, guide the customer toward the next useful step, operate in the customer's legitimate interest without unfairly damaging the business, help the customer understand their own position and the other party's position, and convert uncertainty into explicit actionable clarity. The Brain may only state what authoritative sources and deterministic verification establish.

"Guiding Angel" describes this behavioural objective. It is not a separate subsystem.

The Brain has two primary jobs.

## 4.1 Job One — scope and narrow

The Brain determines what the customer is asking **now** and identifies the smallest relevant region of Source A and Source B needed to address it.

It must not unload all potentially related knowledge merely because that knowledge exists.

## 4.2 Job Two — verify

The Brain determines the checks required for the current question, runs the applicable deterministic verification methods, asks for material missing information where necessary, re-verifies affected dependencies when facts change, and narrows the answer only as far as the verified state permits.

The Brain therefore knows how to:

- identify the current question or questions;
- resolve the relevant subject instance or instances;
- scope;
- traverse;
- activate relevant Elements and Branches;
- check;
- narrow;
- ask targeted clarifying questions;
- reverify affected relationships;
- detect missing, unavailable and conflicting information;
- determine verification completeness;
- assemble the Emerging Truth Set;
- read back and confirm a materially consequential interpretation of what the
  customer stated;
- evaluate authored structural comparability and consume its result through a
  nomination rule;
- detect when further deterministic narrowing is no longer possible;
- solve permitted actions across the Truth Set;
- select/render approved customer-facing output;
- explain the basis of an answer in customer language.

The Brain must remain conceptually one deterministic system. Its internal boundaries must remain testable rather than becoming opaque business logic.

For deterministic replay and auditability, external reads/check execution are isolated from deterministic evaluation: check execution may obtain authoritative facts, while scoping, applicability, contract evaluation, truth-set assembly, action solving, next-question selection and rendering operate over an immutable fact snapshot for the turn. Exact code/module seams remain OPEN.

---

# 5. ONLY TWO BUSINESS-TRUTH SOURCES

The engine has only two top-level business-truth Source categories.

The categories classify **propositions**, not documents, APIs, databases or files. One authoritative artifact may contain both A-type and B-type propositions.

Not everything the engine holds is a Source proposition. Verification artifacts
— comparison records (§15.2) are the current example — are **neither Source A
nor Source B**. They live in the provenance / integrity plane (§6), and are
ineligible as Joint Contract conditions **by type**, not by prohibition.

## 5.1 Source A — authoritative factual state and possibility

Source A contains propositions describing the relevant subject/world, including:

- what exists;
- what happened;
- what is available;
- what is currently true;
- what state something is in;
- what capability exists;
- what option or remedy exists;
- relevant customer/case facts;
- relevant operational state.

Polarity does not determine Source category.

```text
slot_available = false
```

is still Source A because it is an availability fact.

An authority's **asserted position** is also an A-side observation. For example, "the airline says this refund was approved" is a factual assertion about what the authority has stated. It is not automatically the engine's derived entitlement truth.

**Where the customer is the admissible authority.** For some A-side proposition
types the customer **is** the admissible authority, and no external verification
exists or is needed — customer preference, customer intent, and facts only the
customer can directly know about their own actions and choices are the usual
examples.

**The domain package declares, per proposition type, whether the customer is an
admissible authority.** Where it does not, the proposition requires whatever
authority its applicable check demands, and a customer statement — however
confidently made, however carefully confirmed — does not satisfy it.

This is a rule about **proposition type and authority**, not about `origin`.
`origin` (§6) records only how a proposition entered the engine and confers
nothing by itself.

## 5.2 Source B — authoritative governance and admissibility

Source B contains propositions defining:

- whether;
- when;
- for whom;
- under what conditions;
- to what extent;

an A-side state, capability, option, remedy or action is admissible, restricted, excluded, blocked or permitted.

## 5.3 Derived entitlement

Subject-specific entitlement, eligibility, permission and actionability are normally **Emerging Truths** produced by the Brain. They are not automatically raw Source A or Source B propositions.

A source authority may separately assert an entitlement as an A-side observed position. The asserted position and the Brain's derived truth must never overwrite one another.

---

# 6. PROVENANCE PLANE — FACTS ABOUT FACTS

Facts about a proposition are not a third business-truth Source.

They live in a **provenance / integrity plane**, which holds two kinds of record:

1. **metadata attached to a proposition** in either Source; and
2. **standalone verification artifacts** attached to no single proposition —
   comparison records (§15.2) are the current example.

The plane is not a Source. Nothing in it is business truth, and nothing in it
is eligible as a Joint Contract condition.

Every truth-relevant proposition must be capable of carrying at least:

```text
source_id
source_version
verified_at
effective_from
effective_to      // optional
scope
jurisdiction      // where applicable
authority         // where applicable
supersedes        // where applicable
verification_method

origin                 // customer | authority | system | derived
interpretation_state   // origin = customer only: stated | confirmed | corrected
original_value_span    // origin = customer only: what the customer actually said
normalizer_id          // where a normalized typed value was derived
normalizer_version     // where a normalized typed value was derived
```

**`origin` is universal, and confers nothing.** It is available to truth-relevant
propositions in **either** Source, and records only how or where a proposition
entered the engine. It does **not** determine whether a proposition is Source A
or Source B; it does **not** by itself establish authority; and it does **not**
by itself establish admissibility as evidence.

Sufficiency is decided elsewhere: by `authority`, by the proposition type, and
by the applicable check together with its authored minimum-basis rule (§10).
`origin = customer` is therefore neither a grant of authority nor a mark of
weakness — §5.1 governs when the customer is the admissible authority, and it
does so by proposition type.

This plane exists so the Brain can deterministically evaluate:

- supersession;
- effective period;
- authority;
- jurisdiction and scope;
- staleness;
- version skew;
- explicit absence;
- current vs historic rules;
- mid-journey changes.

Superseded information is not deleted merely because it is old. It may remain authoritative for an earlier effective period.

## 6.1 Interpretation state is not evidence

`interpretation_state` records whether the Brain's reading of a
customer-supplied proposition has been put to the customer and confirmed. It
says nothing about the world.

Hard invariant:

> **Confirmation of interpretation is not external verification of the
> underlying fact.** `interpretation_state = confirmed` must never set, imply,
> or substitute for a `verification_method`.

`stated` and `confirmed` are two states of **one** proposition, never two
propositions. That is what makes double-counting structurally impossible: a
required check is satisfied by the proposition or it is not, and there is only
one of it.

A customer correction produces `corrected` and a new interpretation. Where the
value changes, §11's dependency re-verification applies unchanged.

Derivation of a normalized typed value (§26) is likewise not evidence. It never
sets `verification_method`.

---

# 7. SOURCE → ELEMENT → BRANCH

Each Source may contain as many Elements as the business requires.

```text
SOURCE A
  A1
    A1.1
    A1.2
  A2
    A2.1
    A2.2
  ...

SOURCE B
  B1
    B1.1
    B1.2
  B2
    B2.1
    B2.2
  ...
```

## 7.1 Element

> **An Element is a business concept or question being classified or evaluated.**

Examples might include disruption initiator, booking channel, service state, evidence status, refund governance or rebooking governance.

## 7.2 Branch

> **A Branch is a bounded materially distinct state/path within an Element that changes downstream checks, dependencies or answers.**

Branches classify. They do not contain the final conclusion.

Two Branches are a useful default. Two or three will cover many operational concepts. This is not a hard engine limit. A genuine business concept may require more.

If two supposed Branches lead to no meaningful difference in checks, dependencies or answers, they should not be separate Branches.

## 7.3 Element vs dependency

A child that requires its **own verification checks** should normally be a separate Element connected by a dependency edge.

A child that merely selects which checks its parent requires may be a Branch.

Deep decision-tree nesting should be avoided where independent Elements and dependency relationships express the business more accurately.

---

# 8. SUBJECT GRAIN AND CARDINALITY

A case may contain more than one relevant subject instance.

Examples include:

- multiple passengers;
- multiple bookings;
- multiple tickets;
- multiple flight segments/coupons;
- multiple products;
- multiple claim line-items;
- multiple ancillary services.

Therefore every Element must declare the **grain of subject it classifies**.

Conceptually:

```text
Element: disruption_initiator
subject_grain: segment

Element: passenger_identity
subject_grain: passenger

Element: seat_service_status
subject_grain: ancillary_item
```

Branches are mutually exclusive only **within one resolved subject instance**, where the domain says they are exclusive. Different subject instances in the same case may occupy different Branches of the same Element.

The Brain resolves the applicable subject instance(s) before evaluating that Element.

The exact subject-resolution mechanism is OPEN, but the grain requirement is not.

Where a Branch set cannot classify a required subject instance, the result must not silently become `NOT_APPLICABLE`. It remains unresolved, normally `INCOMPLETE`, unless a deterministic applicability rule establishes otherwise.

---

# 9. SPARSE ACTIVATION AND RELEVANCE

Not every Element is active for every question.

The Brain activates only the Elements and subject instances relevant to the current answer path.

A selected Branch may activate another Element.

Example:

```text
seat_already_purchased = false
```

may close the seat dependency.

```text
seat_already_purchased = true
```

may activate the relevant seat-transfer, reassignment, refund or repurchase governance.

Core anti-friction invariant:

> **The Brain must not ask for information merely because that information exists.**

It asks only when resolving the information can materially change:

- the current answer;
- the relevant truth value/state;
- a permitted action;
- verification completeness;
- or a dependency that matters to the current journey.

Information already provided by the customer must not be asked for again.

## 9.1 Nomination as an activation source

A Branch is not the only thing that can activate work. A comparison record
(§15.2) whose result is `MATCH` may, through an authored **nomination rule**,
activate target-specific verification checks.

Nominated checks are **optional candidate checks by default** (§15.2). They
expand what the engine investigates; they do not by themselves expand what the
engine asks the customer.

If a material target or customer fact later changes so that the comparison is
no longer valid, the comparison is re-evaluated, **nominated-but-unstarted
checks are withdrawn**, and the withdrawal and its reason are recorded.
Orphaned nominated checks must not remain active.

---

# 10. JOINT CONTRACTS

A Joint Contract is not a separate service.

> **A Joint Contract is a simple authored deterministic relationship connecting the relevant Source A condition and Source B condition required for a particular Emerging Truth.**

Typical shape:

```text
IF relevant A condition
THEN require relevant B condition
BEFORE truth Z is established
```

Example:

> If a cancellation is airline-initiated, a refund route may exist, but the applicable refund eligibility conditions must also be satisfied before case-specific refund eligibility is established.

A Joint Contract may be one sentence.

The Brain executes the contract. The contract does not need to repeat universal Brain behaviour for missing information, source unavailability, contradiction handling or escalation.

Joint Contracts must nevertheless remain explicit and auditable. At minimum they require stable identity and versioning sufficient to answer:

- which relationship was evaluated;
- which version was in force;
- what A/B conditions it referenced;
- what truth it could establish;
- what required checks belonged to that evaluation;
- what temporal anchor selects the governing rule version for the question (for example booking time, event time or claim time where the domain requires one);
- what effective period/scope governed it;
- any authored minimum evidence/basis requirement that a satisfying fact must
  meet, which may include requiring a **confirmed** interpretation (§6.1) for a
  customer-origin proposition;
- whether the contract declares a comparison (§15.2) material to its own
  question, and therefore required rather than optional.

A contract may reference facts and requirements. It should not become an unrestricted programming language containing loops, hidden fallback behavior or unconstrained runtime reasoning.

A single underlying proposition must not be double-counted as two independent verification checks merely because it appears from two functional viewpoints. A genuinely one-sided contract may be explicitly represented as one-sided.

**Contracts consume Source propositions only.** A Joint Contract's A and B
conditions reference Source A and Source B propositions. A comparison record is
neither, so it is **ineligible as a contract condition by type** — not by a
rule someone must remember. A comparison result can therefore never be the
thing that establishes a target truth.

---

# 11. A CHANGES → REVERIFY, NOT MUTATE B

A material change in Source A does not automatically alter Source B.

Instead:

```text
relevant A fact changes
        ↓
identify dependent truth paths
        ↓
re-run required A/B checks
        ↓
retain, narrow, invalidate or replace affected Emerging Truths
```

The relevant B rule may remain exactly the same. Its prior application to the changed A-state may no longer be safe to reuse.

The same rule applies when the engine or customer executes a permitted action that changes the world. The action becomes a new A-side fact/state and dependent truth paths must be reverified.

A material change to Source B also triggers re-verification of already-established truths whose Joint Contracts, temporal anchors, scope or effective periods depend on the changed rule. B changes do not rewrite unrelated truths.

---

# 12. NOT_APPLICABLE AND VERIFIED ABSENCE

A relationship may legitimately be one-sided in a particular context.

`NOT_APPLICABLE` is allowed only when non-applicability has itself been deterministically established.

```text
NOT_APPLICABLE != INCOMPLETE
NOT_APPLICABLE != UNAVAILABLE
NOT_APPLICABLE != unknown
NOT_APPLICABLE != unauthored
NOT_APPLICABLE != silence
```

`NOT_APPLICABLE` carries provenance, effective context and scope like any other verified applicability result.

Similarly:

> **Silence is not permission. Verified explicit absence can be.**

A verified absence must record what was checked and the authoritative basis for concluding that the relevant thing is absent or does not apply.

---

# 13. APPLICABILITY AND EVALUATION STATES

Applicability is evaluated separately from the truth result.

```text
APPLICABLE
NOT_APPLICABLE
```

For an applicable truth path, the working evaluation states are:

```text
VALID
INCOMPLETE
UNAVAILABLE
CONTRADICTORY
```

## VALID

The question has been deterministically resolved under the applicable facts and rules.

`VALID` does not mean favorable.

```text
state = VALID
value = true
```

and

```text
state = VALID
value = false
```

are both valid results.

## INCOMPLETE

A required fact is missing.

Whenever the verification wall or next-question logic depends on a missing fact, the Brain must distinguish whether that fact is obtainable from the customer, obtainable from the system, or obtainable from neither. The exact schema is OPEN; the obtainability distinction is not.

## UNAVAILABLE

A required authoritative source, module or verification path should exist but cannot currently be accessed or trusted for the required evaluation.

`UNAVAILABLE` must never be coerced into false, absent, `NOT_APPLICABLE` or permission.

## CONTRADICTORY

Relevant authoritative propositions remain irreconcilably conflicting after applicable scope, time, authority, supersession and authored exception rules have been applied.

`CONTRADICTORY` is scoped to the affected question/truth path, not automatically to the whole case.

`BLOCKED` is deliberately not an evaluation state in this draft. If truth is established but an action cannot currently proceed because of a restriction, hold or pending condition, that constraint is represented in the action layer (§18).

---

# 14. CONFIGURATION INTEGRITY — OUTSIDE CUSTOMER TRUTH

The engine must distinguish **business contradiction** from **engine/domain-package integrity failure**.

Examples of configuration-integrity failure include:

- unresolved version skew among declared authoritative modules;
- contradictory governance metadata;
- impossible supersession chains;
- missing required modules;
- a declared authoritative source that cannot be loaded;
- conflicting effective-date metadata that prevents deterministic selection.

These are operator/system integrity problems, not customer-case truths.

They must fail closed.

Affected evaluations become `UNAVAILABLE` to the Brain. The customer must not be told that their own case is `CONTRADICTORY` merely because the domain package or filing system is inconsistent.

Configuration-integrity failures should produce auditable operator/maintenance signals.

---

# 15. VERIFICATION METHODS

The Brain follows deterministic verification methods appropriate to each check.

## 15.1 The method set

**Defined:**

- **Pratyaksha** — direct observation/calculation;
- **Shabda** — approved-authority verification;
- **Anupalabdhi** — verified absence/null verification;
- **Upamana** — deterministic authored structural-comparability verification (§15.2).

**Still candidate, deliberately not forced into the defined set:**

- **Anumana** — candidate name for deterministic derivation/inference;
- **Arthapatti** — candidate name associated with deterministic contradiction resolution.

Hard invariant:

> **Verification methods test or establish facts; they are not additional sources of business truth. Derivation and contradiction resolution must not be mislabeled as independent evidence.**

No method may introduce AI, RAG, embedding, vector or model inference.

Each check should be auditable with the method used and the evidence/source basis.

The membership question is **narrowed, not closed**. `Upamana` is defined
because it now maps to distinct executable deterministic behaviour, which is
the test a name has to pass. `Anumana` and `Arthapatti` remain open and are not
resolved here. A name survives only where it maps to distinct executable
deterministic behaviour.

## 15.2 Comparison-triggered verification (Upamana)

> **SIMILARITY MAY TRIGGER VERIFICATION.
> SIMILARITY MAY NOT ESTABLISH THE TARGET BUSINESS TRUTH.**

### The method

```text
compare(
  target_subject,
  comparator_subject,
  authored_dimensions,
  effective_context
) → MATCH | MISMATCH | INDETERMINATE
```

`Upamana` establishes **only the comparison result**. It does not establish
target policy, target entitlement, a target Source A proposition, a target
Source B proposition, or target Emerging Truth.

A comparison has exactly **three** results. Source or path failure is not one of
them.

> **`INDETERMINATE`** — the comparison **executed**, and the authored dimensions
> could not resolve comparability.
>
> **`UNAVAILABLE`** (§13) — the comparison **could not execute**, because a
> required source, module or verification path could not be accessed or trusted.

The two never overlap: `INDETERMINATE` is a statement about the dimensions,
`UNAVAILABLE` a statement about access. Where a comparison cannot execute, the
evaluation is `UNAVAILABLE` under §13's existing semantics and **no
`MATCH`/`MISMATCH`/`INDETERMINATE` result is fabricated** — the record carries
that failed execution state separately from `result`, or leaves `result` unset,
according to the eventual persistence schema (§37). **There is no second,
comparator-specific unavailable state, and `UNAVAILABLE` is never a comparison
result value.**

`INDETERMINATE` is deliberately not called `INCOMPLETE`: §13's `INCOMPLETE`
means a required fact is missing, and reusing one word for two things invites
exactly the coercion this engine exists to prevent.

### The comparison record

The result is a standalone verification artifact in the provenance / integrity
plane (§6) — **never Source A, never Source B, never target Emerging Truth.**

```text
comparison_id
target_subject
comparator_subject
authored_dimensions
comparator_source_id
comparator_source_version
target_source_id / target_source_version   // where applicable
effective_context
result                                     // MATCH | MISMATCH | INDETERMINATE
                                           // unset where the comparison could not execute
execution_state                            // executed | UNAVAILABLE (§13)
nomination_rule_id
nomination_rule_version
checks_nominated
checks_withdrawn
invalidated_by
verified_at
```

`nomination_rule_id` and version are not optional: without them a replay cannot
reconstruct **why these particular checks** were nominated, and §30 requires
that it can.

**Comparator provenance — sufficient for replay, not a grant of authority.**
Every comparator input must carry declared provenance: reference identity;
version or immutable snapshot identity; effective or historical context where
applicable; and an authority or basis appropriate to **each** comparison
dimension it is used for. Each dimension must satisfy an authored
minimum-basis requirement for comparison.

Admissibility as a comparator does **not** make the comparator authoritative
target policy, canonical precedent, Source A/B truth for the target, or an
entitlement basis. A previously handled case, in particular, is an internal
historical record — observed events, the rules applied at the time, business
actions, human decisions, outcomes — and being usable for comparison promotes
none of that into policy.

### Comparison dimensions

The generic Shell defines the mechanism. **The domain package defines which
dimensions are materially relevant.**

**Generic floor: at least one authored dimension must capture the materially
governing or constraint-defining context for the proposition being compared.**

Where jurisdiction, regulatory regime, governing authority or applicable rule
set is material to that proposition, it **must** be included. Where those
concepts are immaterial to a domain, the governing context is whatever actually
controls the compared proposition — for example a governing contract or policy
family, a product or programme version, an operating model, a service class, an
applicable eligibility regime, or another authored constraint of that kind. The
floor is that *something* governing is compared; it is not a universal
requirement for a jurisdiction dimension.

Preserved without exception: **similarity resting only on superficial
attributes — organisation size, country, market position, brand type or sector
— is never sufficient.**

Domain-authored dimensions may include, where material: jurisdiction or
governing regime; the proposition or remedy under examination; subject grain;
journey or event state; product or fare structure; booking and channel
conditions; contractual conditions; effective period; applicable exceptions.

### Nomination is a separate thing from the method

`Upamana` establishes `MATCH` / `MISMATCH` / `INDETERMINATE`. A **nomination
rule** may consume a `MATCH` and activate target-specific verification checks.
The two must not be collapsed: the method establishes a fact, the rule decides
what to do about it.

A comparator result is never itself a target Joint Contract condition (§10).

### Optional by default, required only where authored

Comparison-triggered investigation is **OPTIONAL by default.**

Optional comparisons and optional nominated checks:

- do not enter the verification-completeness denominator (§19);
- **never block the verification wall** (§22);
- should normally be executed silently where the system can answer them;
- should not generate customer questions unless they pass §21's ordinary
  materiality bar, which as optional checks they usually do not.

A comparison becomes **REQUIRED** only where an authored domain rule or Joint
Contract states that the comparison itself is material to the current question
or action — for example, a question that asks whether a materially comparable
peer treatment or precedent exists. For a required comparison, normal
required-check rules apply in full: completeness counts it, `UNAVAILABLE` and
missing material facts behave normally, and it may block the wall **for the
question that actually requires it**.

Even when required:

> **A comparison result is not target policy or entitlement verification, and
> never substitutes for it.**

### Withdrawal and re-verification

If a material target or customer fact changes such that a previous comparison
is no longer valid: re-evaluate the comparison, withdraw nominated-but-unstarted
checks, record the withdrawal and its reason, and reverify only the affected
dependencies.

### Previous handled cases as comparators

A previously handled case may serve as a comparator. It carries several
different kinds of content, and they must not be collapsed into one type of
truth:

- what happened;
- which governing rule applied at that time;
- what the business actually did;
- what a human decided;
- the eventual customer outcome.

A previous outcome must never automatically become policy, precedent,
entitlement, or Source A/B truth for the current case.

> **Previous cases and peer-organisation comparisons may expand or prioritise
> the Brain's verification path. They may not substitute for target-specific
> authoritative verification.**

### Cross-case comparator use — an access boundary, not a privacy subsystem

A previous handled case is another person's case. Using it as a comparator is
therefore governed, and the generic Shell states the minimum boundary:

- A previous handled case may be used as a comparator **only where the
  application is authorised to reuse that case's data for this purpose** under
  its applicable data policy and access rules.
- Comparison consumes **only the fields the authored comparison dimensions
  require** — nothing wider because it happens to be present.
- **Comparator customer identity and unrelated case details must never appear
  in customer-facing output** merely because that case was used as a comparator
  (§26.3 already forbids naming the comparator by default).
- Where the application's policy requires de-identification, minimisation or
  restricted access, comparison obeys it.
- Where required comparator data **cannot** be lawfully or authoritatively
  accessed, the comparison path follows the ordinary availability and
  requiredness rules — `UNAVAILABLE` for a required comparison, simply no
  comparison for an optional one. **The restriction is never bypassed, and
  never worked around by widening what is read.**
- Comparator reference information is recorded for replay **subject to the
  application's permitted audit and retention policy** (§30).

This is a data-governance and access invariant. It introduces no new Source, no
new truth state, no new Pramana, and no privacy subsystem.

### No corroboration score

Comparison support exists **only as auditable metadata** — the comparison
record above. There is no corroboration score, no percentage, no points, no
probability, no confidence increment, and no weighting by number of
comparators. `CONFIDENCE` retains its meaning from §19: target-question
verification completeness, and nothing else.

---

# 16. EMERGING TRUTH

Emerging Truth is not one global verdict for the case.

It is a **set of question-specific, subject-specific truths** at the current point in the journey.

Conceptually:

```text
refund / passenger 1 / segment 2
    state = VALID
    value = true

expense reimbursement / passenger 1
    state = INCOMPLETE
```

Working invariant:

> **Truth emerges for a specific question, about a specific resolved subject, at a specific point in the customer journey.**

A truth is stable relative to the currently established case state but may be reverified when a new material fact, source version or executed action affects its dependencies.

A failed or unresolved dependency blocks only truth paths that actually depend on it. A question/path that has not been activated is not assigned a truth state; it is omitted from the current Emerging Truth Set until relevance activates it.

---

# 17. MULTIPLE QUESTIONS AND SHARED DEPENDENCIES

A customer may ask about several things at once, for example:

- refund;
- rebooking;
- compensation;
- expenses;
- seat handling;
- baggage;
- name correction.

The Brain must preserve multiple truth paths simultaneously.

Paths may share facts and may affect one another.

A shared fact changing must invalidate/reverify all dependent paths, not merely the path where the change was first observed.

Established truth on one path should remain usable while another path remains incomplete, unless a dependency between the paths makes communicating or acting on the first path unsafe or misleading.

---

# 18. PERMITTED ACTIONS ARE SOLVED OVER THE TRUTH SET

A truth being individually `VALID` does not mean every action implied by it can be executed simultaneously with actions from other valid truths.

Example:

```text
refund_available = VALID/true
rebooking_available = VALID/true
```

may represent two valid options that become mutually exclusive once one is executed for the same subject.

Therefore:

> **Permitted actions are determined over the relevant Emerging Truth Set as a whole, not independently per truth.**

The action layer must be able to account for:

- mutual exclusivity;
- precedence;
- dependencies;
- actions that invalidate other truths;
- actions that require unresolved paths to be settled first.

Executing an action creates new A-side state and triggers re-verification of affected paths.

A currently established truth may still have an action that cannot be executed now because an applicable restriction, hold, dependency or pending condition prevents progression. This is represented in the action layer as **BLOCKED**, not as an Emerging Truth state.

The exact broader action vocabulary remains OPEN.

---

# 19. CONFIDENCE = VERIFICATION COMPLETENESS

Confidence is not probability of external success.

It is not a prediction that:

- an airline will pay;
- a claim will succeed;
- a lawsuit will be won;
- a business will cooperate;
- a future event will occur.

Working definition:

> **Confidence describes how completely the deterministic verification path required for this specific current question has been satisfied.**

The required check set is question-specific.

One answer may require three checks. Another may require ten. There is no universal denominator.

A check belongs in the required set only when its outcome can materially affect the conclusion, permitted action or required qualification. Checks must not be added merely to inflate a score or omitted merely to make an answer appear complete.

The engine must not aggregate question-level confidence into a single case-level confidence score.

Confidence/completeness from different questions must not be treated as directly comparable merely because their fractions are numerically equal.

A newly activated dependency may increase the number of required checks. That is **newly discovered relevance**, not evidence that previous established facts became less trustworthy.

Exact numeric formula, thresholds, points and customer-facing percentage display remain OPEN.

A non-numeric representation such as `FULLY_VERIFIED`, `PARTIALLY_VERIFIED` plus named outstanding checks may be sufficient for some implementations.

**Comparison and completeness.** An optional comparison, and any optional check
it nominates, is outside the denominator entirely (§15.2). A comparison that an
authored rule has made **required** counts toward completeness **for the
question that requires it, and for no other**; §19's existing prohibitions on
aggregation and cross-question comparison already govern that. In neither case
does a comparison result raise completeness on the target policy or entitlement
question — that question is satisfied only by target-specific verification.

---

# 20. OPEN-ENDED → CLOSED-ENDED PROGRESSION

Answers become narrower as the relevant verification path becomes more complete.

```text
overview
   ↓
qualified possibility
   ↓
case-specific position
   ↓
narrow established conclusion
```

The Brain may start broadly:

> If X happened, Y and Z are generally possible paths, subject to the applicable conditions.

As the customer reveals material information and checks complete, the Brain can state a narrower case-specific answer.

Design principle:

> **The Brain should not require more verification than the current answer actually needs.**

Counter-invariant:

> **The Brain must never present greater specificity or certainty than the completed verification path supports.**

---

# 21. ASKING VS ANSWERING

## 21.1 Intake adapts to what the customer has already supplied

**Sparse input** — give the broadest justified answer (§20) and ask for the
smallest material missing fact.

**Mixed input** — use the material facts already supplied, confirm only a
materially ambiguous interpretation, and ask only for the remaining material
gaps.

**Detailed input** — do not probe merely because a script expects questions.
Where interpretation is materially consequential, perform a deterministic
read-back and confirmation (§26). After confirmation, continue verification
without re-asking anything already supplied.

## 21.2 When confirmation is required

Confirmation is an ask, and it obeys the same discipline as any other ask.

- **Message length is never itself a confirmation trigger.**
- Confirmation is required only where misinterpretation could materially change
  the verification path, the conclusion, a permitted action, a dependency, or a
  qualification.
- **Never confirm a proposition that no activated check consumes.**
- An unchanged proposition is not repeatedly reconfirmed.
- A customer correction may require one new confirmation of the corrected
  interpretation.
- Where a normalized typed value is ambiguous under its own authored rules
  (§26), confirmation becomes materially required.

## 21.3 One questioning channel

All pending questions — ordinary required checks, confirmation asks, and any
comparison-derived check an authored rule has promoted to required — remain
under **one** deterministic next-question selection mechanism. Comparison does
not open a second questioning channel. Optional comparison expands what the
engine checks, not what it asks the customer, and a target check that the
system can answer for itself is run silently before anything is put to the
customer.

## 21.4 The general rule

The Brain asks a clarifying question only when an unresolved fact can materially change:

- the current answer;
- the relevant truth state/value;
- a permitted action;
- a currently relevant dependency;
- or the justified specificity/completeness of the answer.

If a fact cannot materially change the current answer path, the Brain should not demand it before answering.

If a material missing fact can reasonably be obtained, ask for it.

If it cannot be obtained, answer only to the level that is currently established. If the gap exists because a required source, module or verification path is `UNAVAILABLE`, follow the `UNAVAILABLE` handling rules instead.

The Brain should ask for the smallest useful next fact or bounded group of facts that can narrow the path.

Where more than one question is equally material, selection must remain deterministic rather than arbitrary.

---

# 22. THE VERIFICATION WALL

The Brain may eventually reach a point where the current path cannot be narrowed further using the engine's available relevance frontier.

The wall means:

> **No additional fact currently known by the engine to be relevant and obtainable can materially change the current conclusion.**

The wall does **not** mean the engine possesses omniscient certainty about every possible fact in the world.

The wall cannot be reached while a **required** check is `UNAVAILABLE`.

An **optional** comparison, and any optional check it nominates, can never
block the wall — its materiality is a hypothesis, not an established fact
(§15.2). A comparison an authored rule has made **required** behaves as any
other required check: if it is `UNAVAILABLE`, the wall cannot be reached until
the authored `UNAVAILABLE` exit and action handling of §27 applies.

A confirmed interpretation is not re-confirmed in the absence of a correction.

When the wall is reached:

- stop unnecessary probing;
- do not ask the same question in different words;
- state the strongest justified current conclusion;
- explain the remaining limitation briefly where relevant;
- do not become repetitive.

If the customer provides genuinely new material information later, reopen only the truth paths affected by that fact and reverify them.

Repeated or currently irrelevant customer information must not alter a conclusion merely because it is new text. Customer-supplied facts must nevertheless be retained for the life of the active case so they can become relevant if a later branch activates. Relevance gates evaluation, not case-level fact capture. Longer-term retention after the case is governed by the application's data policy.

---

# 23. DEPENDENCIES AND INFORMATION LOAD

The Brain may know many downstream consequences of an action without presenting all of them at once.

Example: a flight change may affect seats, baggage, meals, assistance or other services.

The Brain should first test whether a dependency is relevant.

```text
Did you already purchase a seat?
```

If no, that path may close.

If yes, activate the seat-specific handling checks.

Invariant:

> **Related dependency knowledge should trigger targeted relevance checks, not automatic customer-facing information dumps.**

The customer should receive what is useful for the current decision, not everything the domain package knows.

---

# 24. EXPLAINABILITY AND TRACEABILITY

Mandatory internal invariant:

> **Every customer-facing conclusion must be traceable to the exact facts, rules, Joint Contracts, verification checks and authoritative basis that produced it.**

A conclusion should therefore be reproducible from an audit record containing the relevant fact snapshot and rule/contract versions.

If the Brain cannot identify the deterministic basis for a conclusion, the conclusion must not be presented as established truth.

---

# 25. CUSTOMER-CENTRIC EXPLANATION

Internal traceability must not become customer-facing jargon.

Separate communication invariant:

> **Customer explanations are concise, universal and customer-centric. They explain only enough to resolve the customer's doubt.**

Industry terminology, aliases and keywords may exist internally.

A terminology entry may contain:

```text
canonical_term
aliases
keywords
plain_language_definition
case_relevance_description_by_truth_state
```

The Brain should normally use the plain-language rendering.

If the customer introduces an industry term, the Brain may briefly explain what the term means generally and what it means for the current case. Case-specific relevance wording must be keyed to the relevant established truth state/preconditions rather than stored as one unconditional description.

Technical rule IDs, Source codes such as `A1.1`, internal contract IDs and specialist terminology should not be exposed merely to prove that the system has a basis.

Customer explanation remains approved deterministic content. Plain-language rendering must not weaken or overstate the preconditions of the technical truth it explains.

---

# 26. APPROVED OUTPUT

The Brain determines **what may be said** from the Emerging Truth Set and then selects/renders approved content.

No runtime free-form generation is permitted by this shell.

The minimum safe rule is whole approved content selection.

A future deterministic composition model may use:

```text
approved template
+
verified typed parameters
```

provided that:

- the template is authored and approved;
- parameters come only from verified typed facts/truths;
- the resulting sentence cannot introduce unsupported meaning;
- the rendering's preconditions are at least as strict as the truth it communicates;
- the output remains replayable and auditable.

**The general rule above governs every asserting rendering. There is exactly one
defined exception, and it is stated here so no reader has to resolve an apparent
contradiction later.**

> **Sole currently defined exception — §26.1.** A confirmation/read-back
> template may render typed customer-stated, not-yet-verified parameters, solely
> to ask whether the Brain understood the customer correctly.

That exception is: **class-gated** (only a template classed `confirmation`);
**non-asserting**; **explicit in the sentence itself**; and **auditable**. A
value rendered under it cannot feed an asserting conclusion until it satisfies
that conclusion's own evidence requirement in the ordinary way.

## 26.1 Confirmation and read-back — a defined slice of parameterisation

General template parameterisation remains OPEN. **The confirmation/read-back
slice is defined here**, because adaptive intake cannot be deterministic
without it.

Permitted mechanism: an **approved confirmation-class template** plus **typed
customer-stated parameters**.

Permitted parameter classes, and no others:

- **a. verbatim customer span** — an exact substring of what the customer said;
- **b. authored enumerated label** — a value from a closed authored set;
- **c. deterministically normalized typed value** — for example a date, an
  airport identifier, or a booking channel.

For (c): normalization must be **authored** and **deterministic**; the original
customer span or value stays attached in provenance; `normalizer_id` and
version are recorded; the normalized value is **offered for confirmation, never
asserted as established truth**; and normalization is derivation, not evidence,
so it never sets `verification_method` (§6.1).

Determinism is not correctness. A normalizer can be perfectly deterministic and
still read a date or a place identifier the way the customer did not mean it,
which is precisely why the normalized value is offered rather than assumed.
**Where a normalization is ambiguous under its own authored rules, confirmation
becomes materially required** (§21.2).

**No free-form rewriting is permitted.** Normalisation happens through authored
templates and deterministic typed values, never through generated paraphrase.
Any wording that reads as a restatement of the customer's meaning comes from
the authored template, not from rewriting what the customer wrote.

## 26.2 Confirmation-template safety

An unverified customer-supplied parameter may render **only** inside an approved
template explicitly classed `confirmation`. The rendered sentence must itself
ask for confirmation. It may never be used in an asserting conclusion.

A read-back does one of two things, and the difference matters:

- **A — faithful restatement.** The parameter is content the customer actually
  supplied: a verbatim span, or an enumerated label the customer's own words
  selected. The sentence restates what they said.
- **B — a candidate offered for confirmation.** The parameter is a
  deterministically derived interpretation or normalization (§26.1c) — a parsed
  date, a resolved identifier, a mapped channel. **The customer did not state
  it; the engine derived it.** The sentence offers that candidate and asks
  whether it is right.

**A derived or normalized candidate must never be presented as something the
customer literally stated.** Where the wording cannot make that distinction
honestly, the value is not ready to be read back.

Under either form, a read-back may never introduce: classification the customer
did not supply; causation; entitlement; blame; assumptions; unstated facts; or
business-rule conclusions. No free-form generation, in either form.

> **The Brain may derive a candidate interpretation and OFFER it for
> confirmation. It must never derive an interpretation and ASSERT it as
> established fact.**

If confirmation is materially required but no approved confirmation template
exists, the Brain does not improvise. That is a configuration-integrity failure
(§14), and the affected evaluation becomes `UNAVAILABLE` under the existing
rules.

## 26.3 Comparator-derived alternatives

Default behaviour is to verify first and speak second: a `MATCH` nominates a
target check; where target verification can run now, it runs silently; and the
customer is told the **actual verified target result**.

An unverified comparator-derived alternative may be surfaced only where target
verification cannot currently complete, or where telling the customer that
another route is worth checking is itself materially useful to the current
interaction.

When surfaced, it is an **approved content class with authored preconditions**,
not a sentence composed at runtime. Its guardrails:

- approved deterministic content only;
- the comparator organisation is **not named by default**;
- no comparator amount, deadline, entitlement or condition is copied into the
  target case;
- the same sentence states that applicability to this customer's case is not
  yet verified.

Illustrative only, not a fixed string: *"There may be another route worth
checking under similar circumstances. I haven't verified that it applies to
your case yet."*

The class carries a precondition on the target verification state, so **the
alternative becomes unsayable the moment target verification resolves it** —
confirmed, rejected, still incomplete, or unavailable. It expires by
construction rather than by anyone remembering to withdraw it.

Exact template parameterisation beyond §26.1 remains OPEN.

---

# 27. HUMAN ESCALATION

Human escalation is not an Emerging Truth state.

It is an **action/response decision** made by the Brain from unresolved portions of the Truth Set and authored escalation rules.

A negative answer does not automatically escalate.

A complex answer does not automatically escalate.

An incomplete question may simply require another customer fact.

A contradiction may require escalation only when deterministic resolution is exhausted and the domain rules call for human handling.

A required check that remains `UNAVAILABLE` beyond an authored domain/application threshold must also route to an authored next action, which may include human escalation. The engine must not leave a customer indefinitely in an unresolved unavailable state.

Confirmed portions of the case may still be communicated while another portion is escalated, unless doing so would create a dependency/action conflict.

Current reference route for the initial implementation is founder-operated email escalation with a 24-hour response target. That route is an application choice, not a universal engine primitive.

Human case resolution does not automatically become global/canonical business truth.

---

# 28. CONTRADICTION

Apparent disagreement is not automatically contradiction.

Before `CONTRADICTORY` is produced, the Brain must be able to account for the applicable authored rules concerning:

1. same subject instance;
2. same proposition/action;
3. relevant effective time;
4. scope/jurisdiction;
5. authority;
6. applicability;
7. supersession;
8. authored exceptions or relationships.

Different scopes may mean both propositions stand.

Old and new rules may mean succession rather than contradiction.

A resolved conflict must leave an audit trace indicating the conflict and the deterministic rule that resolved it.

A true unresolved same-relevant-scope conflict may produce `CONTRADICTORY` for the affected truth path.

Exact precedence/exception ordering remains OPEN.

---

# 29. CONFIGURATION, SOURCE AND MAINTENANCE SIGNALS

The engine must not silently normalize integrity problems in its domain package.

A resolved or detected issue such as:

- stale authoritative content;
- superseded but still referenced rule;
- incompatible governance versions;
- missing module;
- unreachable authority source;
- conflicting metadata;

should be available as an operator/maintenance signal.

Customer output should describe only the resulting verified limitation relevant to the customer. It should not expose internal filing/version problems unless that disclosure is itself approved and useful.

---

# 30. AUDITABILITY AND REPLAYABILITY

The engine must be designed so a prior answer can be reconstructed from the information that was available when it was produced.

An answer audit should be capable of identifying at least:

- case/turn and immutable snapshot identity;
- question and subject instance;
- relevant A facts and versions;
- relevant B rules and versions;
- provenance/effective context;
- Joint Contract(s) evaluated;
- checks required and checks completed;
- verification method(s) used;
- resulting truth state/value;
- unresolved/blocked/unavailable items;
- action consistency result;
- approved content/rendering selected;
- customer-stated value and the original customer span;
- `interpretation_state`, and the correction where one occurred;
- `normalizer_id` and version where a normalized typed value was used;
- confirmation template id and version, and the confirmation result;
- `comparison_id`, comparator source, version and effective context;
- comparison dimensions evaluated and the comparison result;
- `nomination_rule_id` and version;
- checks nominated, checks withdrawn and why;
- the eventual target-specific check result;
- for a previous-case comparator, the reference identity retained under the
  application's permitted audit and retention policy — never more comparator
  detail than that policy allows.

All authoritative reads used to produce one customer turn must belong to one logically consistent snapshot/version context. A and B must not be combined from incompatible intra-turn states.

Exact persistence schema is OPEN.

Replayability is mandatory: the same authoritative fact snapshot, case state, Joint Contract versions, approved-content versions and engine-behaviour version must produce the same result. If a prior answer cannot be replayed from its recorded basis, mandatory traceability has not been achieved.

---

# 31. CUSTOMER JOURNEY

The core engine is journey-aware but not tied to one industry lifecycle.

Airdesk may configure stages such as:

```text
BOOKING
TRAVEL
DISRUPTION
POST-TRAVEL / CLAIMS
```

Another business may define different stages.

Journey state affects relevance and next useful action. It does not replace Source A/B truth.

The customer should progressively understand:

- what their position is;
- what options exist;
- what conditions matter;
- what remains unknown;
- what next action is useful;
- why the Brain's answer is as broad or as narrow as it currently is.

The product objective is **justified confidence**, not artificial certainty.

---

# 32. DOMAIN TERMINOLOGY

Domain terminology may be stored comprehensively, including:

- canonical term;
- common alternative names;
- abbreviations;
- keywords;
- plain-language meaning;
- related Elements/Branches;
- case-relevance description keyed to the relevant truth state/preconditions.

This vocabulary supports deterministic recognition and approved explanation.

Customer-facing language should remain universal unless the technical term itself is materially useful or the customer has introduced it.

---

# 33. CHANGE CONTROL

Changes to domain facts, governing rules, Joint Contracts, check sets or approved content can alter customer answers.

They therefore require controlled versioning and regression review.

At minimum, a material change should answer:

- what changed;
- which Source/Element/Branch/Contract is affected;
- why it changed;
- effective date/scope;
- which existing truth paths depend on it;
- what tests/cases must be replayed;
- whether customer output changes.

A change to a relevant A fact triggers re-verification of dependent relationships. It does not silently rewrite B.

A change to B triggers re-verification only for relationships/truths for which the changed rule is applicable/effective under the relevant temporal anchor and scope.

---

# 34. TESTING STANDARD

The engine is not proven because its architecture is coherent.

Every important invariant must eventually be falsifiable through deterministic tests and real implementation evidence.

Test categories should include:

- Source A/B proposition classification;
- subject grain and multiple instances;
- Branch exclusivity per subject instance;
- sparse activation;
- one-sided/`NOT_APPLICABLE` relationships;
- missing vs unavailable vs explicit absence;
- A-change dependency invalidation;
- Joint Contract evaluation;
- question-specific Emerging Truth;
- multiple concurrent truth paths;
- action conflicts across valid truths;
- confidence/check-set materiality;
- progressive narrowing;
- verification-wall behavior;
- new material fact after wall;
- configuration-integrity failure;
- source supersession and effective dates;
- jurisdiction/authority scope;
- customer explanation from exact basis;
- approved-output precondition enforcement;
- human escalation of unresolved portions only;
- replay of historical cases against fixed snapshots;
- confirmation triggered only by material ambiguity;
- message length never triggering confirmation by itself;
- no reconfirmation of an unchanged proposition;
- a corrected interpretation reopening affected dependencies;
- a confirmation-class template refusing an unverified parameter outside that
  class;
- deterministic normalizer replay;
- ambiguous normalization requiring confirmation;
- confirmation never setting `verification_method`;
- comparison results `MATCH` / `MISMATCH` / `INDETERMINATE`;
- comparator-source failure yielding `UNAVAILABLE` under §13, with no
  comparison `result` fabricated;
- `INDETERMINATE` and `UNAVAILABLE` never standing in for one another;
- nomination occurring after `MATCH` only;
- optional nomination not affecting verification completeness;
- optional nomination not blocking the verification wall;
- a required comparison behaving as a normal required check;
- a comparison never satisfying a target entitlement or policy check;
- nomination withdrawal after comparison invalidation;
- a comparator-derived customer alternative self-expiring once target
  verification resolves;
- comparison reading only the fields its authored dimensions require;
- comparator identity and unrelated case detail never reaching customer-facing
  output;
- an unauthorised comparator data access following ordinary availability rules
  rather than being bypassed.

Airdesk is a useful high-complexity stress-test domain. It is not proof of the generic engine.

The WhatsApp implementation is a useful small reference implementation. It is not automatically the generic architecture.

---

# 35. ARCHITECTURE SUMMARY

```text
CUSTOMER QUESTION(S)
        |
        v
SUPERVISOR / BRAIN
  - resolve subject grain/instance
  - determine current question
  - scope relevant knowledge
        |
        +-----------------------+
        |                       |
        v                       v
     SOURCE A                SOURCE B
 factual state /           governance /
 possibility               admissibility
        |                       |
   Elements                  Elements
        |                       |
   Branches                  Branches
        \                       /
         \                     /
          +---- BRAIN --------+
                |
       required checks only
                |
      deterministic verification
                |
         Joint Contract(s)
                |
                v
       EMERGING TRUTH SET
                |
      inter-truth consistency
      / permitted-action solve
                |
     verification completeness
                |
       +--------+---------+
       |                  |
   answer now       material fact missing
       |                  |
       |          targeted clarification
       |                  |
       +--------<---------+
                |
       verification frontier
                |
         narrow until wall
                |
                v
     APPROVED CUSTOMER OUTPUT
```

Supporting every truth-relevant proposition, and holding standalone
verification artifacts such as comparison records (§15.2):

```text
PROVENANCE / INTEGRITY PLANE
source · version · authority · scope · effective time · verification method
origin · interpretation state · normalizer · comparison records
```

---

# 36. CORE INVARIANTS

1. **Only two business-truth Source categories exist: A and B.**
2. **A and B classify propositions, not documents.**
3. **Source A describes authoritative factual state and possibility.**
4. **Source B describes authoritative governance and admissibility.**
5. **Facts about facts live in the provenance/integrity plane, not a third Source.**
6. **Subject-specific entitlement is normally Emerging Truth, not raw A/B truth; an authority's asserted position is an A-fact and never overwrites the Brain's derived truth.**
7. **Elements declare subject grain; Branches classify one resolved subject instance.**
8. **Branches classify; they do not conclude.**
9. **Only relevant Elements are activated.**
10. **The Brain asks only for facts capable of materially changing the current path.**
11. **Joint Contracts are simple authored deterministic A/B relationships.**
12. **A material change to relevant A or B triggers dependency re-verification; it does not silently mutate unrelated facts or truths.**
13. **`NOT_APPLICABLE` is verified non-applicability, never silence or missing knowledge.**
14. **Truth states are separate from truth value; `BLOCKED` belongs to the action layer, not the truth taxonomy.**
15. **Configuration-integrity failures are not customer contradictions.**
16. **Truth emerges per question, per subject, at the current journey state.**
17. **One unresolved path does not block independent established paths unless a dependency makes communicating or acting on the established path unsafe or misleading.**
18. **Permitted actions are solved over the relevant Truth Set, not per truth in isolation.**
19. **Confidence measures verification completeness, not probability of external success.**
20. **Every required check must be materially relevant to the conclusion.**
21. **Answers narrow as the relevant verification path becomes complete.**
22. **The Brain never presents greater specificity than verification supports.**
23. **A required `UNAVAILABLE` check prevents a false verification wall.**
24. **At the wall, stop probing and state the strongest justified conclusion.**
25. **Every conclusion is traceable to exact facts, rules, checks and provenance.**
26. **Customer explanations remain brief, universal and approved.**
27. **Verification methods never become new sources of business truth.**
28. **No AI/LLM/RAG/vector/model inference exists inside this engine.**
29. **Human escalation is an action decision, not a truth state.**
30. **Human resolution does not automatically become canonical truth.**
31. **The Brain is replayable from one consistent fact snapshot and version context; external reads/check execution are isolated from deterministic evaluation.**
32. **Architecture agreement is not proof; invariants must survive implementation and tests.**
33. **Confirmation of interpretation is not external verification of the underlying fact.**
34. **`stated` and `confirmed` are states of one proposition, never two; they cannot be double-counted.**
35. **The domain declares which proposition types may treat the customer as the admissible authority.**
36. **Message length never triggers confirmation; only material ambiguity does.**
37. **The Brain may derive a candidate interpretation and offer it; it must never derive one and assert it.**
38. **An unverified customer-stated parameter renders only inside an approved confirmation-class template that asks for confirmation.**
39. **Similarity may trigger verification. Similarity may never establish the target business truth.**
40. **A comparison result is a verification artifact in the provenance plane — never Source A, Source B, or target Emerging Truth — and is ineligible as a Joint Contract condition by type.**
41. **Comparison-triggered investigation is optional by default; it is required only where an authored rule says the comparison itself is material.**
42. **Optional comparison never enters the completeness denominator and never blocks the verification wall.**
43. **There is no corroboration score. Comparison support exists only as auditable metadata.**
44. **`origin` records how a proposition entered the engine. It confers no authority and no admissibility by itself.**
45. **`UNAVAILABLE` is never a comparison result. A comparison that cannot execute yields no `MATCH`/`MISMATCH`/`INDETERMINATE`.**
46. **A derived or normalized candidate is offered for confirmation, never presented as something the customer stated.**
47. **Admissibility as a comparator confers no policy, precedent, Source A/B truth or entitlement.**
48. **A previous case may be compared only where the application is authorised to reuse it; comparison reads only what its authored dimensions require, and never leaks comparator identity or unrelated detail into customer-facing output.**

---


# 37. INTENTIONALLY OPEN IN VERSION 4

The following are intentionally not locked by this draft:

1. exact confidence formula or customer-facing numeric display;
2. **narrowed in v4.1** — Pramana membership: `Upamana` is now defined (§15.2);
   the status of `Anumana` and `Arthapatti` remains open;
3. exact temporal/freshness persistence schema;
4. exact Source/Element/Branch storage representation;
5. exact Joint Contract/rule configuration mechanism or DSL;
6. exact subject-resolution algorithm — still open;
7. identity and authorization model;
8. exact journey persistence/re-entry model;
9. exact stale-content evaluation policy;
10. exact action-state vocabulary;
11. **narrowed in v4.1** — template parameterisation: the confirmation/read-back
    slice is defined (§26.1); parameterisation of asserting templates, of any
    template carrying a figure, amount, deadline or entitlement, and of
    multi-proposition composition, remains open;
12. configurability permissions for founder/client/system;
13. exact contradiction precedence/exception ordering;
14. exact implementation seams and code-sharing strategy between the generic engine and current MVP;
15. exact branch-count conventions beyond the bounded/default principle;
16. exact persistent audit schema;
17. exact temporal-anchor vocabulary and domain mapping;
18. exact authored thresholds and routing for persistent `UNAVAILABLE` checks;
19. exact basis-strength taxonomy used by domain contracts — **open, and
    load-bearing.** After v4.1 this field carries three jobs at once: minimum
    evidence strength, whether a check requires a *confirmed* interpretation
    (§6.1), and whether the customer is an admissible authority for a
    proposition type (§5.1). It is the first item worth closing after
    finalisation.

**Not an open engine question.** Domain-specific comparison dimension sets are
authored by the domain package by design (§15.2). The generic floor — at least
one governing-regime dimension — is fixed here, so the absence of a universal
dimension list is not an unresolved engine defect.

These are open implementation/product decisions, not permission to violate the invariants above.

---

# 38. CURRENT REFERENCE IMPLEMENTATIONS / STRESS TESTS

## WhatsApp / clinic MVP

The existing MVP may be used to prove small deterministic behaviours such as fail-closed reads, approved output selection, idempotency and escalation handling.

Clinic-specific fields such as `opted_out`, `lead_status`, WhatsApp timing windows and transport identifiers are **not generic engine primitives**.

## Airdesk

Airdesk is a domain stress test and future aviation implementation candidate.

Its useful transferable disciplines include:

- missing-module failsafe;
- source/version discipline;
- effective dates and jurisdiction;
- per-claim evidence basis;
- sparse knowledge/completeness gates;
- multiple simultaneous customer outcomes;
- operational vs regulatory distinctions;
- customer-centric plain-language guidance.

Its current AI/persona architecture, aviation-specific classifications, commercial assumptions and governance file structure are not generic-engine law.

Known Airdesk source/version conflicts must be treated as configuration-integrity test cases, not silently reconciled.

**Findings carried forward for later Airdesk work — inputs to a future
integration, not changes approved here, and not generic rules.** Airdesk
predates this Shell and independently arrived at several of the same ideas;
where it diverges, the divergence is informative rather than authoritative:

- a paraphrase checkpoint that fires exactly once, bound to a moment in the
  script rather than to material ambiguity;
- "infer before you ask, and state the assumption plainly" — deriving a value
  and asserting it, which invariant 37 forbids;
- read-back by free-form model paraphrase, incompatible with §2 and §26;
- delivering a protective move before the case is fully mapped, against §20's
  counter-invariant;
- peer-policy authoring by reference, such as one regime's duty of care
  recorded as "same as" another's — a comparator that has already become truth
  at authoring time, which §15.2 forbids at runtime;
- experience-derived probability bands presented as domain guidance — previous
  outcomes generalised into policy, against §15.2's rule on previous cases.

None of these is fixed by this document, and no Airdesk file is modified by it.

---

# 39. STATUS OF THIS DRAFT

Version 4.1 remains a design hypothesis, and is the finalisation candidate
pending owner review of this completed text.

**What v4.1 adds to v4.0:** adaptive customer intake with a deterministic
read-back mechanism; the `stated` / `confirmed` / externally-verified
distinction with confirmation explicitly separated from evidence; `Upamana`
promoted to a defined verification method; comparison-triggered verification
with its record, dimension floor, optional-by-default rule and withdrawal
handling; and the narrowing of two previously open items.

**v4.0 is preserved unchanged** as the historical draft.

It is deliberately more explicit than v3 about:

- deterministic no-AI operation;
- two fixed Source categories;
- Source/Element/Branch hierarchy;
- subject grain/cardinality;
- provenance and effective time;
- simple Joint Contracts;
- question-specific Emerging Truth;
- verification completeness;
- progressive answer narrowing;
- verification wall;
- multi-path action consistency;
- configuration integrity;
- explainability and approved customer language;
- adaptive intake, confirmation, and the limits of comparison.

It does not claim that the architecture has been proven in production. Nothing
in it has been implemented or tested. Coherence is not proof — §34 and
invariant 32 say so, and they remain the most important sentences here.

The next step after owner review is not wholesale refactoring. The architecture should be introduced incrementally and proven on individual existing behaviours before broader adoption.

**Define invariant → independent review → owner approval → implementation/test/deploy → independent verification.**