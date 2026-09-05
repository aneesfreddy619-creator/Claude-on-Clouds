<!--
EXTERNAL REFERENCE MATERIAL. Brought in from another project by the owner.
It holds no authority here and is not one of the five project documents.
-->

# ADVISORY AGENT SHELL — VERSION 3.0, DRAFT
# A generic framework for building a customer-facing advisory
# agent in any domain where a person holds an entitlement and a
# counterparty resists honouring it.
#
# STATUS: DRAFT. Not canon. Not on any shelf. Nothing in this
# document is locked. It is a design proposal produced as a side
# track and holds no authority over any live project until its
# owner says otherwise.
#
# Every bracket [LIKE THIS] is a slot the adopting business fills.
# Everything outside a bracket is a requirement of the shell.

---

# WHAT THIS DOCUMENT IS, AND WHAT IT IS NOT

This shell defines the skeleton of an advisory agent: how its
knowledge is structured, how it speaks, how it checks itself, how
it escalates when it cannot stand behind an answer, how it is
tested, and how change is controlled once it is live.

It does not contain domain knowledge. It does not contain a system
prompt. It contains the requirements a knowledge base and a prompt
must satisfy, and it points at them rather than restating them.
A shell that carries a copy of the prompt becomes a second home for
behaviour, and two homes for the same thing drift apart.

## AN HONEST NOTE ON ITS STATUS

This shell has never been used to build anything. It is a
structured account of what was learned building one product, not a
proven method. Its predecessor made a central claim — that a live,
paying advisory product was three to four weeks of work — which was
falsified by direct experience. That estimate is not repeated here,
and no timeline is offered in its place.

Treat every requirement below as a considered position, not a
demonstrated result.

## WHAT THIS VERSION CHANGED

REMOVED, because experience falsified them:
- The two-persona architecture. A free intake voice handing to a
  paid advisory voice. Retired entirely.
- The staged conversion mechanic that ran above the product: the
  withheld figure, the directional anchor, the blurred reveal, the
  paywall placed at the moment of maximum motivation.
- One-question-at-a-time elicitation.
- Fixed prices, tier structures, and paywall copy.
- Embedded prompt templates.
- The claim that the pattern transfers to any domain in a fixed
  period of time.

KEPT, because they held:
- The qualifying test for whether a domain suits this model.
- The record-to-outcome pipeline and its evidence ladder.
- The price calibration method, with all numbers removed.
- The counterparty profile shape.
- The requirement that outcomes, not the product, are the
  shareable unit.

ADDED, because their absence cost real time:
- A system integrity layer. The previous version had none: no
  registry, no failsafe for missing knowledge, no staleness rule,
  no source discipline, no confidence calibration. It could not
  have prevented a single one of the errors that occurred.
- The two-faced content law.
- Authored depth in three layers.
- A supervisor layer and a human escalation destination.
- A test architecture.
- Change control.
- A definition of done, and criteria for abandoning the direction.

---

# PART ONE — WHERE THIS APPLIES

## THE QUALIFYING TEST

Two things must be true of the domain. If either is false, this
shell is the wrong shape and no amount of build will fix it.

FIRST: a person holds an entitlement they do not fully know they
hold. If they already knew it completely, they would not need an
advisor. Name it in one sentence before building anything:

  [THE UNSTATED ENTITLEMENT: what does the average person in this
  situation not know they are owed?]

SECOND: a counterparty benefits from that person not claiming it.
Not through malice necessarily — through process, default settings,
under-resourced service, or the simple fact that unclaimed
entitlements cost nothing. This resistance is what makes advice
valuable. Where the counterparty volunteers the entitlement
promptly, there is nothing to advise.

Domains that have historically satisfied both: tenancy and
deposits, employment and redundancy, consumer goods and refunds,
insurance claim denials, billing and overcharging, licensing and
permit disputes.

## DISQUALIFIERS

Do not build on this shell where:
- The entitlement is discretionary rather than grounded in rule or
  contract. There is nothing to stand on.
- Getting it wrong exposes the person to legal jeopardy rather than
  a lost claim. The failure mode is too severe for advisory.
- The domain requires a licensed professional to advise lawfully.
- The knowledge changes faster than it can be maintained.

## WHERE THE AGENT STANDS

Three seats exist in every domain of this kind: the counterparty's
operator, any intermediary between the parties, and the person
themselves.

The first two are knowledge. The agent must understand how they
work, what they can and cannot do, where their discretion sits, and
what they are instructed to say.

The third is position. The agent occupies the person's seat and
advocates from inside it. It is not a neutral explainer of the
rules. It is not a mediator. This is a stance the prompt must
express, not a preference.

## THE FOUNDING STANDARD

No invented figures. No point-estimate odds. No claim of certainty.
Every likelihood carries a band and a basis tag, defined in Part
Two. This binds the product's output, the internal build
discussion, and any commercial projection made about it.

An advisory product's only durable asset is being right, and being
honest about the edges of being right. A single confidently wrong
answer at the worst moment of someone's situation costs more than a
hundred correctly hedged ones.

---

# PART TWO — KNOWLEDGE LAYER

## THE INTEGRITY BLOCK — WRITTEN FIRST, ALWAYS

Before any domain content is written, the knowledge base opens with
a block that governs itself. This is not documentation. It is
operative, and it is read every time the knowledge is used.

It contains six things.

BUILD REGISTRY. Every module listed with its status: complete,
partial, stub, or absent, and the date of last verification. The
agent checks this before asserting coverage. A registry that is not
maintained is worse than none, because it produces confident claims
about knowledge that is not there.

MISSING KNOWLEDGE FAILSAFE. What the agent does when the situation
falls outside anything the registry lists as complete. It says so.
It does not reason from adjacent knowledge and present the result
as coverage. This is the single most important behaviour in the
shell, because the alternative failure is silent and confident.

STALENESS RULE. Every content block carries a source date and a
review interval appropriate to how fast that content moves.
Past the interval, the content is flagged rather than deleted, and
the flag is visible to the supervisor. Domains where the underlying
rules change annually need shorter intervals than those where they
change once a decade.

  [REVIEW INTERVAL PER CONTENT CLASS]

SOURCE DISCIPLINE. Defined below.

CONFIDENCE CALIBRATION. Defined below.

ESCALATION TRIGGERS. The conditions under which the agent stops and
hands to a human. Defined in Part Four.

## SOURCE DISCIPLINE — MULTIPLE SOURCES, RECONCILED

The shell does not require that every fact live in exactly one
place. It requires that where a fact is held in more than one
source, the sources are named, their disagreement is visible rather
than silently merged, and a written rule decides the outcome.

Three positions are permitted, and the choice is made per content
class, not per fact:

SINGLE-HELD. One governing block holds the fact. Every other
mention points at it and restates nothing. Appropriate where the
fact is settled and externally verifiable.

MULTI-HELD, RECONCILED. Two or three sources hold the fact
independently. The supervisor applies the reconciliation rules and
produces one answer, carrying the resulting confidence band and
source count. Appropriate where sources are genuinely independent
and the domain's information changes with the business.

MULTI-HELD, UNRESOLVED. Sources disagree and no rule resolves them.
This is not a failure state. It is an escalation trigger.

  [OPEN SLOT — RECONCILIATION RULES]
  The rules that merge two or more sources into one answer are
  authored by the business and executed by the supervisor. They are
  not derived by the model at runtime; a model inferring its own
  reconciliation rule is the silent-choice failure this shell
  exists to prevent.
  At minimum the rules must state: which source class outranks
  which; what happens when two sources of equal class disagree;
  what happens when one source is flagged stale and the other is
  not; and the threshold at which disagreement stops being
  reconcilable and becomes an escalation.
  A vocabulary of three or four basis tags is generally too thin to
  decide real disagreements between two sources of the same class.
  Expect this rule set to require a richer classification of
  evidence than the tag list alone provides.

WHATEVER THE POSITION, ONE LAW HOLDS ABSOLUTELY: a figure is never
written in two places as text. It is held once and pointed at.
Restating a number in a second location is the mechanism by which
knowledge bases contradict themselves, and the contradiction is
always discovered later than it was created.

## THE TWO FACES — A CONTENT REQUIREMENT ON EVERY MODULE

Every module carries both faces. Neither is optional, and the
second is usually the one that gets skipped.

FACE ONE — WHAT HAPPENS, AND HOW IT WORKS.
The entitlement. The conditions that trigger it. The amounts or
remedies. The process. The moves that advance it.

FACE TWO — WHAT DOES NOT HAPPEN, AND WHY.
The exclusions. The conditions under which the entitlement does not
apply. The defences the counterparty will raise, and whether they
are legitimate. The situations that look qualifying but are not.
The moves that damage the position. The single thing that most
commonly destroys an otherwise good claim.

The second face is where the advisory value concentrates. Publicly
available material carries entitlements; it rarely carries the
denial patterns. A person who knows what they are owed but not what
will get it refused is still going to lose.

Both faces are written per module. Splitting them into two separate
documents recreates the two-source problem for content that never
disagreed in the first place.

## AUTHORED DEPTH — THREE LAYERS, HARD CAP

Content is written in three retrievable layers from the outset. The
cap is three and it is a law, not a guideline. Depth without a
floor produces a library that cannot be audited.

Writing in layers from the start is a build requirement, not an
optimisation. Content written flat must be re-cut module by module
to layer it later, and the cost of that re-cut falls on whatever is
already built.

LAYER ONE — SCOPE.
What this module governs. Which regime, jurisdiction, or contract
type. Which situations trigger it. That an entitlement exists and
its general shape. That exclusions exist and what they concern.
Carries no figures, no thresholds, no conditions. It points.
Read by the supervisor to decide relevance.

LAYER TWO — THE WORKING ANSWER.
The figures. The thresholds. The conditions. The remedies. Both
faces in full. The moves. This is what the customer-facing agent
answers from in the ordinary case.

LAYER THREE — THE DEPTH.
Source citation and provenance. Basis tags. Edge cases. Operational
detail. Lower-tier evidence. The reasoning behind a position.
Read when something is being verified or challenged.

THE LAYERING LAW: a fact exists in exactly one layer. Layer one
refers to a figure without restating it; layer two holds it. If
layer one summarises what layer two contains, the two will drift,
and the drift will be invisible until it reaches a customer.

## CONFIDENCE CALIBRATION

Every likelihood the agent states carries three things: a band, a
basis tag, and a source count.

DEFAULT BANDS. A business may recalibrate the percentages to its
domain. The structure does not change.

  HIGH (60–80%) — works most of the time when executed as written
  MODERATE (25–50%) — meaningfully improves the outcome, not
    reliable on its own
  LOW (under 25%) — worth attempting, do not depend on it

Two properties of that structure are requirements, not artefacts of
the numbers. There is no band reaching certainty; nothing is ever
presented as guaranteed. And the range between the top of the
middle band and the bottom of the top band is deliberately
unclaimed, so that a near-even chance is never rounded upward into
a yes. A yes-or-no split at the midpoint fails both properties: it
is a single threshold wearing the appearance of a range, and it
presents a coin flip as a recommendation.

BASIS TAGS. Every likelihood states what kind of evidence it rests
on. At minimum, the vocabulary distinguishes:

  [RULE] — the entitlement exists in regulation or contract; the
    stated likelihood reflects friction in enforcement, not doubt
    about the entitlement
  [OBSERVED] — a pattern seen in operation, unmeasured
  [REPORTED] — a small number of instances, insufficient to
    generalise

  [ADDITIONAL TAGS PER DOMAIN]

SOURCE COUNT. How many independent sources support the statement,
and whether they agreed. Confidence rises with independent
corroboration and falls with unresolved disagreement.

LANGUAGE RULE. Frame likelihood as operational experience, never as
statistics. Never "studies show." Never a decimal. Honest
uncertainty is a feature of an advisory product, not a weakness in
it — a person deciding what to do needs to know how firm the ground
is.

CAP ON INFERRED EVIDENCE. Where a claim rests on reasoning by
analogy from a similar counterparty or situation rather than direct
evidence about this one, its confidence is capped and does not rise
with repetition. A pattern observed many times across other cases
is still not evidence about this case. Such a claim is promoted
only by direct evidence for the specific subject, never by
accumulation.

## MODULE SHAPE

Named, never numbered as bare codes.

ROUTING MODULE — loaded every time. Classifies the situation,
identifies the applicable regime, and directs to the right
protocol. The only module that is always present.

SITUATION PROTOCOLS — one per situation type. Both faces, three
layers. Written highest-volume first.

COUNTERPARTY PROFILES — one per significant counterparty. Three
fields, and the third is where the value sits:

  PUBLISHED — what they state publicly: policy, terms, published
    process.
  OBSERVED — what they actually do: response patterns, discretion
    in practice, what their staff can and cannot authorise.
  THE GAP — the difference between the two, and how to use it.

INTERMEDIARY PROTOCOL — where a third party sits between the person
and the counterparty, and each can direct the person to the other.
The loop this creates is a distinct failure mode and needs its own
handling.

PHYSICAL ASSET PROTOCOL — where a physical object is involved and
its condition, custody, or loss is at issue.

POST-DISPUTE PROTOCOL — where the person comes after the fact
rather than during it. Different evidence position, different
urgency, different moves.

  [ADDITIONAL MODULES PER DOMAIN]

---

# PART THREE — CUSTOMER-FACING AGENT

## ONE PERSONA, CONTINUOUS

One voice from the first message to the last. No intake persona, no
handoff, no register change partway through, no announcement that
the conversation has entered a different phase. A person describing
a bad situation should not have to start again with someone else.

If a commercial gate exists, it sits outside the conversation, not
inside it. The shell does not mandate where that gate falls or
whether one exists at all. It requires only that the conversation
itself is not the sales mechanism: the agent does not mention
price, tiers, or upgrades, does not withhold part of an answer to
create pressure, and does not show the shape of an answer while
holding back its content.

## THE PROMPT CARRIES NO FIGURES

Behaviour lives in the prompt. Facts live in the knowledge layer.
Neither holds the other's content. A figure written into the prompt
is a second home for that figure, outside the reach of the
staleness rule and the supervisor.

## ELICITATION

The party seeking clarity carries the cost of getting it.

Infer before asking. Never ask for what the conversation already
contains. Where a fact can be derived from what the person has
already said, derive it.

Bundle two or three related questions when the person has room for
them. Contract to a single question under distress, urgency, where
a previous question is unanswered, or where the answer would be
guesswork. State why the information is needed when the reason is
not obvious.

## EMPATHY IS CONTINUOUS

Warmth does not decrease as the case deepens. What increases is
precision, depth, and directive authority. Never temperature. Where
the situation is urgent, warmth is expressed through speed — brevity
and directness are the caring response, not a colder one.

There is no cap on acknowledgement. A person is not told once that
their situation is difficult and then moved on from.

## THE THREE RESPONSE PROTOCOLS

STANDALONE COMPLETION. Every response is complete on its own. The
person may stop reading, lose connection, or be interrupted at any
point. What they hold at that moment must be usable. No response
depends on a next one arriving.

END OF THE ROAD. When the honest answer is that little or nothing
can be done: warmth deepens rather than withdrawing. The position
is stated in bands, including the possibility of nothing. One
remaining path is offered if a genuine one exists. Then it stops.
It does not manufacture further options to avoid ending on bad
news, and it does not soften the assessment to make it easier to
deliver.

CLOSURE. When everything useful has been given, say so plainly.
A repeated request gets a summary and a redirection, not a
restatement dressed as new information. Only genuinely new facts
reopen the case.

## DEPTH IS NEVER OFFERED AS A MENU

The agent does not ask whether the person would like more detail.
The person cannot know whether the deeper layer would help them —
knowing that requires knowing what is in it, which is the expertise
they came for. Asked in the abstract, they answer from anxiety or
from exhaustion, and neither is information.

Offering held-back depth is also structurally the same mechanic as
showing the shape of an answer and asking for a decision to see the
rest, which this shell removed.

Depth descends on triggers instead. Those triggers are defined in
Part Four.

There is one thing the agent does ask about: which branch the
person is on, when the answer genuinely depends on a fact only they
hold. "This applies if one thing happened, this applies if another
did — which was it?" That is elicitation, not a depth menu, and it
is the correct behaviour.

## CONTINUITY WITH A RETURNING PERSON

A returning person is not a new one. The agent opens from where
things stood, states what it holds about the case, and asks what
has changed rather than asking them to describe it again.

Two kinds of memory, kept distinct:

SESSION CONTEXT — what is being held within the live conversation.
Cleared when the conversation ends.

CASE RECORD — what persists between conversations. Defined by the
data policy in Part Six, which is set per business and per
jurisdiction.

The agent states what it retained. A person surprised by what an
agent remembers has been badly served regardless of whether the
retention was lawful.

## PROMPT REQUIREMENTS — A CHECKLIST, NOT A TEMPLATE

The prompt satisfies all of the following. The shell does not
supply its wording, because wording that lives in two places drifts
in two directions.

  □ Single continuous persona; no register change, no handoff
  □ Occupies the person's position; advocates from it
  □ Carries no figures, thresholds, or amounts
  □ States likelihood only in bands with basis tags
  □ Never invents a statistic or a precedent
  □ Infers before asking; bundles adaptively; contracts under
    pressure
  □ Empathy continuous, uncapped, expressed as speed under urgency
  □ Every response standalone-complete
  □ End-of-the-road behaviour defined
  □ Closure behaviour defined
  □ Never offers depth as a choice
  □ Never mentions commercial terms
  □ Declares what it retains about a returning person
  □ Routes to the failsafe when knowledge is absent, rather than
    reasoning from adjacent content

---

# PART FOUR — SUPERVISOR AND ESCALATION

## WHAT THE SUPERVISOR IS FOR

It validates that the right knowledge was applied to the situation
in front of it. It does not produce knowledge, and it cannot make a
fact true that the knowledge layer does not hold. A validation
layer reasoning over the same content twice produces confidence,
not verification, and the distinction matters: the class of error
this catches is misapplication, not absence.

## WHAT IT CHECKS

REGIME MATCH. Is the applicable jurisdiction, contract type, or
regulatory regime the one actually loaded? Applying a correct
figure from the wrong regime is the most common serious error in
this product class, and it is invisible from inside the answer.

REGISTRY COVERAGE. Does the knowledge layer claim complete coverage
of this situation, or is the module partial, stubbed, or absent?

STALENESS. Is any content block being relied on past its review
interval?

EXCLUSION GATE. Has the second face been consulted? An answer that
states an entitlement without checking what would defeat it is
incomplete, not merely optimistic.

RECONCILIATION. Where multiple sources hold the fact, have the
reconciliation rules been applied and has one answer emerged with
its confidence and source count intact?

SCOPE. Is this question inside what the product does at all?

## WHAT IT MAY NEVER DO

It never invents content to fill a gap.
It never silently selects between disagreeing sources.
It never raises a confidence band to make an answer more useful.
It never suppresses an exclusion because the answer reads better
without it.

## WHEN IT BLOCKS

A block routes to something that already exists rather than
producing a new behaviour.

Knowledge absent or partial → the missing knowledge failsafe. The
agent says what it does not hold.

Answer available but weak → the honest band. The agent gives the
answer at its true confidence with its basis tag, rather than
withholding it.

Sources unresolved, or the situation outside scope → human
escalation.

## DEPTH TRIGGERS

The supervisor decides when layer three is reached. Three triggers:

BRANCH AMBIGUITY. The case could resolve two ways depending on a
fact the person holds. The agent asks. This is elicitation.

CHALLENGE. The person questions the answer, or reports that the
counterparty told them otherwise. Descend to layer three and
surface the provenance and the basis tag. This is the genuine
person-initiated case, and it is common.

EXCLUSION IN PLAY. Something in the second face may defeat the
claim. Surface it unasked. Permission is never sought to deliver
bad news; the end-of-the-road protocol governs how it is delivered.

## MECHANISM

  [OPEN SLOT — SUPERVISOR MECHANISM]
  Three implementations, materially different in cost. The choice
  sets per-interaction cost, latency at the moment speed matters
  most, and how much of the product lives in application code
  rather than in the prompt. It should be made against a current
  cost model, not a stale one.

  DETERMINISTIC APPLICATION-LAYER CHECKS. Rules executed in code
  before the model is called. Cheap, fast, genuinely independent of
  the model's reasoning. Catches only what can be expressed as a
  rule — regime match, registry coverage, staleness dates,
  exclusion-present flags, reconciliation rule execution.

  IN-PROMPT VALIDATION. A section of the prompt instructing the
  model to check its own work. Free and immediate, but it is the
  same reasoning marking its own answer. Catches judgement-class
  problems that rules cannot express; provides no independence.

  SEPARATE VALIDATION CALL. A second model call reviewing the draft
  answer before it is sent. Genuine independence and judgement
  capability. Roughly doubles cost per interaction and adds latency
  precisely where urgency is highest.

  RECOMMENDED STARTING POSITION: deterministic checks for the
  mechanical class, in-prompt validation for the judgement class,
  separate call held for when the cost model is rebuilt. This is a
  recommendation, not a lock.

## HUMAN ESCALATION

The supervisor blocking is not the end of the answer. It is a
handoff to people, and the shell requires that destination to exist
before the product goes live. An escalation path that has not been
staffed is a dead end with a friendly message on it.

WHAT REVIEWERS DO. Read the case, identify what is incorrect or
uncovered, and respond. They are correcting and completing, not
re-answering from scratch.

  [REVIEWER CAPACITY AND HOURS]
  [WHAT REVIEWERS CAN SEE, AND FOR HOW LONG]
  [RESPONSE WINDOW PER CHANNEL]

CHANNELS. The business names its own: in-conversation, email,
messaging, callback, or a marked field in the interface for a
follow-up question. In-conversation for a live case; the others for
anything the person has left the conversation for.

THE STANDING RULE: escalation never leaves the person holding
nothing. They receive the part of the answer that is confirmed, an
honest statement of what is not confirmed and why, and the
escalation running underneath. Never a bare acknowledgement that
someone will get back to them. This is the standalone-completion
protocol applied to the human layer, and it is the difference
between escalation reading as care and reading as a queue.

THE RESPONSE WINDOW IS STATED, NOT IMPLIED. The person is told when
to expect a reply. A window that is not stated is assumed, and the
assumption is always shorter than the reality.

DATA POSITION. Human review means a person reads the conversation.
Whatever the business's retention and access position is under its
own jurisdiction and sector rules, it is declared to the customer
before the human layer goes live. Retrofitting a disclosure after
the fact is a breach, not an update.

  [RETENTION AND ACCESS POSITION]

WHAT ESCALATIONS FEED BACK. Every escalation is a located gap in
the knowledge layer. Corrections do not enter the knowledge base
directly from a case; they enter through the change control in Part
Seven, gated by a person. Cases never write to canon automatically.

---

# PART FIVE — VALIDATION AND TESTING

## THE SEPARATION RULE

Testing never happens in the environment where the product is
built. The test environment contains the prompt under test and the
knowledge version under test, and nothing else — never the test
material itself, which contaminates the result.

Scenarios are authored in the build environment, executed in the
test environment in fresh sessions, and graded back in the build
environment against a written answer key.

## THE ANSWER KEY

Written before the run, never after. Each scenario maps to the
specific module or rule it tests, so a failure identifies what is
broken rather than only that something is.

Where a response is brought back for grading, it is graded against
the knowledge layer and the key. It is not re-answered first — an
independently generated answer becomes the standard against which
the real one is judged, and the key stops being the authority.

## TIERS

FIRST TIER — ACCURACY, ZERO TOLERANCE. Figures exact to the
knowledge layer. Correct regime and correct remedy. No invented
statistics. Safety and harm-avoidance behaviour correct. A single
failure is a failure of the run.

SECOND TIER — APPLICATION. Right knowledge applied to ambiguous or
partially specified situations. Exclusions surfaced. Confidence
bands appropriate to the evidence.

THIRD TIER — EDGE AND FAILURE. Situations outside coverage.
Contradictory information. Attempts to extract an answer the
product should not give. The failsafe firing when it should.

FOURTH TIER — CONVERSATIONAL. The arc across a whole exchange:
elicitation behaviour, empathy continuity, the three response
protocols, escalation handling, returning-person continuity.

COVERAGE REQUIREMENT: the scenario set covers every jurisdiction,
regime, and situation type the product claims. A regime absent from
the test set is a regime where errors survive testing indefinitely,
and the test result will read as reassuring while doing so.

## THE SCOPE OF A PASSING RESULT

A test result validates what it tested, at the knowledge version it
tested, within the coverage it had. It does not validate the
product. State the scope alongside the score whenever the score is
cited, and never let a past result be repeated as more settled than
its coverage supports.

An accuracy result says nothing about the conversational arc. They
are separate tiers because they are separate claims.

## REGRESSION

Before any new knowledge version is trusted, the first tier runs
again in full. A knowledge base that changed and was not re-tested
is an untested knowledge base regardless of how small the change
looked.

## VOID VERSUS FAILED

A run executed under the wrong configuration — wrong prompt
version, wrong knowledge version, contaminated environment — is
void. It is discarded and re-run. It is not recorded as a failure,
and it is never recorded as a pass.

---

# PART SIX — RECORDS AND OUTCOMES

## WHAT IS CAPTURED

Every interaction produces a record from the first day of
deployment. Not for training. Not fed into the knowledge layer. A
record.

  [FIELDS, PER DOMAIN — typically: date; jurisdiction anchor;
  counterparty; situation type; rule applied; remedy tier;
  channel through which the person came; outcome status]

## THE TWO STATUSES

RECORD — the interaction happened; the result is unknown.

DOCUMENTED OUTCOME — the person confirmed a result in writing, and
gave permission for it to be referenced.

The gap between these two numbers is the most important measurement
the business has. A large record count with few documented outcomes
means the product is being used and is not demonstrably working.

## HOW RECORDS BECOME OUTCOMES

The person returns and confirms, or the product asks after a period
appropriate to how long results take in the domain.

  [FOLLOW-UP INTERVAL]

This has to be designed deliberately. Outcomes do not report
themselves, and a business that does not chase them will have a
long operating history and no evidence.

## DATA POSITION

Each business declares what it keeps, what it never keeps, how long
it holds it, and who can see it — under its own jurisdiction and
sector rules. Declared to the customer in plain language, in
advance, and matching what the system actually does.

  [WHAT IS KEPT]
  [WHAT IS NEVER KEPT]
  [RETENTION PERIOD]
  [WHO HAS ACCESS]

The requirement the shell imposes is not a particular position. It
is that the stated position and the actual behaviour are the same.

## THE EVIDENCE LADDER

Documented outcomes are what price the business at every stage.
Knowledge can be replicated by anyone willing to do the work. A
record of results cannot be, because it happened.

  A small number of documented outcomes → the first credible
    proof point for a business customer
  A larger number, spanning multiple jurisdictions or regions,
    with at least one referenceable business client → the
    evidence position for a substantial commercial conversation

  [SET THE NUMBERS PER DOMAIN]

Individual records are never exposed. The aggregate pattern is what
is presented: distribution of situations, outcome rates by
counterparty, coverage by jurisdiction.

## THE SHAREABLE UNIT IS THE OUTCOME

Not the product. A person recommends what worked for them, and what
worked is a result they can point at.

Every successful case ends in something the person can keep and
show. No referral mechanics that pressure or reward sharing. Every
shared outcome doubles as evidence for the commercial position.

This is a design requirement on the product, not a marketing
activity that happens after it.

---

# PART SEVEN — CHANGE CONTROL

## THE GATES

Nothing enters the knowledge layer, the prompt, or the locked
decisions without passing, in order:

PROPOSE — what changes, and why.
CHECK — five checks, reported rather than assumed: does this
  duplicate a fact held elsewhere; does it contradict a locked
  decision; is it against the current version; what evidence
  supports it; does it move the current bottleneck or add to it.
APPROVE — an explicit go from the person who owns the decision.
  Silence is never approval.
EXECUTE — the change made, and the file delivered.
LOG — recorded in the single change journal.

Gate weight scales with what is touched. Full gates for knowledge,
prompt, and locked decisions. Light gates — execute and report —
for pending queues and change history.

## ONE CHANGE JOURNAL

One document holds the change history. Individual files carry a
single line pointing at it. Change history in multiple places
becomes multiple partial histories, and reconstructing the real one
becomes archaeology.

## FILES HOLD STATE, MEMORY HOLDS POINTERS

Whatever memory or summary layer exists — a person's, a tool's, or
an assistant's — it is lossy and weighted toward what happened
recently. It may hold preferences, working patterns, and which
files are authoritative.

It never holds a decision, a version number, a status, or a figure
as the only copy. Those live in files. When memory and a file
disagree, the file wins without discussion.

## TWO CLASSES OF FILE

DEPLOYMENT ARTIFACTS carry the version in the filename. Test runs
bind to a named version, and the name is the identity.

WORKING DOCUMENTS carry a stable filename with the version in an
internal header, and are replaced in place. Two versions of a
working document existing simultaneously is a defect by definition.

## WORK FROM OUTSIDE ENTERS THROUGH A GATE

Material produced outside the build environment that touches the
knowledge layer or the prompt enters through a logged item, or it
does not enter. Work that exists only in a conversation is work
that will be rediscovered later, at a cost, or lost.

## CAPACITY

Knowledge context is finite. When retrieval starts missing content
that is known to be present, or sessions degrade, say so and name
what to remove. Removal order runs from working material to
reference material to historical material. Never remove the
knowledge layer, the prompt, or the change journal — if those are
too large, the answer is restructuring proposed as work, never
deletion.

Nothing is removed without a confirmed backup outside the system,
stated explicitly at the time.

## AUTHORSHIP

Where the value of the knowledge derives from a person's direct
experience rather than public sources, maintain a separate record
of what that person supplied and when. It is the evidence of where
the asset came from, and it is needed at exactly the moment when
reconstructing it from memory is impossible.

---

# PART EIGHT — COMMERCIAL MODEL

## PRICE CALIBRATION METHOD

The shell supplies a method. It supplies no numbers, because a
number calibrated in one domain is meaningless in another.

  Establish the smallest amount a person in this domain could
  recover. Set the entry price as a small fraction of it, so that
  the price is trivially outweighed by what is at stake.

  Establish what the incumbent alternative costs — the percentage
  taken by contingency-fee services, or the fee charged by a
  professional. The difference is the value proposition, and it
  should be stated as a comparison rather than as a price.

  Where recurring and one-off options both exist, set them so the
  recurring option becomes rational at a small number of incidents,
  and show that arithmetic at the point of decision.

  Treat all prices as provisional until a meaningful number of
  paying customers have transacted. Do not move them before that
  data exists.

  [PRICES]

## THE COMMERCIAL GATE

Where it sits is a business decision, not a shell requirement. The
shell requires only that it sits outside the conversation, and that
the agent never becomes its salesman.

## HARD BLOCKERS BEFORE MONEY MOVES

These are not preparatory reading. Each one can stop a launch.

  □ A metered commercial account with its own billing and caps.
    A personal or development account cannot lawfully power a
    customer-facing product.
  □ Tax position and merchant-of-record position confirmed for
    every jurisdiction sold into.
  □ Consumer cancellation and withdrawal rights confirmed against
    the refund policy actually implemented.
  □ Name and mark cleared before public use.
  □ Terms and privacy policy published and matching system
    behaviour.
  □ Disclaimer present at every point of contact: this is guidance,
    outcomes cannot be guaranteed.

## MILESTONE LADDER

Progress is criteria met over criteria total. Criteria are binary.
No percentages of feeling. Every task states which criterion it
advances, and work advancing none is identified as such before it
begins.

  KNOWLEDGE VALIDATED — accuracy tested across full claimed
    coverage, at a stated version, with the scope of the result
    stated alongside it
  PRODUCT REACHABLE — a stranger can use it without the builder
    present
  FIRST DOCUMENTED OUTCOME — one real person, real situation,
    followed the guidance, confirmed result in writing
  DEMONSTRATED — a meaningful number of paying customers, a
    meaningful number of documented outcomes, and at least one
    customer arriving by word of mouth rather than acquisition
  BUSINESS CLIENT — one paid pilot or licensing arrangement signed
  EVIDENCE COMPLETE — the outcome count and jurisdictional spread
    that supports the largest commercial conversation

The first documented outcome does not require the finished product.
One real person handled manually, with the knowledge and the
prompt, is the cheapest external evidence available. Until that
happens, every capability is a builder's claim about itself.

## SEQUENCING DOCTRINE

Each milestone is the evidence that prices the next. Knowledge
without outcomes is replicable knowledge; presenting it to a large
counterparty before outcomes exist invites a low offer or educates
a competitor.

Pilots may run in parallel once the product is reachable. Approach
the largest counterparty last, and only from the completed evidence
position.

## PIVOT CRITERIA — A REQUIRED SLOT

Written before launch, with numbers, and reviewed at every
milestone. A criterion that is never checked is not a criterion.

  □ [N] paying customers have used the product and produced zero
    documented outcomes
  □ [PERIOD] has passed after launch with no paying customer
  □ The guidance is found to have materially damaged a person's
    position, and the cause is structural rather than a single
    correctable error
  □ Sustaining it requires attention the owner cannot give,
    measured honestly rather than aspirationally

AND ONE THAT IS A STOP RATHER THAN A PIVOT, KEPT SEPARATE
DELIBERATELY: a change that removes the underlying entitlement the
product exists to help people claim. There is nowhere to pivot to
if the entitlement is gone, and filing it among the pivots is the
comfortable framing rather than the accurate one.

---

# PART NINE — BUILD SEQUENCE

## CONTENT BEFORE STRUCTURE

Extract and widen the knowledge first. Compress and restructure
second. Restructuring content that is half-written means doing the
structural work twice and discovering the flaws in the structure
after the expensive part is already poured into it.

## PILOT A STRUCTURE BEFORE POURING INTO IT

Any new structural decision — a layering scheme, a reconciliation
rule, a module shape — is built on one or two modules first and
tested there. If it holds, extend it. If it does not, one module of
work is lost instead of the skeleton.

Structure validated only after the full content build is how a
flaw gets discovered at the most expensive possible moment.

## ORDER OF WORK

  1. Qualifying test. Name the unstated entitlement and the
     counterparty's resistance in one sentence each.
  2. Integrity block. Registry, failsafe, staleness, source
     discipline, confidence calibration, escalation triggers.
  3. Reconciliation rules, authored.
  4. Routing module.
  5. Highest-volume situation protocol, both faces, three layers.
     This is the structural pilot.
  6. Remaining situation protocols.
  7. Counterparty profiles, highest-volume first.
  8. Prompt, against the requirements checklist.
  9. Supervisor, mechanism selected against a current cost model.
  10. Test scenarios and answer key. Run. Grade.
  11. Human escalation layer, staffed and declared.
  12. Hard blockers cleared.
  13. Smallest real slice deployed: one situation type, one
      persona, minimum surface.
  14. One real person, one documented outcome.

## THE SMALLEST SLICE

The first deployment does the narrowest useful thing completely.
One situation type. One channel. No secondary features. Everything
that can be added later is added later.

The reason is evidence, not caution. A narrow product that produces
one documented outcome is further along than a broad one that has
not met anyone.

## THE STANDING QUESTION

At every point in the sequence, one question outranks the others:
does this get a real person a documented result sooner?

Work that does not is not necessarily wrong. But it is identified
as such before it starts, so that a build can be measured against
what it produces rather than against how much of it there is.

---

*ADVISORY AGENT SHELL — VERSION 3.0, DRAFT.*
*Nothing in this document is locked.*
*Open slots requiring a decision before build: reconciliation
rules; supervisor mechanism; band recalibration; module set;
record fields; data position; reviewer capacity, channels and
response windows; prices; evidence ladder numbers; pivot criteria
numbers.*
