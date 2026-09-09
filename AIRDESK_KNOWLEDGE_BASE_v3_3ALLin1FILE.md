# AIRDESK — COMPLETE KNOWLEDGE BASE
# Modules 0, 1, 2A-2F, 3, 4, 5, 6 — Production
# Version 3.3 | September 2026 | Confidential
# Changelog home: The Airdesk Decision and Change Record
# (v1.1 architecture + v2.0 airline profiles VERBATIM from recovered original file)

---

# MODULE 0 — SYSTEM INTEGRITY PROTOCOL
# Loads before everything. The system must know its own state.

─────────────────────────────────────────────────────
MODULE REGISTRY — CURRENT STATE

COMPLETE: 0, 1, 2A, 2B, 2C, 2D, 2E, 2F, 4, 5, 12-Foundation
STUB (exists, minimal): 6 (Documents)
PARTIAL: 3 (Airline Profiles — BA, US carriers, Ryanair, easyJet,
  Emirates, Lufthansa Group complete.
  PENDING: Air India, IndiGo, Air France/KLM, Qatar, Singapore)

─────────────────────────────────────────────────────
MISSING-MODULE FAILSAFE

If a referenced module does not exist or is marked PENDING for the
airline/scenario in question, the agent MUST:
1. Say so explicitly: "I don't have a verified behaviour profile for
   [airline] yet. I'll give you the regulation-based moves, which apply
   regardless of which airline you're facing."
2. Fall back to the regulation layer (Modules 1 + 2X), which is
   airline-independent.
3. NEVER improvise airline-specific behaviour claims. An invented
   profile is worse than no profile.

─────────────────────────────────────────────────────
SINGLE SOURCE OF TRUTH RULE

Any figure that appears in more than one module has exactly ONE
governing block, marked [SOURCE OF TRUTH]. All other appearances are
mirrors. On conflict: the source-of-truth block wins, and the conflict
must be reported as a data-maintenance issue, not silently resolved.

Current source-of-truth blocks:
- US DOT denied boarding amounts → Module 1, USA block
- Montreal Convention SDR limit → Module 1, MC99 block
- EU/UK compensation tiers → Module 1, respective blocks

─────────────────────────────────────────────────────
STALENESS RULE

Regulatory figures carry revision risk. Before quoting any figure in a
live dispute, the agent advises: "This figure is current as of the last
knowledge update. If the airline disputes it, ask them to cite the
regulation and date — outdated figures cut both ways."
DOT reviews DBC amounts on a recurring inflation cycle. MC99 SDR limits
are reviewed every 5 years (last: Dec 2024).

─────────────────────────────────────────────────────
PROBABILITY CALIBRATION STANDARD

All odds in this knowledge base are EXPERIENCE-BASED ESTIMATES from
7 years of operational work. They are not measured statistics.
Every odds statement must carry a band and a basis tag:

BANDS:
  HIGH (60-80%) — works most of the time when executed as written
  MODERATE (25-50%) — meaningfully improves outcome, not reliable alone
  LOW (under 25%) — worth attempting, do not depend on it

BASIS TAGS:
  [REG] — regulatory certainty: the entitlement exists in law;
          odds reflect enforcement friction only
  [OPS] — operational experience: observed pattern, unmeasured
  [ANEC] — anecdotal: seen it work, small sample

AGENT LANGUAGE RULE: Frame as "in operational experience" or
"this typically..." — NEVER "statistically" or "studies show."
Honest uncertainty is a feature of this product, not a weakness.

---

---

# MODULE 1 — ROUTING ENGINE
# Activates first on every conversation. Always.

STEP 1 — EXTRACT FIVE DATA POINTS

1. Departure country or airport
   Law applies to departure point. Not airline nationality. Not destination.
   If airport code given: map to country.
   If unclear: ask — "Which country did your flight depart from?"

2. Disruption type
   Cancellation / Delay / Denied Boarding / Missed Connection /
   Baggage / Schedule Change

3. Delay length or notice period
   Delays: hours of ARRIVAL delay at final destination. Not departure.
   Cancellations: days of advance notice given to passenger.

4. Airline name
   For Module 3 (airline behaviour). Also large vs small carrier (Canada).

5. Booking channel
   Direct with airline / OTA / Travel agent
   If OTA or agent: activate Module 4 alongside applicable law.

─────────────────────────────────────────────────────
STEP 2 — MAP TO APPLICABLE LAW

UK DEPARTURE → UK261
Compensation: £220 / £350 / £520
Under 1,500km → £220 | 1,500-3,500km → £350 | Over 3,500km → £520
Triggers: Delay 3hrs+ arrival | Cancellation <14 days | Denied boarding | Missed connection 3hrs+ arrival
Duty of care: Food after 2hrs. Hotel for overnight. 2 phone calls.
Applies even in extraordinary circumstances.
Enforced by: CAA | ADR: Aviation ADR / CEDR
Claim deadline: 6 years (England/Wales), 5 years (Scotland)

EU DEPARTURE → EC 261/2004
Compensation: €250 / €400 / €600
Under 1,500km → €250 | 1,500-3,500km or intra-EU over 1,500km → €400 | Over 3,500km → €600
Triggers: Delay 3hrs+ arrival | Cancellation <14 days | Denied boarding |
Missed connection 3hrs+ arrival | Schedule change <14 days
Also applies: Flights arriving EU on EU-registered carriers.
Duty of care: Same as UK261. Owed even in extraordinary circumstances,
with no monetary or time cap (McDonagh C-12/11).
Airline staff strikes compensable — including LAWFUL, announced,
union-called strikes over pay (Airhelp v SAS C-28/20, Grand Chamber).
Managing labour relations is inherent to running an airline.
The 3-hour arrival trigger is case law (Sturgeon C-402/07, Nelson
C-581/10), not the text of Article 7. Still good law.
⚠ REFORM STATUS as of Sept 2026: the 2004 text IS STILL THE LAW. A
provisional trilogue deal was reached 15 June 2026; entry into force
expected 2027. The deal KEEPS the 3-hour trigger and €250/400/600 —
earlier reports of a move to 4/6 hours were the Council's 2025 position
and did not survive. Apply nothing from the reform until it is in the
Official Journal. Re-check this block on any OJ publication.
NEBs: France → DGAC | Germany → LBA | Spain → AESA |
Italy → ENAC | Netherlands → ILT | Ireland → CAR

USA DEPARTURE → DOT
Denied boarding compensation only — no federal delay compensation law.
Domestic: 200% capped $1,075 (1-2hr) / 400% capped $2,150 (2hr+)
[Caps effective for travel on/after 22 Jan 2025 (89 FR 84815). They are
CPI-indexed every two years — next adjustment due late 2026/early 2027.
Re-verify against 14 CFR 250.5 before quoting after that date.]
International: 200% capped $1,075 (1-4hr) / 400% capped $2,150 (4hr+)
[SOURCE OF TRUTH: 14 CFR 250.5, DOT final rule Oct 2024. Module 2C mirrors
these figures — if they ever differ, THIS block governs and 2C is stale.]
LEVER — TICKETS Act 2018: These amounts are MINIMUMS, not maximums.
Carriers may pay more. "DOT confirms these are floor amounts — you are
free to offer above them" is a valid negotiation line for volunteers.
Significant change: 3hrs+ domestic / 6hrs+ international = automatic cash
refund right. Also covers changed airport, added connections, downgrade,
or a less accessible aircraft. Refund to original payment method within
7 business days (card) / 20 calendar days (other). In force 28 Oct 2024.
⚠ No US delay compensation exists and none is coming: DOT formally
WITHDREW the proposed controllable-delay compensation rule in Nov 2025.
Anyone citing "upcoming US compensation rules" is out of date.
Domestic mishandled-baggage liability minimum: $4,700 (from 22 Jan 2025).
Tarmac: 2hrs = food/water/toilet. 3hrs domestic / 4hrs international = disembark right.
File: transportation.gov/airconsumer

CANADA DEPARTURE → APPR
LARGE vs SMALL is defined by volume, NOT by a named list: a large carrier
carried 2 million+ passengers in EACH of the two preceding calendar years
(APPR s.1(2)). Verify current status before quoting — carriers cross the
line as they grow or shrink.
  Large (2026): Air Canada, WestJet, Porter. Porter crossed into LARGE.
  Small (2026): Flair, Air Transat, Lynx. Flair is SMALL, not large.
Large carriers — Delays: CAD $400 (3-6hr) / $700 (6-9hr) / $1,000 (9hr+)
  Denied boarding: CAD $900 (under 6hr) / $1,800 (6-9hr) / $2,400 (9hr+)
Small carriers: CAD $125 / $250 / $500 on the same time bands
Baggage: up to CAD $2,800
Children under 14: must sit near parent/guardian at no charge.
File: otc-cta.gc.ca

TURKEY DEPARTURE → SHY PASSENGER
Up to €600 (same tiers as EU261). Payable in euros or Turkish lira.
Denied boardings and cancellations must be confirmed in writing.
Airlines must bring passengers to original destination.

CHINA DEPARTURE → FLIGHT REGULARITY
4hrs+ → up to ¥200 | 8hrs+ → up to ¥400 (airline-specific, not all comply)
International: airline helps find accommodation but only pays if they caused disruption.
CRITICAL: compensation amounts set by individual airlines. Some pay nothing.

INDIA DEPARTURE → DGCA
★ GOVERNING BLOCK FOR INDIA — every India figure in this knowledge base
  lives here. Everywhere else points at this block and restates nothing.
[SOURCE OF TRUTH: CAR Section 3, Series M, Part IV, Rev. 4 — signed
25 Jan 2023, effective 15 Feb 2023 — for denied boarding, cancellation
and delay. CAR Section 3, Series M, Part II, Rev. 3 — dated 24 Feb 2026,
effective 26 Mar 2026 — for refunds.]

DENIED BOARDING (involuntary) — Para 3.2.2
  Airline must ask for volunteers first (Para 3.2.1).
  Alternate departs within 1 hour of original → NO COMPENSATION.
  Alternate departs 1–24 hours later → 200% of booked one-way basic fare
    plus airline fuel charge, capped ₹10,000.
  Alternate 24 hours+, or passenger declines the alternate → 400% of the
    same base, capped ₹20,000, plus full refund where no alternate taken.
  ⚠ These are PERCENTAGES OF FARE with a ceiling, not flat amounts. On a
    cheap domestic ticket the real entitlement is far below the cap.
    Never quote the cap as the entitlement.
  Payment: cash, bank transfer, or vouchers only by signed agreement
    (Para 3.7.1). No fixed payment deadline in the CAR.

CANCELLATION — Paras 3.3.1 and 3.3.2 (TWO SEPARATE THINGS)
  Information duty (3.3.1): airline must inform at least two weeks ahead
    and arrange alternate or refund. Informed under two weeks and up to
    24 hours before departure → must still offer an acceptable alternate
    or refund.
  Compensation trigger (3.3.2): payable where the airline did NOT meet
    3.3.1, banded by block time, whichever is LESS against booked one-way
    basic fare plus fuel charge:
      Block time up to 1 hour → ₹5,000
      Block time 1–2 hours    → ₹7,500
      Block time over 2 hours → ₹10,000
    Paid in addition to the ticket refund.
  No compensation where the passenger gave no contact details (3.3.3) or
    where extraordinary circumstances apply (3.3.4) — refund still owed.

DELAY — Para 3.4. NO CASH COMPENSATION FOR DELAY IN INDIA.
  Meals/refreshments, by block time (Para 3.4.1):
    Block time up to 2.5 hours → owed at 2 hours' delay
    Block time 2.5–5 hours     → owed at 3 hours' delay
    Block time above 5 hours   → owed at 4 hours' delay
  Domestic delay over 6 hours (Para 3.4.2) → alternate flight within
    6 hours, or full refund. Passenger's choice.
  Hotel (Para 3.4.3): delay over 24 hours, or over 6 hours where the
    flight was scheduled to depart between 2000 and 0300.
  Force majeure (Para 3.4.4) removes the duty-of-care facilities.
  No statutory tarmac-delay clock in India.

REFUNDS — Part II, Rev. 3, effective 26 March 2026
  Credit card → 7 days. Cash → immediate at the office of purchase.
  Travel agent / portal / OTA → onus on the AIRLINE, completed within
    14 WORKING DAYS. ★ The OTA lever — most passengers are told to chase
    the agent; the regulation puts it on the carrier.
  48-hour look-in: free cancel or amend within 48 hours of booking
    (fare difference still payable). NOT available if departure is under
    7 days away (domestic) or 15 days (international), direct bookings.
  Statutory taxes and UDF/ADF/PSF refundable on cancellation, non-use or
    no-show — INCLUDING on promotional and non-refundable fares.
  Cancellation charge may never exceed basic fare plus fuel surcharge.
  Credit shell is the passenger's choice, never the airline's default.
  Name correction free if flagged within 24 hours (direct bookings).
  Foreign carriers refund per their country-of-origin regulations.

DOWNGRADE — Para 3.5.1: domestic 75% of ticket including taxes;
  international 30% (≤1,500km) / 50% (1,500–3,500km) / 75% (>3,500km).
  ⚠ A December 2022 government announcement promised full refund plus
    free onward carriage. It never landed. Rev. 4 kept the percentages.
    If an airline or a passenger cites the announcement, it is not law.

FOREIGN CARRIERS (Para 3.6.1): may compensate per their home-country
  regulations OR per this CAR. Both are permitted — ask which they applied.

BAGGAGE: NOT governed by a Series M CAR. Domestic sits under the Carriage
  by Air Act 1972 (cap generally ₹20,000 per passenger, per-kg rates in
  the carrier's conditions). International → Montreal Convention.
  ⚠ The ₹3,000/kg and ₹1,000/kg figures circulating online come from the
    2018 draft Passenger Charter, which was diluted before notification.
    They are not binding. Do not quote them.

Regulator: DGCA makes the rules. AirSewa (airsewa.gov.in) is the Ministry
  of Civil Aviation grievance portal named at Para 3.9.2 — file there.
⚠ DGCA's own portal currently serves a stale DRAFT of the refund CAR with
  an unfilled "EFFECTIVE: XXXXXXX" placeholder and superseded figures
  (21 working days, 5-day exclusion). If an airline cites those, it is
  quoting a draft. The notified figures are 14 working days and 7 days.

BRAZIL DEPARTURE → ANAC 400
Delay 2hrs+ (shorter threshold than EU) | Cancellation <72hrs | Schedule change <72hrs
Food after 2hrs. Updates every 30 minutes. Accommodation overnight.
Alternative flight or refund for delays over 4hrs.

MEXICO DEPARTURE → LEY DE AVIACIÓN CIVIL
At least 25% of ticket price. Delay 4hrs+. Food after 1 hour.
Phone calls and emails for all delays.

SAUDI ARABIA DEPARTURE → PRPR
Delays 3hrs+: up to 700 SAR | Cancellations <14 days: 150% of ticket
Denied boarding: 200% of ticket | Luggage: up to 6,200 SAR
Schedule changes 3hrs+: 700 SAR | Additional stopovers: 470 SAR
Drinks after 1hr. Meals after 3hrs. Refund for delays 2hrs+ if not travelling.

OMAN DEPARTURE → OCAA (August 2024 — new regulation)
Delays 6hrs+: 260 OMR | Cancellations international <14 days: 260 OMR
Denied boarding: 50% ticket (2-6hrs) / 260 OMR (6hrs+)
Luggage: 750 OMR | Unscheduled stopovers: 55 OMR
Additional compensation for passengers with restricted mobility.

THAILAND DEPARTURE → CAB 101
International delays 10hrs+: 4,500 THB | Domestic delays 5hrs+: 1,200 THB
International cancellations <7 days: 4,500 THB | Domestic <3 days: 1,500 THB

AUSTRALIA DEPARTURE → ACL
No fixed compensation amounts. ACL overrides airline T&Cs.
Escalate: Airline Customer Advocate (aca.net.au) — free, independent.

ALL INTERNATIONAL FLIGHTS → MONTREAL CONVENTION (MC99)
Applies alongside domestic law.
Baggage liability: 1,519 SDR (updated December 28, 2024)
≈ USD $2,000 / CAD $2,858 / £1,600
If airline quotes 1,288 SDR: outdated. Correct them:
"The updated Montreal Convention limit since 28 December 2024 is 1,519 SDR."
PIR deadlines: 7 days damaged / 21 days delayed / 2 years legal action.

─────────────────────────────────────────────────────
STEP 3 — STRIKES: ELIGIBLE vs NOT ELIGIBLE

ELIGIBLE (airline responsible):
Pilot strikes | Cabin crew strikes | Flight engineer strikes | Airline staff strikes
ECJ Krüsemann (2018): wildcat strikes by own staff = not extraordinary circumstances.

NOT ELIGIBLE (extraordinary circumstances):
Airport/border security strikes | Baggage handler strikes (third party) |
ATC strikes | Non-airline staff strikes

─────────────────────────────────────────────────────
STEP 4 — COMPENSATION vs REFUND vs REIMBURSEMENT

COMPENSATION: Fixed amount for the disruption. Independent of ticket price.
Can be claimed even after accepting rerouting. These are separate entitlements.

REFUND: Original ticket cost returned. Before accepting, check current
market price of replacement route — often 3-5x higher.

REIMBURSEMENT: Expenses during disruption. Food, transport, hotel.
Duty of care — owed even in extraordinary circumstances. Keep all receipts.

Sometimes entitled to ALL THREE simultaneously. Airlines present as either/or. They are not.

─────────────────────────────────────────────────────
STEP 5 — MODULE ACTIVATION

Cancellation → Module 2A
Delay → Module 2B
Denied Boarding → Module 2C
Missed Connection → Module 2D
Schedule Change → Module 2E
Baggage → Module 5
ALWAYS: Module 3 (airline profile) + Module 6 (documents)
If OTA booking: Module 4

─────────────────────────────────────────────────────
EDGE CASES

CODESHARE: Law applies to departure country regardless.
Responsibility: operating carrier for duty of care at airport.
Compensation: marketing (ticketing) carrier first. If redirected: quote IATA 735d.

INTERLINE CONNECTIONS ON SINGLE TICKET: If first flight delay causes missed
connection — delivering carrier responsible. Not the onward carrier. See Module 2D.

EU DEPARTURE VIA NON-EU HUB — SINGLE BOOKING: the whole journey is in
scope, not just the EU segment. A connecting itinerary booked as ONE
reservation departing an EU airport is treated as a single journey
(Wegener C-537/17; Ceske aerolinie C-502/18) — compensation can be due
for a delay arising on a later, non-EU leg flown by a non-EU carrier.
Compensation is set by total distance to the FINAL destination.
SEPARATE TICKETS: each ticket stands alone. Only the EU-departure ticket
is covered. This is the real dividing line — one booking or two.

NON-EU CARRIER ON EU DEPARTURE: EU261 applies to all airlines on EU departures.
Emirates flying Dubai to London: NOT an EU departure. EU261 does not apply.

---

---

# MODULE 2A — CANCELLATION PROTOCOL

FOUNDATION: THREE SEPARATE ENTITLEMENTS
1. COMPENSATION — fixed amount, independent of ticket price.
   Can be claimed even after accepting rerouting. These are separate.
2. REFUND OR REROUTING — passenger chooses one.
   Before accepting refund: check current replacement flight price.
   Rerouting = airline bears the cost difference, not passenger.
3. DUTY OF CARE — meals, hotel, transport.
   Applies REGARDLESS of extraordinary circumstances.
   Airlines do not offer proactively. Passengers who ask get it.

REFUND AMOUNT — WHAT TO EXPECT
Involuntary cancellation: the airline must return the full
ticket value including all taxes and fees.
Voluntary refund (passenger-initiated): taxes may be deducted
before the refund is issued. The refundable amount depends
on fare rules.
Know which situation applies before accepting any refund figure.

If the amount looks short: "Can you confirm this refund
includes all taxes and fees? On an involuntary cancellation
I am entitled to the full ticket value including all taxes."

─────────────────────────────────────────────────────
NOTICE PERIOD — EU261/UK261

⚠ MARKET CHECK FIRST — the 14-day rule below is EU/UK ONLY.
Before applying it, confirm departure market (Module 1):
  India → different structure entirely: a two-week information duty AND a
    separate block-time-banded compensation trigger. See INDIA GOVERNING
    BLOCK, Module 1. Do not quote a single India figure from here.
  Brazil → <72 hours | Mexico → <72 hours
  Thailand → <7 days international / <3 days domestic
  US → no cancellation compensation; refund rights only
Applying the 14-day rule to a non-EU/UK departure is a routing error.

14+ days: No compensation. Refund/rerouting right + duty of care still apply.

7–13 days [Art 5(1)(c)(ii)]:
  Rerouted departing no more than 2hrs early AND arriving under 4hrs late
    → NO compensation. Both limbs must be met.
  Any other rerouting → full compensation
  Refund only offered → full compensation

Under 7 days [Art 5(1)(c)(iii)]:
  Rerouted departing no more than 1hr early AND arriving under 2hrs late
    → NO compensation. Both limbs must be met.
  Any other rerouting → full compensation

⚠ These are EXEMPTIONS, not reductions. Do not tell a passenger they get
50% here — if both limbs are met they get nothing. The separate 50%
reduction under Art 7(2) applies to rerouting arriving within 2/3/4hrs
by distance band, and is the airline's option, not automatic.

Under 14 days, no rerouting offered → full compensation + full refund.

India: → INDIA GOVERNING BLOCK, Module 1.

─────────────────────────────────────────────────────
EXTRAORDINARY CIRCUMSTANCES — THE BATTLEGROUND

VALID: Severe weather at departure airport. ATC strikes (third party).
Airport security incidents. Political instability. Government restrictions.
Hidden manufacturing defect on specific aircraft (rare, specific).

NOT VALID (airlines claim wrongly):
Crew shortage — operational failure, not extraordinary.
Most technical faults — routine maintenance is airline's responsibility.
Crew out of hours — scheduling failure.
IT/system outages — operational failure.
Own staff strikes (ECJ Krüsemann 2018 confirmed).
Baggage handler strikes — can be extraordinary only if genuinely third party.

THE MOVE when extraordinary circumstances claimed:
"I understand you're claiming extraordinary circumstances. I need written
documentation of exactly what caused this specific flight to be cancelled,
which extraordinary circumstance applies, and when your operations team
first became aware of it."

Airlines cannot produce specific documentation for crew shortages or
routine tech faults. Requesting it in writing improves odds.
Odds uplift: MODERATE (25-40%) [OPS]

CRITICAL: Extraordinary circumstances NEVER removes duty of care.
Meals, hotel, transport still owed even in weather cancellations.
This is the most common airline misrepresentation.

─────────────────────────────────────────────────────
SAME-DAY CANCELLATIONS

For cancellations on the day of departure, the airline's live
flight status page shows current information within a narrow
window around today. OTA systems receive updates from the
airline but may lag behind.

If disruption information appears on the airline's website:
screenshot it immediately with the timestamp visible.

Act without delay: every hour of inaction after a same-day
cancellation costs available seat inventory. Other affected
passengers are claiming alternatives at the same time.
The earlier a passenger responds, the more options exist.

─────────────────────────────────────────────────────
FIRST ACTION — ALWAYS BEFORE ANYTHING ELSE

Request cancellation certificate in writing.
Before discussing alternatives. Before signing. Before accepting anything.

Say: "Before we discuss anything else, I need a written cancellation
certificate with the reason, your name, and the current time."

Without this document, all subsequent claims are weaker.

─────────────────────────────────────────────────────
MOVE 1 — ESTABLISH POSITION

Say: "My flight has been cancelled with less than 14 days notice. Under
[UK261 / EC261] I am entitled to: first, choice of full refund or rerouting;
second, duty of care including meals and accommodation; third, compensation
of [£X / €X]. I would like rerouting on the earliest available flight."

Get: Confirmation of new routing IN WRITING before leaving the desk.
Boarding pass alone is not enough. Written booking reference.

If they offer refund only: "I am not choosing refund. I am exercising my
right to rerouting under [UK261 / EU261]. Please check partner airline
availability if you have no seats on your own flights."

─────────────────────────────────────────────────────
MOVE 2 — AUTOMATIC REBOOKING REJECTION

Airline has auto-rebooked. Passenger doesn't know they can reject this.
Window closes when new flight departs.

The right to reject is explicit: an automatic rebooking is
a proposal, not a confirmed change. Accepting it changes
what options remain. Rejecting it keeps all options open.
The window to reject closes when the new flight departs.

If rerouting is not acceptable:
Say: "I am rejecting the automatic rebooking on [flight/date]. The rerouting
offered is not acceptable. Please check all available options including
[Star Alliance / Oneworld / SkyTeam] partner airlines."

Also say: "Please check whether any alliance partner has availability on
this route today."

Requesting alliance inventory explicitly improves routing outcomes.
Odds uplift: MODERATE (40-50%) [OPS]

MCT error check: if the auto-reissued itinerary contains a
connection below the published minimum connection time, the
airline must reissue at no cost as a one-time exception.
Say: "The connection on this reissued itinerary is below the
published minimum connection time. I am asking you to reissue
with a workable connection at no additional charge."

─────────────────────────────────────────────────────
MOVE 3 — ESCALATION

Say: "I would like to speak with your duty manager or supervisor."

Escalation path:
1. Same airline, supervisor level
2. Airport duty manager
3. Airline 24-hour operations line (call from airport, do not leave)
4. Alternative airline desks (ask directly for seats during mass disruptions)

Counter closed is not a dead end. Desks open 2-3hrs before next departure
on that route. 24-hour phone line always available.

─────────────────────────────────────────────────────
THE VOID WINDOW — IF A CHANGE WAS JUST PROCESSED

Some airlines allow a processed change or new booking to be
cancelled within 24 hours of purchase — before the transaction
posts to the bank. This is the void window. The charge drops
off rather than being posted.

Not all airlines offer this. OTA agents can check whether
it applies when asked.

Void is not available on:
- Tickets purchased on the same day or within 24 hours
  of the flight departure
- LCC carriers when departure is within 7 days — LCCs
  generally allow void only when departure is more than
  7 days away

If a change or reissue has just been processed: ask the OTA
agent whether a void window applies before the 24-hour mark
passes. Once it passes, the change is governed by fare rules.

─────────────────────────────────────────────────────
LEGAL ROUTE

UK: CAA (caa.co.uk) or Aviation ADR / CEDR | Deadline: 6 years
EU: National Enforcement Body for departure country | Min 2 years
Canada: CTA (otc-cta.gc.ca)
USA: DOT complaint portal (transportation.gov/airconsumer)
India: DGCA makes the rules; file at AirSewa (airsewa.gov.in), the
  Ministry of Civil Aviation portal

Success with full documentation: HIGH (60-80%) [REG] — entitlement exists;
  documentation removes the airline's room to dispute facts.
Without documentation: LOW (under 25%) [OPS]

─────────────────────────────────────────────────────
THE FIVE TRAPS

TRAP 1 — GOODWILL GESTURE FORM:
Before signing anything: "Does accepting this affect any future compensation
claim I might have?" If they cannot confirm it does not: DO NOT SIGN.

TRAP 2 — REFUND TRAP:
Check current market price of replacement before accepting refund.
Rerouting = airline bears price difference. Refund = passenger bears it.

TRAP 3 — VERBAL AGREEMENTS:
Any arrangement must be confirmed in writing before leaving the desk.
If not in writing, it did not happen.

TRAP 4 — EXTRAORDINARY CIRCUMSTANCES IS FINAL:
It is not. Request written evidence. Most airlines cannot produce it.

TRAP 5 — ACCEPTED CHANGES ARE FINAL:
Once a rebooking or change is confirmed and accepted, it
cannot be undone — except via the void window where available.
Reissues can also be voided, but not all airlines allow this.
Once accepted and the void window has passed, the change
cannot be reversed and fare rules apply.

Any further changes fall under fare rules as voluntary —
fees and restrictions apply.

Before accepting any option: "If I accept this, can it
still be changed afterwards and under what conditions?"
Know the answer before confirming.

THE MYTH — "You've been rebooked so you're not entitled to compensation."
FALSE. Rerouting and compensation are separate entitlements. Both apply.
"Accepting rerouting does not waive my right to compensation under
[UK261/EU261]. These are two separate entitlements under the regulation."

─────────────────────────────────────────────────────
INVOL ENDORSEMENT CHECK

Under Resolution 735d, replacement ticket must have "INVOL" in the
first 5 characters of the endorsement/restriction field.

If new operating carrier check-in refuses ticket:
"Under IATA Resolution 735d Article 7.5, the replacement ticket must have
INVOL in the endorsement field. Please confirm whether it appears. If not,
the issuing carrier must rectify before I can board."

─────────────────────────────────────────────────────
SPECIAL SCENARIOS

OTA BOOKING CANCELLATION:
Ask OTA: "Has the airline issued a waiver code for this disruption?"
Invoke IATA 735d: "Involuntary disruptions are the airline's obligation
regardless of booking channel." See Module 4 for full OTA protocol.

MASS CANCELLATION (weather/ATC):
Extraordinary circumstances may apply. Compensation may not be owed.
BUT: duty of care ALWAYS applies. Hotels, meals, transport — always.
Check alliance partner inventory explicitly. Ask for it.

CANCELLATION AFTER BOARDING:
All cancellation rights apply PLUS tarmac duty of care for time on aircraft.

CONNECTING FLIGHT CANCELLATION ON SINGLE TICKET:
First flight cancelled causing missed connection — responsibility entirely
with operating carrier on first segment. Do not go to connecting airline desk.
Invoke IATA 735d and Resolution 766.

─────────────────────────────────────────────────────
DOCUMENT CHECKLIST

□ Cancellation certificate (written, reason, agent name, time)
□ New booking confirmation (if rerouted)
□ Original boarding pass
□ Original booking confirmation
□ Receipts: meals / hotel / transport
□ Screenshot of cancellation notification with timestamp
□ Agent names and times of all conversations
□ Written evidence of extraordinary circumstances claim
  — or documented refusal to provide it
□ Photograph of departure board showing cancellation

---

---

# MODULE 2B — DELAY PROTOCOL

STEP 1 — FOUR QUESTIONS BEFORE ANY ADVICE

Q1: Domestic or international?
Q2: Does the delay affect the overall journey or is it contained?
Q3: Single ticket or separate tickets for connections?
Q4: What is the arrival delay at the FINAL destination?

─────────────────────────────────────────────────────
THE ARRIVAL DELAY RULE — CRITICAL

Compensation and rights are calculated on ARRIVAL DELAY at FINAL DESTINATION.
NOT on departure delay of any single flight.

Confirmed by ECJ: Sturgeon v Condor (2009), Folkerts v Air France (2013).

Example 1: Flight departs 4hrs late, makes up time, arrives 2.5hrs late.
Result: No EU261 compensation. Arrival delay under 3 hours.

Example 2: First flight 45min late. Missed connection. Final arrival 4hrs late.
Result: Full EU261 compensation based on 4-hour arrival delay.

Always ask: "What is the expected arrival time at my FINAL destination?"
That number is the only one that matters.

─────────────────────────────────────────────────────
DELAY THAT DOES NOT AFFECT OVERALL JOURNEY

No compensation if arrival delay under threshold.
Duty of care still applies.

EU261/UK261 duty of care triggers (regardless of compensation):
2hrs+ wait: Free meals and refreshments. Two free phone calls or emails.
Overnight: Hotel accommodation + transport to/from hotel.

Mainstream carriers sometimes offer meal vouchers proactively.
If not offered: ask at the counter. Ask once, clearly.
Do not escalate into a confrontation — a calm request is enough.
Passengers who ask get it. Those who wait often do not.

Move: "My flight has been delayed by [X] hours. Under [EU261/UK261]
Article 9, I am entitled to meals and refreshments. Please provide
vouchers or direct me to where I can claim these."

Get vouchers in writing before eating. Keep all receipts.

─────────────────────────────────────────────────────
DOMESTIC DELAY RULES BY MARKET

UK domestic: UK261 applies. 3hrs+ arrival → compensation. Under 1,500km → £220.
EU domestic: EU261 applies. 3hrs+ arrival → compensation. Under 1,500km → €250.
US domestic: No federal delay compensation. DOT tarmac rules apply.
  2hrs tarmac: food, water, toilet, medical. 3hrs: right to disembark.
Canada domestic: APPR applies (large vs small carrier — see Module 1).
India domestic: no cash compensation. Meals threshold varies by block time
  (2hr / 3hr / 4hr). 6hrs+ = refund or alternative. → Module 1.
Brazil domestic: 2hrs+ threshold. Food, updates every 30 mins. Alternative at 4hrs.
Australia domestic: ACL. No fixed amounts. Refund right if unreasonable delay.

─────────────────────────────────────────────────────
THRESHOLDS FOR COMPENSATION

EU261 / UK261: 3hrs+ arrival at final destination
Canada APPR: 3hrs+ (by tier — see Module 1)
Brazil ANAC: 2hrs+ (shorter than EU)
Turkey: 3hrs+
India: No monetary compensation for delays. 6hrs+ = refund/rebooking.
  Meals thresholds vary by block time → INDIA GOVERNING BLOCK, Module 1.
Australia: No fixed amounts. ACL governs.
US: No federal delay compensation law.

REBOOKING AT THRESHOLD: free rerouting is usually limited to the same
airline or its codeshare partners. Rerouting on a competitor airline
is possible in some jurisdictions but not guaranteed and may require
escalation. If same-airline options are limited: ask explicitly for
codeshare and alliance partner availability before accepting a
delayed service on the original carrier.

THE REFUND-AND-REBOOK CASH TRAP:
If the delay crosses the threshold and the passenger takes a refund
to rebook with another airline: the refund typically takes 7-10+
days to arrive. The replacement booking must be paid for now — out
of the passenger's own funds — while the refund processes.

Do not choose the refund-and-rebook route without cash available
to cover the new booking upfront. If funds are not available:
rerouting keeps the airline responsible for the fare difference.
The passenger does not pay the gap. The airline does.

─────────────────────────────────────────────────────
MCT — MINIMUM CONNECTION TIME

Definition: Legally published minimum time required at a specific airport
for a specific connection type (D-D, D-I, I-D, I-I).
Accounts for: terminal walking, immigration, security, gate time.

The 5-minute rule:
If delay leaves less than MCT before onward departure → airline's fault.
Even 5 minutes below MCT = valid missed connection claim.
No tolerance. No grey zone.

The stronger claim — booked below MCT:
If original booking had less than MCT between flights → airline's booking error.
Say: "My original connection was booked below your published MCT for this
airport and connection type. This is an airline booking error. Please rebook
me under involuntary rerouting at no cost."

─────────────────────────────────────────────────────
DELAY CAUSING MISSED CONNECTION — SINGLE TICKET

Marketing carrier must rebook. Rebooking window: typically ±2/3 days.
Delivering carrier (Resolution 766) handles everything — not the onward carrier.

Move at delivering carrier desk:
"My inbound flight arrived late and I missed my connection. I am on a
single ticket. Under Resolution 766 you are the delivering carrier and
responsible for rebooking me. Please cancel my missed onward connection
and rebook me on the next available service to [destination]."

Do NOT go to the onward carrier's desk first.

─────────────────────────────────────────────────────
DELAY CAUSING MISSED CONNECTION — SEPARATE TICKETS

The second ticket has NO obligation to accommodate.
Passenger has TWO separate problems:
Problem 1: Delayed airline owes refund/rerouting on ticket 1.
Problem 2: Ticket 2 likely forfeited under no-show rules. New booking needed.

ADVISORY at start of every delay conversation:
"Are your flights on a single booking reference or two separate tickets?
This changes your options significantly."

─────────────────────────────────────────────────────
DELAY BELOW TRIGGERING THRESHOLD

Situation 1: Arrival delay under 3hrs (EU/UK). No compensation.
Duty of care if waiting 2hrs+ still applies.

Situation 2: MCT not breached. Connection still makeable.
No missed connection claim. If tight: ask airline to priority assist.

Situation 3: Delay within airline's own published threshold.
AA: non-refundable refund requires 4hrs+ schedule change.
AA within 72hrs: 90min change = involuntary refund right.
Air Canada: 3hrs+ departure or arrival for involuntary refund.

While under threshold: collect proof now.
Departure board photo, disruption notification, agent name and time.
If the delay extends to threshold, this documentation is the
foundation of the claim. Evidence collected in the moment is
stronger than reconstructed evidence later.

─────────────────────────────────────────────────────
TARMAC DELAYS

US DOT: 2hrs = food/water/toilet/medical. 3hrs domestic / 4hrs international = disembark right.
Canada APPR: 3hrs disembark right. Calls, food, water required.
EU/UK: No specific tarmac regulation. Duty of care applies. Request amenities.
Saudi Arabia/Oman: Disembark after 3hrs. Explicitly in their regulations.

─────────────────────────────────────────────────────
AIRPORT vs CONTACT CENTER

Airport duty manager has authority contact center agents do not have.
At the airport: urgency is real, decisions are fast, discretion is higher.
Contact center: follows scripts, escalation takes hours, lower authority.

For any complex disruption: get to the airport desk if possible.
Coming to the airport a few hours before departure to fix a ticket
issue is possible and often faster than days of phone calls.

Airports are too high-volume and chaotic for tactical claim manipulation.
Agents are processing hundreds of passengers. They want to clear the queue.
This works in the passenger's favour. Fast decisions = more flexible outcomes.

─────────────────────────────────────────────────────
HIGHER CABIN ON REROUTING

Standard rule: same cabin class only. No free upgrades.
Airport exception (rare, discretionary):
If only higher cabin available, airport staff sometimes offer partial
upgrade with a discounted fare difference. Not a right. Worth asking.
Say: "If only [Business/Premium] is available, are you able to rebook
me with a discounted fare difference rather than waiting for economy?"
Almost never possible via phone. Sometimes at the airport.

---

---

# MODULE 2C — DENIED BOARDING PROTOCOL

STEP 1 — ESTABLISH WHICH TYPE

VOLUNTARY: Passenger chooses to give up seat. Statutory rights may be waived.
INVOLUNTARY: Confirmed booking + boarding pass + airline refuses carriage.
Full statutory compensation applies. This module covers INVOLUNTARY only.

─────────────────────────────────────────────────────
TWO PATHS — DETERMINE WHICH APPLIES FIRST

PATH A — OVERBOOKING / CAPACITY:
Confirmed booking + boarding pass + airline refuses carriage due to
capacity or overbooking. Statutory compensation applies.
This module's MOVE 1/2/3 protocol applies in full.

PATH B — PASSENGER-SIDE REASONS:
Denied due to document issue, passport validity, medical fitness,
or security-related restriction. Statutory denied boarding
compensation generally does not apply.

However: airlines sometimes issue a waiver in Path B situations
to allow fee-free changes or reissuance on an otherwise
non-changeable ticket. Not automatic — ask the airline whether
a waiver applies given the circumstances. Always a possibility.
Not always available.

─────────────────────────────────────────────────────
WHY IT HAPPENS / WHAT AIRLINES SAY

Real reason: overbooking (most common).
What airlines say: "Operational reasons." "Aircraft change." "Capacity issue."
The label is irrelevant. Confirmed booking + boarding pass + refusal = involuntary denied boarding.

Does NOT apply: late to gate after boarding closed, security/documentation issues,
medical unfit, behaviour issues.

─────────────────────────────────────────────────────
BOARDING PRIORITY

Airline MUST ask for volunteers first (EU261, UK261, DOT).
If volunteers insufficient: own boarding priority rules apply.
Generally protected last: passengers with disabilities, unaccompanied minors,
medical assistance passengers, higher fare class.
If volunteer call was skipped: document it. Ask for written confirmation.

─────────────────────────────────────────────────────
COMPENSATION BY MARKET

EU261 (EU departure):
Under 1,500km + rerouting within 2hrs → €125 | Otherwise → €250
1,500-3,500km + rerouting within 3hrs → €200 | Otherwise → €400
Over 3,500km + rerouting within 4hrs → €300 | Otherwise → €600
Plus: duty of care + refund/rerouting choice + written notice of rights.

UK261 (UK departure):
Reduced 50% if rerouted within time thresholds.
Standard: £220 / £350 / £520

USA DOT (US departure):
Rerouting within 1hr: NO compensation.
Domestic 1-2hr delay: 200% capped $1,075 | 2hrs+: 400% capped $2,150
International 1-4hr: 200% capped $1,075 | 4hrs+: 400% capped $2,150
[Figures mirror Module 1 USA block — 14 CFR 250.5, DOT final rule Oct 2024.
TICKETS Act: these are minimums. Carriers may pay more.]
CRITICAL: Compensation paid AT THE AIRPORT, same day. Cash or check.
Voucher ONLY if passenger agrees in writing. No written agreement = cash required.

Canada APPR large carriers (see Module 1 for who counts as large):
Under 6hr → CAD $900 | 6-9hr → CAD $1,800 | 9hrs+ → CAD $2,400
⚠ Bands measure arrival delay at destination. The 48-hour figure that
circulates is the PAYMENT deadline, not a compensation band.

India DGCA: → INDIA GOVERNING BLOCK, Module 1. Within 1hr = NOTHING owed.
  Figures are percentages of basic fare plus fuel with caps, not flat sums.
Saudi Arabia: up to 200% of ticket
Oman: 50% ticket (2-6hrs) / 260 OMR (6hrs+)

─────────────────────────────────────────────────────
FIRST ACTION — DO NOT LEAVE THE GATE

Request written denied boarding confirmation (reason, agent name, time).
This is the foundation of everything. Get it before any discussion.

IF BOOKED THROUGH AN OTA:
Ask the airport agent to note what happened on the booking record
before leaving the gate. The OTA needs this note to action the
case. Without it, the OTA has nothing in the system to work from
and the passenger must rebuild the full account from scratch.

─────────────────────────────────────────────────────
MOVE 1 — STATE POSITION

Say: "I hold a confirmed paid booking and boarding pass. I have been involuntarily
denied boarding. Under [EU261/UK261/DOT] I am entitled to [£X/€X/$X] compensation
payable immediately, plus choice of refund or rerouting, plus duty of care.
I am requesting the compensation now and rerouting on the earliest available flight."

EU/UK add: "You are required to provide written notice of my rights. Please provide this now."
US add: "DOT rules require cash or check compensation today. I am not accepting a voucher."

→ If comply: Get everything in writing before leaving gate.
→ If offer voucher (US): "I did not agree in writing to a voucher. DOT requires cash."
→ If deny: Move 2.

─────────────────────────────────────────────────────
MOVE 2 — DUTY MANAGER

Say: "I would like to speak with your airport duty manager. I hold a confirmed booking,
I have been involuntarily denied boarding, and I am being denied statutory compensation.
I require a duty manager to process this now."
Odds of resolution: HIGH (60-80%) [REG] — the entitlement is statutory;
  the duty manager has authority the gate agent lacks.

─────────────────────────────────────────────────────
MOVE 3 — TRAVEL FIRST, CLAIM AFTER

Accept the rerouting. Do not refuse to travel.
Document everything. File post-journey claim (Module 2F).

Accepting rerouting does not waive the right to compensation.
These are separate entitlements. Travelling on the alternative
flight and filing the compensation claim afterwards are both valid.

─────────────────────────────────────────────────────
THE VOUCHER TRAP

EU/UK: Cash compensation is a statutory right. Voucher only with written agreement.
US DOT: Same rule. Cash or check unless passenger explicitly agrees in writing.
Most common mistake: accepting voucher under gate pressure without knowing cash was available.

─────────────────────────────────────────────────────
VOLUNTEER NEGOTIATION

Negotiate before agreeing:
1. Cash not voucher.
2. Next flight class of service confirmed.
3. Hotel if overnight.
4. Get amount in writing before accepting.
Counter-offer: gate agent wants to close the door. Time is leverage.

─────────────────────────────────────────────────────
DOWNGRADE DISTINCTION

Not the same as denied boarding — but both rights may apply simultaneously.
EU261: 30%/50%/75% reimbursement depending on flight length.
AA specifically: 40% of ticketed fare on affected segment (from tariff, confirmed).

─────────────────────────────────────────────────────
CONNECTING FLIGHT IMPACT

Compensation based on ARRIVAL DELAY at FINAL DESTINATION.
Denied boarding London→Amsterdam, missing Singapore connection, arriving 6hrs late:
Compensation = €600 (Singapore distance), not €250 (Amsterdam only).

─────────────────────────────────────────────────────
DOCUMENT CHECKLIST

□ Written denied boarding confirmation (reason, name, time)
□ Written notice of rights (EU/UK — mandatory from airline)
□ Original booking + boarding pass
□ New booking confirmation
□ Compensation offer in writing (amount, payment form, timeline)
□ Receipts for meals/hotel/transport
□ Agent name, badge, exact words, times
□ Booking note reference (if OTA booking — confirm agent added it)

---

---

# MODULE 2D — MISSED CONNECTIONS PROTOCOL

STEP 1 — FOUR SCENARIOS

A — AIRLINE-CAUSED: Inbound delay caused missed connection. Full rights. Delivering carrier responsible.
B — SCHEDULE CHANGE: Marketing carrier must rebook and match original connection time.
C — GREY AREA: Long queue or personal circumstances. No statutory rights. Goodwill only.
D — SEPARATE TICKETS: No protection. Second ticket forfeited. Rebook at market price.

─────────────────────────────────────────────────────
SINGLE TICKET FIRST CHECK

"Are your flights on a single booking reference or two separate tickets?"
If unclear: same email/PNR = single ticket. Different emails/references = separate.

─────────────────────────────────────────────────────
WHO IS RESPONSIBLE — SINGLE TICKET

IATA Resolution 766: delivering carrier responsible.
They cancel unused onward connection and rebook.
Do NOT go to onward carrier's desk first.

THE TWO-OPTION RULE (within 72 hours / schedule change):
Option 1: Marketing carrier (always).
Option 2: Operating carrier (within 72-hour window under IATA 735d).
Go to whoever is more accessible or has shorter queue.
New rebooked connection MUST be legally valid — must meet MCT.
Chain of responsibility continues until passenger reaches final destination.

─────────────────────────────────────────────────────
MCT — THE 5-MINUTE RULE

If inbound delay leaves less than MCT before onward departure: airline responsible.
5 minutes below MCT = valid claim. No tolerance.

Booked below MCT from start = airline booking error. Stronger claim.
Say: "My original connection was booked below the published MCT. This is an airline
booking error. I require involuntary rerouting at no cost."

─────────────────────────────────────────────────────
GREY AREA PROTOCOL (long queue/personal circumstances)

CALL BEFORE YOU MISS IT. Not after.
Call OTA or airline while still in queue.
This creates a timestamp record and shows proactivity.
If at a desk: ask them to call ahead to the gate.
If missed: ask for goodwill rebooking. Say "goodwill" not "entitlement."
Future advice: 2-3 hours minimum for international connections.
Travelling with elderly or children: always book longer connections.

─────────────────────────────────────────────────────
THE OTA BOOKING PROBLEM AT THE COUNTER

Standard airline response: "Call your OTA." — normal redirect, not a refusal.
Sometimes airline helps anyway at counter.

PROBLEM: When airline touches OTA booking, OTA loses control.
OTA system no longer matches what airline changed.
Future servicing (return flights) becomes complicated.
Airlines therefore typically help only for one leg or one-way.
Rarely touch legs 2-4 of a 4-leg round trip.

WHAT TO DO:
1. Accept whatever help the airline offers. Take the seat.
2. Get written record of exactly what was changed.
3. Immediately call/message OTA: "Airline changed [details]. Please update your records."
4. If OTA cannot service: invoke IATA 735d and ask them to reconcile with airline.
If you do not brief OTA: return/onward flights may be at risk.

─────────────────────────────────────────────────────
MOVE 1 — DELIVERING CARRIER DESK

Say: "My inbound [flight] from [city] arrived late. I missed my connection on [flight].
I am on a single ticket. Under IATA Resolution 766 you are the delivering carrier.
Please cancel my missed onward connection and rebook me to [final destination] at no cost."

Get: New booking in writing. Hotel if overnight. Meal vouchers.
Check new connection meets MCT before accepting.

If they redirect to onward carrier: "Under Resolution 766 this is your responsibility."

MOVE 2 — WITHIN 72 HOURS: OPERATING CARRIER ALTERNATIVE

Go to operating carrier's desk.
"I am on a [marketing carrier] ticket but operated by you. Within 72 hours.
Missed connection due to inbound delay. Please check options under IATA 735d."

MOVE 3 — CALL OTA + AIRLINE LINE

Do not leave airport without: confirmed new booking in writing, OR
involuntary refund confirmation, OR written record that both were refused.

─────────────────────────────────────────────────────
COMPENSATION — ALWAYS TO FINAL DESTINATION

EU261/UK261: Arrival delay at FINAL DESTINATION determines compensation.
Not the missed segment. Not the inbound flight.

Example: London→Amsterdam (missed)→Singapore. Arrive 5hrs late in Singapore.
Compensation = €600 (London-Singapore distance). NOT €250 (London-Amsterdam).
This is consistently underclaimed.

─────────────────────────────────────────────────────
THE SEPARATE TICKET TRAP

Different booking references = no interline protection.
First ticket delay + second ticket missed = second ticket forfeited.
Must rebook second at market price (often 3-5x original).
Preventive rule: 4-6 hours minimum between separate tickets.
On low-frequency routes: overnight buffer recommended.



---

---

# MODULE 2E — SCHEDULE CHANGES PROTOCOL

STEP 1 — THREE DISTINCTIONS

SCHEDULE CHANGE (planned): Proactive advance change. RP1735 governs.
CANCELLATION: Flight won't operate. Module 2A governs.
IROP: Day of travel or day prior. Resolution 735d governs.

THE KEY THRESHOLD: Schedule change notified <14 days before departure
= treated as CANCELLATION under EU261/UK261. Full compensation applies.

─────────────────────────────────────────────────────
NOTICE PERIOD — WHO TOLD THE PASSENGER AND WHEN

Notice is measured from when PASSENGER was informed.
Not when airline changed internally. Not when OTA was notified.
OTA failure to pass notification = OTA liability (Module 4).
Email timestamp is the evidence. Screenshot and preserve it.

─────────────────────────────────────────────────────
THRESHOLDS BY MARKET

EU261/UK261: <14 days = cancellation treatment. Full compensation + refund/rerouting + duty of care.
AA tariff (>72hrs): 3hrs+ domestic / 4hrs+ international = refund right.
  Flight number change alone = refund right.
  Added connections = refund right.
AA tariff (within 72hrs): 90min = involuntary refund right.
Air Canada: 3hrs+ departure OR arrival = involuntary refund.
Brazil: <72hrs = cancellation treatment.
India: → INDIA GOVERNING BLOCK, Module 1 (block-time bands, not one cap).
Mexico: <72hrs = passenger rights apply.
Thailand: <7 days international / <3 days domestic.

─────────────────────────────────────────────────────
FOUR TYPES OF CHANGE

TIME CHANGE: Does it cross threshold? Cause missed connection? Make journey useless?
FLIGHT NUMBER CHANGE (same time): AA tariff confirms refund right even if times identical.
  Say: "Flight number change from [XX] to [YY] triggers my involuntary refund right
  under your tariff. I am requesting a full refund of my non-refundable ticket."
ROUTING CHANGE (added stop): AA tariff + EU261 if <14 days. Refund right confirmed.
DATE CHANGE: Clear cancellation trigger if <14 days EU/UK.

─────────────────────────────────────────────────────
JOURNEY RENDERED USELESS

Schedule change arrives on time but travel purpose is now impossible:
Event finished | Cruise departed | Hotel window missed | Meeting concluded
Say: "The schedule change means I arrive [X hrs] after [purpose]. The purpose of my
travel cannot be served. The rerouting offered is not a reasonable alternative.
I am requesting a full refund as the journey has been rendered useless."
Strongest when purpose was time-sensitive and previously documented.

─────────────────────────────────────────────────────
MOVE 1 — CALCULATE BEFORE RESPONDING

Do not accept airline app/website offer before calculating:
Hours of change. Notice period. Connection impact. Journey purpose impact.
Once confirmed in app: rights may narrow.

MOVE 2 — OVER THRESHOLD
Say: "The schedule change is [X hours]. Notified [X days] before departure.
Under [EU261/UK261] this constitutes cancellation treatment. I am entitled to
[£X/€X] compensation plus [refund/rerouting]. I choose [option]."

MOVE 3 — UNDER THRESHOLD
Negotiate: date change waiver, fee waiver, open credit.
Direct airline line has more flexibility than OTA agent.

─────────────────────────────────────────────────────
THE CREDIT TRAP — THREE DIFFERENT TYPES

ALWAYS confirm in writing which type before accepting:
USE BY: All travel must COMPLETE within 1 year of original booking date.
COMMENCE BY: Travel must START within 1 year of original booking date.
COMPLETE TRAVEL BY: All legs must FINISH within 1 year.
Getting this wrong = credit forfeited. Get the type in writing.

─────────────────────────────────────────────────────
DOCUMENT CHECKLIST

□ Original booking (original times/routing)
□ Schedule change notification with TIMESTAMP (evidence of notice period)
□ Written record of new times/flight number offered
□ Credit terms in writing (including credit type)
□ Evidence of original purpose if journey rendered useless

---

---

# MODULE 2F — POST-JOURNEY CLAIMS

THE THREE-STAGE LADDER
Stage 1: Direct airline claim (always first — free, often faster)
Stage 2: Regulatory body (after 8 weeks no response or rejection)
Stage 3: Small claims court / ADR (the nuclear option)

─────────────────────────────────────────────────────
WHAT CAN BE CLAIMED

Fixed statutory compensation (EU261/UK261/APPR/DOT not resolved at airport)
Expense reimbursement: meals, hotel, transport during disruption (keep receipts)
Involuntary refund misclassification: airline processed as voluntary, deducted penalty
Baggage claims: separate process, different deadlines

─────────────────────────────────────────────────────
STAGE 1 — DIRECT AIRLINE CLAIM — LANGUAGE THAT WORKS

Most passengers write emotional descriptions. Airlines process those last.
Legal language + specific regulation + specific amount + specific documentation = paid faster.

TEMPLATE:
Subject: EU Regulation 261/2004 Compensation Claim — Flight [NUMBER] [DATE] [ROUTE]

I claim compensation under EU Regulation 261/2004 for flight [NUMBER], [ORIGIN]-[DESTINATION], [DATE].
The flight was [delayed X hours on arrival / cancelled X days notice / denied boarding involuntarily].
Under Article 7, I am entitled to [€250/400/600] for a distance of [X km].
[For expenses:] I also claim €[X] reimbursement under Article 9. Receipts attached.
[If extraordinary circumstances claimed:] Please provide specific documented evidence of what caused
this disruption, which extraordinary circumstance applies, and when operations first knew.
Booking reference: [X] | Original departure: [time] | Actual arrival: [time] | Delay: [X hrs]
Attached: boarding pass, booking confirmation, receipts.
If no satisfactory response within 8 weeks I will escalate to [CAA/NEB].

─────────────────────────────────────────────────────
STAGE 1 — KEY AIRLINE CLAIM PORTALS

BA: britishairways.com/contact/customer-relations
AA: aa.com/contact/forms
Ryanair: ryanair.com/services/help/claims
easyJet: easyjet.com/en/help/refunds-and-claims
Air Canada: aircanada.com customer support section
Lufthansa: lufthansa.com/compensation
Emirates: emirates.com/english/help/contact-us

Expected response: 7-14 days acknowledgement. 4-8 weeks full response.
After 8 weeks: Stage 2.

─────────────────────────────────────────────────────
STAGE 2 — REGULATORY BODIES

UK:
  CAA: caa.co.uk/passengers (formal, slower)
  Aviation ADR: aviadradr.co.uk (faster, binding on members)
  CEDR: cedr.com/aviation (faster, binding on members)
  Check airline is a member before filing ADR.

EU: National Enforcement Body for departure country (see Module 1 list). Free. Formal.

US: DOT complaint portal: transportation.gov/airconsumer/file-consumer-complaint
  Formal record. Airlines respond faster to DOT complaints.

Canada: CTA — otc-cta.gc.ca

India: DGCA is the regulator; AirSewa (airsewa.gov.in) is the Ministry
of Civil Aviation grievance portal — file there

─────────────────────────────────────────────────────
STAGE 3 — UK SMALL CLAIMS (MOST EFFECTIVE OPTION)

Money Claim Online (MCOL): moneyclaims.service.gov.uk
Filing fee: under £35 for claims up to £1,000.
Why it works: airlines calculate that defending costs more than settling.
Most airlines settle before the hearing on properly documented claims.
The filing triggers the airline's legal team — not customer service.

LETTER BEFORE ACTION (send 14 days before filing):
"I write as a final step before commencing legal proceedings.
I claim [£X] under UK261/EU261 for [disruption details].
I submitted a claim on [date] and received [no response/unsatisfactory response].
If I do not receive payment of [£X] within 14 days, I will issue County Court proceedings."

After 14 days: file MCOL.

EU equivalent: European Small Claims Procedure under €5,000. e-justice.europa.eu

─────────────────────────────────────────────────────
THE VOLUNTARY/INVOLUNTARY MISCLASSIFICATION

Airline-caused disruption should be processed as INVOLUNTARY refund:
Full amount + all taxes. No penalty.
If processed as voluntary: penalty deducted that should not apply.
Say: "This disruption was airline-caused. It should be processed as
involuntary under IATA Resolution 737. Please refund the incorrectly
deducted penalty of [£X]."

─────────────────────────────────────────────────────
BAGGAGE CLAIMS — SEPARATE DEADLINES

Damaged: 7 days from receipt (written claim to airline)
Delayed: 21 days from delivery (written claim)
Legal action: 2 years from arrival
Delivery damage (wheresmysuitcase.com): 24 HOURS — act immediately
File with LAST HANDLING CARRIER (airport code in PIR identifies them)

─────────────────────────────────────────────────────
CLAIM DEADLINES

UK261: 6 years | EU261: 2-5 years by country | US: 2 years practical
Canada APPR: 1 year to airline, 2 years to CTA
Montreal Convention (baggage): 2 years

General rule: File Stage 1 within 1 month of disruption.

─────────────────────────────────────────────────────
FLIGHT STATUS EVIDENCE

Use FlightAware (flightaware.com) or FlightRadar24 (flightradar24.com).
These are independent sources airlines cannot dispute.
Screenshot showing actual departure and arrival times.
This verifies delay length for EU261/UK261 threshold calculation.
Screenshot immediately — data is archived but access easier when fresh.

─────────────────────────────────────────────────────
DOCUMENT CHECKLIST

□ Original booking confirmation + all boarding passes
□ Delay/cancellation certificate (if obtained at airport)
□ Flight status screenshot (FlightAware/FlightRadar24)
□ All receipts: meals, hotel, transport, essentials
□ Written communication from airline about disruption
□ Stage 1 claim submission confirmation + airline response
□ Credit voucher terms if credit was offered
□ Proof of original purpose if journey rendered useless



---

---

# MODULE 3 — AIRLINE PROFILES

HOW TO USE: Each profile answers — will they pay what they owe?
Will they give more? What is the optimal approach?
Strategy options: INVOKE THE RULE | NEGOTIATE | DOCUMENT FOR STAGE 2

─────────────────────────────────────────────────────
BRITISH AIRWAYS (BA)

Compliance: HIGHEST | Flexibility: LOW | Goodwill: MINIMAL | Interline: EXCELLENT

CORE PRINCIPLE: BA is the most legally compliant major carrier.
If the regulation entitles you to it: BA will pay it. Precisely.
If it does not: BA will not give it. No goodwill. No extras.
Accounts for minutes in delay calculations and cents in fare differences.

PRECISION — USE IT BOTH WAYS:
BA calculates to the minute. A 2hr 58min delay is not 3 hours.
Use FlightAware for exact arrival times. State them precisely.
"Delayed about 3 hours" will be checked. "3hr 12min per FlightAware" will be processed.

INTERLINE: Calls partners and receives calls. Handles complex multi-carrier well.
For OTA bookings with BA as marketing carrier: BA engages the interline process correctly.
One of the few carriers who makes the interline call without being pushed.

EXTRAORDINARY CIRCUMSTANCES: Used appropriately, not as blanket refusal. Still request written evidence.

CUSTOMER RELATIONS: Responsive. Processes valid claims on documentation alone.
No need for ADR on legitimate claims with complete docs. Will not process invalid ones.

OPTIMAL STRATEGY:
Cite exact regulation + exact amount + exact times from FlightAware.
Send once. Wait 4 weeks. BA processes it.
Do NOT: ask for goodwill | approximate numbers | negotiate emotionally | expect flexibility.

─────────────────────────────────────────────────────
RYANAIR

Compliance: LOW | Flexibility: MINIMAL | Goodwill: NONE | Interline: LIMITED

CORE PRINCIPLE: Ryanair treats EU261 as a cost to be managed and resisted.
It will pay straightforward, undisputed claims. It will fight everything else.
Expect the portal to lead you away from the cash claim. Expect "extraordinary circumstances"
to be invoked for crew and technical issues. Expect the phone to be useless.
Strategy: DOCUMENT FOR STAGE 2 from the start. Small claims court is the most reliable path.

EXTRAORDINARY CIRCUMSTANCES — DOCUMENTED MISUSE:
Ryanair has been defeated in court (Irish High Court, English Court of Appeal) for
refusing strike compensation by citing extraordinary circumstances.
Own-staff strikes over pay and conditions are not extraordinary. ECJ Krüsemann confirmed.
Also over-cites weather/ATC attribution for what were operational failures.
Move: demand written documentation of the specific cause. They typically cannot produce it.

CLAIM PROCESS:
Portal: ryanair.com/services/help/claims — separate from the expenses form and the Wallet/refund flow.
The split is intentional. Always use the dedicated EU261/UK261 compensation form.
Refunds default to Ryanair Wallet (credit). Cash must be explicitly requested.
Use: refundclaims.ryanair.com and state "I require cash payment, not Wallet credit."
OTA bookings: complete the customer-verification form immediately — Ryanair adds friction
for OTA-booked passengers. Failure to complete it delays refunds indefinitely.
Expected timeline for uncontested claims: ~10 business days. Contested: months or nothing.

VOUCHER TRAP:
Ryanair Wallet is not cash compensation. It does not extinguish the statutory claim.
If offered Wallet credit: "I require cash payment under EU261/UK261 Article 7. Wallet credit
is not statutory compensation and I do not accept it in satisfaction of this claim."

INTERLINE AND REBOOKING:
Historically point-to-point only. Now has a disruption-partner waterfall under CAA pressure:
next Ryanair flight → alternative Ryanair airport → partner airlines
(easyJet, Jet2, Vueling, CityJet, Aer Lingus, Norwegian, Eurowings).
In practice passengers report being pushed toward refunds and self-rebooking with reimbursement
capped at approximately 3× the original fare. Partners are not always available or offered.

ADR AND SMALL CLAIMS:
ADR member: AviationADR (CDRL). Jurisdiction limited to UK, Spain, Denmark/Sweden departures.
ADR consumer uphold rate: has been as low as 29% for Ryanair cases (Which? 2022 data).
Ryanair has been documented ignoring ADR determinations without enforcement action being taken.
SMALL CLAIMS COURT IS THE MOST EFFECTIVE ESCALATION PATH for a clearly valid Ryanair claim.
Filing MCOL (moneyclaims.service.gov.uk) triggers Ryanair's legal team, not customer service.
Most properly documented claims settle before the hearing.
Court bailiff was used against Ryanair in Austria in 2024 for an unpaid delay claim — Ryanair settled within 3 days.

AIRPORT vs CONTACT CENTRE:
Both weak. Airport staff defer to the web portal. Phone queues are long and agents follow scripts.
Do not expect real-time resolution at the airport. Document everything and escalate post-journey.

KNOWN TRAPS:
Wallet-instead-of-cash. OTA verification friction. Extraordinary circumstances over-citation.
"Claims processed within 10 days" language used to avoid immediate airport engagement.

OPTIMAL STRATEGY:
At airport: get cancellation/denied boarding certificate in writing. Note agent name and time.
Post-journey: file precise EU261/UK261 claim via compensation portal. Cite exact article and amount.
Refuse Wallet. If no satisfactory response in 8 weeks: file MCOL directly.
Skip ADR unless the departure was UK, Spain, or Denmark/Sweden and liability is genuinely arguable.

─────────────────────────────────────────────────────
EASYJET

Compliance: MIXED | Flexibility: MODERATE | Goodwill: OCCASIONAL | Interline: LIMITED

CORE PRINCIPLE: easyJet pays straightforward claims without much resistance.
It fights "extraordinary circumstances" borderline cases aggressively and pushes vouchers.
The claims portal is the right channel. ADR uphold rates fell sharply when it switched from CEDR
to AviationADR in 2019. For a clearly valid disputed claim, small claims court beats ADR.

EXTRAORDINARY CIRCUMSTANCES:
Uses it selectively and has overreached. Documented case: blamed ATC strike when no strike occurred
(technical fault). easyJet's own guidance acknowledges technical faults and staffing/ground-crew
shortages are within its control and compensable. Weather and genuine ATC are not.
Move: request specific documentation. "Which ATC unit issued the restriction, at what time,
and how does that specifically caused the delay to this flight?" easyJet typically cannot produce specifics.

CLAIM PROCESS:
Dedicated EU261 compensation portal: easyjet.com/claim/EU261
Separate welfare/expenses form for Article 9 (meals, hotel). File both separately.
Stated target ~90 days. In practice often 7+ months for contested claims.
Vouchers (easyJet Holidays credit, marketing vouchers) are pushed but do not extinguish the claim.
If offered a voucher: "A marketing voucher does not satisfy my statutory claim under EU261/UK261.
I require cash compensation under Article 7."
Each passenger must file in their own name (or via Letter of Authority). One claim per person.
Third parties claiming without POA are routinely rejected.

FLEXIBILITY/GOODWILL:
More accommodating than Ryanair during active disruptions. Airport desks attempt to rebook.
Willing to reimburse alternative carrier fares if easyJet has no suitable flight — but passengers
often self-book and claim back, with disputes over what constitutes "earliest opportunity."
If asking for goodwill below threshold: frame as request, not entitlement. Occasionally works.

INTERLINE:
Documented cases of reimbursing alternative carrier fares (e.g., Aer Lingus) but no automatic
interline capability. Passenger typically self-books and submits receipts.

ADR AND SMALL CLAIMS:
ADR member: AviationADR (switched from CEDR May 2019).
CEDR consumer uphold rate for easyJet: ~82% in 2018.
AviationADR consumer uphold rate post-switch: ~38% (2020), as low as 24% (2021).
easyJet abides by AviationADR adjudications once made — it does not ignore them.
For a clearly valid disputed claim: small claims court is more reliable than ADR given low uphold rates.
For a genuinely arguable liability case: ADR is free and worth trying first.

AIRPORT vs CONTACT CENTRE:
Airport desks become overwhelmed and close during mass disruption.
Hotel allocation failures during mass events documented.
Web claim forms are the primary channel. Phone/chat add little.
Preserve all documentation during the disruption — do not rely on airport resolution.

KNOWN TRAPS:
Voucher push. Generic-complaint response that ignores the specific EU261 entitlement
unless you explicitly cite the article and amount. CEDR→AviationADR switch — lower uphold rates.
Long response times (7+ months) wearing down claimants.

OPTIMAL STRATEGY:
File precise claim via EU261 portal. Cite Article 7 + exact amount + exact times from FlightAware.
File Article 9 expenses claim separately. Keep all receipts.
Refuse vouchers in writing. Allow 8 weeks. If rejected or no response: assess ADR vs MCOL.
Use MCOL for clear-cut cases. Use AviationADR for arguable-liability cases where ADR is free.

─────────────────────────────────────────────────────
EMIRATES

Compliance: MODERATE (on covered routes) | Flexibility: HIGHER | Goodwill: GENUINE | Interline: STRONG

CORE PRINCIPLE: Emirates is not an EU or UK carrier. EU261/UK261 applies ONLY on flights
departing EU/EEA or UK airports (e.g., London Heathrow → Dubai). It does NOT apply
to Emirates flights departing Dubai, even to EU/UK destinations.
On covered routes: Emirates acknowledges obligations but is slow and bureaucratic.
Where the law does not apply (UAE departures): rights depend on Emirates' own policies.
Emirates' commercial policies (flexible waivers, Dubai Connect, rebooking windows) often
exceed the legal minimum on covered routes and provide meaningful cover on uncovered ones.

SCOPE RULE — APPLY BEFORE ANY MOVES:
EU/UK departure (e.g., LHR, CDG, FRA → DXB and beyond): EU261/UK261 applies.
Dubai or other non-EU/UK departure → DXB: No EU261/UK261. Emirates policies only.
If connecting beyond Dubai on a single booking: EU261 applies to the EU/UK departure segment.
The delay is measured to the FINAL destination even when the connection is via Dubai.

EXTRAORDINARY CIRCUMSTANCES:
Uses standard defences: weather, ATC, security. Correctly applied.
Own-staff strikes at EU/UK departures would be compensable.
No documented pattern of systematic misuse.

CLAIM PROCESS:
No dedicated EU261 portal. Route through General Customer Affairs:
emirates.com/english/help/contact-us
Ticket numbers starting "176" identify Emirates as the validating carrier.
Acknowledgement: up to 30 days. Final response: up to 60 days. Claim companies quote 20+ weeks direct.
Complaints of repeated automated "we'll respond soon" emails with no resolution are documented.
Unexpected fee deductions from refunds have been reported — verify final amount against expectation.
If downgraded: Emirates may offer miles or vouchers instead of the mandatory Art. 10 cash refund.
Insist: "I require the mandatory reimbursement under Article 10 of EU261, not miles or vouchers."

FLEXIBILITY AND GOODWILL:
Genuine strengths beyond legal minimums:
- Flexible rebooking waivers during disruptions (date changes, route changes, fee-free)
- Dubai Connect: complimentary hotel for 10-24hr layovers (discretionary but consistently applied)
- Generous rebooking windows on involuntary changes
- Re-routing on partner airlines when Emirates has no suitable flight
These benefits apply on both covered (EU/UK) and uncovered (UAE) routes.

INTERLINE:
Strong. Emirates has broad codeshare and interline agreements.
On a disrupted covered-route booking, Emirates rebooks first on its own network
then on partner/interline carriers. More willing to interline than LCCs.
Ask explicitly: "Please check partner airline availability for rebooking."

DOWNGRADE TRAP:
Compensation on downgrade is mandatory under Art. 10: 30/50/75% of fare by distance.
Emirates commonly offers miles or service vouchers instead. These are not equivalent.
Say: "Article 10 requires a reimbursement of [X]% of the fare paid. I require this in cash,
not miles, as the regulation specifies."

ADR AND ESCALATION:
Emirates is not a member of UK ADR schemes (Aviation ADR / CEDR) for EU261.
For UK-departure claims: escalate to UK CAA (caa.co.uk/passengers) after 8 weeks.
For EU-departure claims: escalate to the NEB of the country of departure (see Module 1).
Small claims court (MCOL) is available for UK-departure claims and is effective.

AIRPORT vs CONTACT CENTRE:
Premium-cabin service at the airport can be strong.
Economy passengers during mass disruption: contact centre is the documented route.
Written claims with full documentation are necessary — do not rely on verbal commitments.

OPTIMAL STRATEGY:
Confirm first: is this an EU/UK departure? If not, pivot to Emirates' own policies.
On covered routes: file precise written claim via Customer Affairs. Cite EU261 Article 7 + exact amount.
Allow 60 days. If no resolution: escalate to departure-country NEB or UK CAA.
MCOL available for UK-departure claims.
For discretionary benefits (waivers, Dubai Connect, flexible rebooking): ask directly. Emirates delivers.

─────────────────────────────────────────────────────
LUFTHANSA GROUP

NOTE: Compliance varies sharply within the group. Know which carrier operated the flight.

LUFTHANSA MAINLINE
Compliance: LOW-MEDIUM | Flexibility: LOW | Goodwill: MINIMAL | Interline: EXCELLENT

SWISS
Compliance: LOW (mechanical-fault loophole) | Flexibility: LOW | Goodwill: MINIMAL | Interline: GOOD

AUSTRIAN AIRLINES
Compliance: HIGH | Flexibility: MODERATE | Goodwill: OCCASIONAL | Interline: EXCELLENT

BRUSSELS AIRLINES
Compliance: HIGHEST IN GROUP | Flexibility: MODERATE | Goodwill: OCCASIONAL | Interline: EXCELLENT

─────────────────────────────────────────────────────
THE INTRA-GROUP DIVERGENCE — THE MOST IMPORTANT ADVISORY POINT

Same ticket. Same legal rights. Radically different payment behaviour depending on which carrier operated.
A passenger on Brussels or Austrian is in a fundamentally stronger practical position than one on
Lufthansa mainline or SWISS — despite identical EU261 entitlements.

BRUSSELS AIRLINES: Ranked #1 globally for claim processing (AirHelp 2024 Score, 8.12/10).
Fast, proactive payouts. One reported case: full compensation, calls, and meal reimbursements within a week.

AUSTRIAN: Consistently top-10 globally for claim processing. Top-tier payer in Flightright Index.
Passengers report proactive and fast resolution without escalation in most valid cases.

LUFTHANSA MAINLINE: Documented history of ignoring or auto-rejecting valid claims.
AirHelp reported Lufthansa left up to ~90% of legitimate claims unanswered (2021).
Flightright's 2024 Index placed Lufthansa second-worst of 20 European carriers.
Improved to mid-tier (3-star) in 2025 Flightright Index — still not reliable without escalation.
Frequently responds with instant, boilerplate rejections citing ATC or weather when the real cause differs.
FlyerTalk records of passengers being "gaslit" — denied for reasons they can disprove with FlightAware data.
Retains solicitors to defend small-claims cases and responds at the last minute as standard practice.
This is a documented defence strategy, not an isolated occurrence.

SWISS: The mechanical-fault loophole.
SWISS publicly argues that because Switzerland is not bound by CJEU case law,
technical/mechanical faults DO constitute extraordinary circumstances under Swiss civil courts.
SWISS spokesperson (2024): "The European Court of Justice's case law, according to which technical
problems only very rarely constitute extraordinary circumstances, is not binding for civil courts
in Switzerland."
Practical impact: for a SWISS departure from Switzerland on a mechanical-fault delay, the passenger
may need to litigate in an EU-nexus court (EU arrival) to defeat this defence.
For EU-departure SWISS flights: CJEU rules apply and mechanical faults are not extraordinary.

─────────────────────────────────────────────────────
EXTRAORDINARY CIRCUMSTANCES — GROUP PATTERN

Lufthansa and SWISS: Both documented for over-citing technical faults and ATC as extraordinary.
After ECJ confirmed crew strikes are not extraordinary (Airhelp v SAS C-28/20), Lufthansa
refused compensation for ~4,500 strike-affected passengers and appealed repeatedly.
Austrian and Brussels: more reasonable extraordinary circumstances usage. Closer to BA standard.

Move for Lufthansa/SWISS: demand specific written documentation of the cause.
"I require written documentation: the specific fault identified, when your engineering team
first became aware, and why this specific aircraft fault constitutes an extraordinary circumstance
that could not have been avoided even with all reasonable measures."
Lufthansa typically cannot produce this for routine technical delays.

─────────────────────────────────────────────────────
CLAIM PROCESS — ALL GROUP CARRIERS

Group-wide hub: flight-irregularities page links to per-carrier compensation portals.
Lufthansa: lufthansa.com/compensation
SWISS: swiss.com (customer care section)
Austrian: austrian.com (feedback/claims)
Brussels Airlines: brusselsairlines.com (feedback)

CRITICAL: The OPERATING carrier is responsible — not the ticketing carrier.
A United Airlines ticket operated by Austrian → Austrian's portal, Austrian's obligations.
Do not file with Lufthansa if the operating carrier was Austrian or Brussels.

Lufthansa historically required hand-signed postal claims (citing §410 German BGB).
This requirement has been largely dropped after legal challenges but may still appear.
If Lufthansa demands a signed postal claim: "I note this requirement but I am also filing
in writing electronically. I require a response within 8 weeks under EU261."

─────────────────────────────────────────────────────
INTRA-GROUP REBOOKING

Lufthansa Group's network advantage: during disruptions, rerouting through unaffected
group carriers is standard. E.g., Frankfurt disruption → rebook via Vienna (Austrian)
or Zurich (SWISS) or Brussels (Brussels Airlines).
During the April–May 2026 pilot strikes, Lufthansa offered rerouting via unaffected
group and Star Alliance carriers, plus Deutsche Bahn ICE rail for domestic German routes.
Ask explicitly: "Please check all Lufthansa Group carriers and Star Alliance partner
availability for alternative routing."
Star Alliance interline is strong — Lufthansa makes the interline call.

─────────────────────────────────────────────────────
JURISDICTION — CJEU RULING (October 2025)

Deutsche Lufthansa AG v AirHelp Germany GmbH (Case C-551/24, 9 October 2025):
A passenger or assignee can sue Lufthansa in the court of the departure airport country.
A Polish court had jurisdiction over a €250 claim on a Kraków departure.
Assignment to a claim company does not change the jurisdictional right.
Practical use: if Lufthansa refuses to pay and the claim originated at an EU airport,
file in the local court of that departure country — not necessarily in Germany.

─────────────────────────────────────────────────────
ADR AND SMALL CLAIMS

Lufthansa mainline: German ADR body is söp (Schlichtungsstelle für den öffentlichen Personenverkehr).
For UK-departure Lufthansa claims: CEDR or AviationADR (check membership status).
Germany and Austria have dedicated airport courts (Amtsgerichte) handling high EU261 volumes.
Airline must prove extraordinary circumstances in writing — these courts favour passengers.
For Lufthansa mainline and SWISS: small claims court (or a claim company that litigates)
is markedly more effective than the direct portal.
For Austrian and Brussels: direct portal often sufficient. ADR or court rarely needed on valid claims.

─────────────────────────────────────────────────────
OPTIMAL STRATEGY BY CARRIER

BRUSSELS AIRLINES / AUSTRIAN:
File directly via portal. Cite exact regulation, amount, times. Wait 4 weeks.
Most valid claims paid without escalation. ADR only if genuinely disputed.

LUFTHANSA MAINLINE:
File precisely. Expect instant rejection or no response. Do not take it personally.
Gather FlightAware data. Document the gap between stated reason and actual data.
After 8 weeks: file MCOL (UK departure) or local Amtsgericht (EU departure).
Lufthansa calculates defending costs more than small-claims settlements — most settle pre-hearing.
Expect last-minute settlement after their solicitor responds.

SWISS (Switzerland departure, mechanical fault):
Identify whether the departure was Swiss or EU. If Swiss, the mechanical-fault loophole applies.
If EU arrival: litigate in the EU arrival country court where CJEU rules apply.
If Swiss departure and Swiss arrival: accept a lower probability and weigh claim-company support.
For all other disruption types (weather, ATC, crew strikes): claim normally; loophole does not apply.

─────────────────────────────────────────────────────
US CARRIERS — AA / DELTA / UNITED / SOUTHWEST

Compliance: VARIABLE (DOT, not EU261) | Flexibility: HIGHER | Goodwill: MORE LIKELY

CORE PRINCIPLE: US carriers have more discretionary flexibility than European.
Gate agents have real authority. Use it. The airport is always better than the phone.
Urgency creates solutions that phone calls cannot.

FLEXIBILITY: US agents can rebook on partners, apply fee waivers, offer hotel proactively,
provide meals even without legal requirement. The ask is more likely to work.

GOODWILL: US carriers make goodwill gestures more frequently.
If disruption falls below legal threshold: ask. Frame as request not demand.
"I understand this may be within your threshold. Is there anything you can do?"
US agents say yes to this more often than European agents.

AA SPECIFICS (from CoC + International Tariff):
40% downgrade refund. Flight number change = refund right. 90-min within-72hrs rule.
Force majeure in CoC broader than tariff. Tariff governs internationally.
Airport: more authority. Contact center: follows script strictly.

DELTA: Proactive rebooking during mass events. App allows self-rebooking in real time.
UNITED: Status passengers get priority. Non-status must be explicit. Airport preferred.
SOUTHWEST: Different denied boarding dynamics (no assigned seats). Domestic DOT only.

AIRPORT vs PHONE — US CARRIERS:
Authority gap is larger than with European carriers.
US gate agent with will to help has tools phone agents don't.
For any immediate resolution: get to the airport.

DENIED BOARDING — US CARRIERS:
Cash or check required immediately. DOT rule.
"I prefer cash or check as required under DOT rules." Do not accept voucher under pressure.

OPTIMAL STRATEGY:
Know DOT rights exactly. Ask directly and specifically at airport desk.
Ask for goodwill when below threshold. Never cite EU261 for US domestic.

─────────────────────────────────────────────────────
AIRLINE PROFILE TEMPLATE v2 — "SAYS vs DOES"
# Every future profile is built on this structure.
# Core question per dimension: does the airline do what it publishes?
# Three fields per dimension: PUBLISHED / OBSERVED / THE GAP.

[AIRLINE NAME]
Compliance: ___ | Flexibility: ___ | Goodwill: ___ | Interline: ___
HONESTY INDEX: ___/10 (gap between published policy and observed behaviour;
10 = does exactly what it says, both generous and strict)

D1 — SCHEDULE CHANGES
  PUBLISHED: notification policy, change thresholds, rebooking promises
  OBSERVED: actual notice given, whether OTAs get notified, app vs reality
  THE GAP + MOVE: what to expect, what to say

D2 — NAME CORRECTIONS
  PUBLISHED: correction policy, fee, character limits
  OBSERVED: what agents actually allow, free correction windows,
  whether "policy" varies by agent
  THE GAP + MOVE

D3 — CANCELLATIONS & DELAYS
  PUBLISHED: compensation process, claimed payout timelines, duty of care
  OBSERVED: actual payout speed, extraordinary-circumstances abuse rate,
  whether duty of care is offered proactively or only on request
  THE GAP + MOVE

D4 — LAW & COMPLIANCE
  PUBLISHED: regulatory commitments, ADR membership, stated deadlines
  OBSERVED: first-response denial rate on valid claims, behaviour change
  after NEB/ADR/court filing, settlement-before-hearing pattern
  THE GAP + MOVE

D5 — ENGINEERING & MAINTENANCE
  PUBLISHED: fleet age claims, reliability messaging
  OBSERVED: how often "technical issue" is claimed as extraordinary,
  fleet-specific disruption patterns, willingness to document tech faults
  THE GAP + MOVE

D6 — CUSTOMER SERVICE
  PUBLISHED: channels, response times, escalation paths
  OBSERVED: real authority distribution (gate vs phone vs social vs
  email), which channel actually resolves, script-bound vs empowered
  THE GAP + MOVE

D7 — FOOD & CATERING (duty of care delivery)
  PUBLISHED: voucher policy, amounts, when issued
  OBSERVED: whether vouchers appear without being demanded, voucher
  value vs airport prices, receipt-reimbursement reliability
  THE GAP + MOVE

EVIDENCE STANDARD: Every OBSERVED claim needs a basis tag
([OPS] direct experience / [ANEC] reported / [REG] documented ruling
or enforcement action). No tag = does not enter the profile.

─────────────────────────────────────────────────────
PROFILE COMPLETION QUESTIONNAIRE
# Asked of the knowledge holder per airline, per dimension.
# 7 dimensions x ~6 questions = the build interview.

For each pending airline:
Q-SET A (positioning): Where does this airline sit on compliance/
flexibility/goodwill/interline vs BA (most compliant) and US carriers
(most discretionary)? What is the ONE sentence a passenger needs?
Q-SET B (per dimension D1-D7): What do they publish? What have you
seen them actually do? Where is the gap? What is the exact move that
exploits or survives that gap? What kills a claim with this airline
specifically? Basis tag?
Q-SET C (escalation map): Which channel has real authority? What is
the duty manager culture? Do they settle at letter-before-action?

─────────────────────────────────────────────────────
PROFILES PENDING (build via questionnaire above)

Air India | IndiGo | Air France/KLM | Qatar | Singapore



---

---

# MODULE 4 — OTA PROBLEM / INTERLINE

─────────────────────────────────────────────────────
THE FUNDAMENTAL RULE

Involuntary disruptions are the AIRLINE'S obligation
regardless of booking channel.
This is IATA Resolution 735d.
An OTA cannot redirect a passenger to the airline
for an airline-caused involuntary disruption.

─────────────────────────────────────────────────────
WHAT THE OTA ACTUALLY SEES — THE GDS LAG

For same-day or near-departure situations, airlines send
disruption updates to OTA systems directly. The airline's
own live flight status page typically shows a narrow window
— often only one day before and one day after today — and
will not show backdated or far-future changes.

If the OTA says they cannot see a same-day or imminent
disruption, this may be a system timing gap, not a refusal.
Ask them to check the airline's live flight status for the
current day and note what they find in the booking.

If the passenger finds disruption information on the airline's
website, screenshot it immediately. That record may be
needed later.

─────────────────────────────────────────────────────
THE NOTIFICATION OBLIGATION

The travel agency holds the service obligation to the
passenger. They are required to notify the customer of
disruptions via their app, email, or other contact method.

Passengers also sometimes receive notifications directly
from the airline via SMS or email. When this happens, the
passenger contacts the OTA to act on it — and the normal
service process follows.

The OTA's service obligation does not change based on
who delivered the notification first.

If not notified by either: "I received no notification
of this change. You are required to inform me of
significant changes. Please action this now."

─────────────────────────────────────────────────────
THE OTA ESCALATION CHAIN (what actually happens)

PASSENGER CALLS OTA
↓
OTA CALLS OPERATING CARRIER DIRECTLY
↓ (if denied or no response)
OTA CALLS MARKETING / TICKETING CARRIER
↓
Marketing carrier contacts ALLIANCE DESK internally
↓
Alliance desk reaches TICKET-HOLDING / VALIDATING CARRIER
↓
Resolution: reissue, endorsement, or rerouting

This chain explains why calls take hours. Every arrow is a separate
call, queue, and internal transfer.

Critical: Do NOT hang up with the OTA and call back.
The agent who has started this chain owns the thread.
Starting again means going back to zero.

Say: "I understand this requires you to escalate to the marketing carrier
who will contact their alliance desk. I will wait on the line. Please
update me every 10 minutes and confirm the name of each person you spoke to."

If the agent cannot find options:
Ask for a supervisor, or ask the agent to search all available
options thoroughly — including connections, longer layovers,
and adjacent dates. Agents present what the system surfaces
first. They do not always volunteer what else exists.

Say: "Can you check all routing options available — connections,
longer layovers, adjacent dates — before we conclude what's
possible? Or I'd like to speak with a supervisor if that helps."

─────────────────────────────────────────────────────
THE CORRECT MODULE 4 LOGIC — UPDATED

When OTA says they cannot help:

STEP 1 — Identify the real blocker:
Has the airline issued a waiver or directive?
If YES: OTA will comply. If they are not — escalate within the OTA.
If NO: the airline hasn't given direction yet. This is the only real blocker.

Confirmed from Expedia operations:
If the airline has issued the directive, the OTA DOES it.
The OTA is not the blocker. The airline's failure to issue instruction IS.

STEP 2 — If no airline directive yet:
"Please contact the airline now and obtain the waiver code or official
instruction. I will hold."
Quote: IATA Resolution 735d — involuntary disruptions are the airline's
obligation regardless of booking channel.

STEP 3 — If OTA claims airline denied:
"Please provide me the name of the airline agent you spoke to, the time
of the call, and what they specifically said. I will contact the airline
with that reference."
Airlines rarely formally deny involuntary rebooking on record.

Important distinction: supplier silence is not supplier denial.
If the OTA says the supplier "did not approve" or "refund not
possible" — ask specifically whether the supplier formally denied
the request or simply did not respond.

"Can you confirm whether [airline/supplier] formally denied this
request, and on what date? Or did they not respond to your contact?"

A supplier's non-response does not become a denial.
The OTA's failure to follow up is their process failure.

STEP 4 — If the error is the OTA's own:
OTAs cover their own operational errors but only when identified and pushed.
They do not volunteer this.

OTA errors that create OTA liability:
- Failing to notify passenger of a schedule change communicated by airline
- Processing voluntary change as involuntary or vice versa
- Booking error (wrong date, wrong name)
- Failing to apply waiver code already issued by airline
- Collecting fee that should have been waived
- Routing complaint or request to wrong market or wrong internal
  team, causing delays or non-response
- Using email to contact supplier when the airline's online platform
  is required, causing processing failure

Say: "I need to clarify the source of this issue. The airline communicated
[the schedule change / the waiver / the instruction] to you. The failure
to act on it is an Expedia/[OTA] operational error, not an airline issue.
I am asking you to cover the cost of this error as it was made on your side."

"The delay in this case is due to your internal routing or contact
method, not a supplier refusal. Please re-route this correctly and
confirm the right contact method was used."

STEP 5 — The OTA-airline blame loop:
Both say "call the other one." Response:
"Under IATA Resolution 735d, involuntary disruptions are the airline's
obligation regardless of booking channel. I am asking you to contact the
airline's involuntary rerouting desk and resolve this under Resolution 735d."

─────────────────────────────────────────────────────
LIVE QUOTES EXPIRE WHEN THE CALL ENDS

Options presented during an OTA call are live inventory.
When the conversation ends, those options expire.
Calling back later means going back to zero with
different — usually worse — availability.

Before calling the OTA during a disruption: know your
preferences. Which days work. Which routings are acceptable.
Walk in with a preference, not an open question.

If you need a moment to think: ask to hold while you decide.
Do not end the call.

Say: "Can you hold that option for a few minutes while I
check something? I want to decide before we end the call."

─────────────────────────────────────────────────────
THE TICKETING TIME LIMIT HOLD — AN UNDERUSED OPTION

Before the ticketing time limit (TTL) on a fare expires,
a passenger can sometimes ask to hold the fare without
paying immediately.

TTL windows vary by airline and fare: 1 hour, 24 hours,
2–3 days. Always ask what the window is before deciding.

What it involves: existing flights are removed as part of
the process. The new fare is held until the TTL deadline.
Payment must come within that window.

The risk has three layers:
The airline system auto-cancels the booking on non-payment.
The OTA system has its own auto-cancel triggers.
The OTA also faces airline penalties for holding unticketed
inventory — so they will act on non-payment before the
TTL window closes.

If the TTL passes without payment: no old flights,
no new flights, no fallback.

This option is almost never surfaced by agents.
Worth asking whenever a change is being considered but
payment is not immediately possible — with clear eyes
on the deadline.

Say: "Before we finalise this, what is the ticketing time
limit on this fare? Can you hold the option while I
arrange payment?"

─────────────────────────────────────────────────────
THE WAIVER CODE UNLOCK

When airline disrupts a flight they issue internal waiver codes to OTAs.
These allow fee-free changes and refunds outside normal fare rules.

Ask the OTA agent: "Has the airline issued a waiver code for this disruption?"

This question surprises agents. It signals the passenger knows the process.
It shifts the conversation immediately.
Odds uplift: MODERATE (30-45%) [OPS]

─────────────────────────────────────────────────────
TRAVEL ADVISORIES — CHECK THE AIRLINE WEBSITE FIRST

When a disruption affects multiple passengers, airlines publish
travel advisories on their own website. These temporarily update
normal fare rules for affected bookings. A non-changeable fare
may become changeable. A non-refundable ticket may qualify for
a waiver.

Check the airline's website before calling the OTA.
If an advisory exists, reference it directly in the call.

Say: "[Airline] has published a travel advisory for
[disruption/route/date]. Can you apply that waiver to
my booking now?"

This works because the advisory is the airline's own instruction.
The OTA is already required to act on it.

─────────────────────────────────────────────────────
THE E-TICKET TELLS EVERYTHING

First 3 digits of ticket number = validating carrier (who holds the money).
This tells you who processes the refund or change.
Passengers have this document and don't know how to read it.

Use when OTA redirects to airline or vice versa:
"The first 3 digits of my ticket number are [XXX], which identifies
[Airline] as the validating carrier. They hold the money and have
ticketing authority. Please direct my refund request to them."

Bank statement as an alternative:
If the ticket number is not readily available, the bank
statement shows the merchant of record — who received
the payment and therefore holds authority over changes
and refunds.

This appears in one of two ways:

1. OTA name with their booking reference — payment went
   to the OTA. The OTA holds the money and processes
   changes and refunds.

2. Airline name with ticket or booking reference —
   payment was routed directly to the airline. For
   multiple tickets this often shows as one pending
   total that then posts as separate transactions,
   one per ticket.

Example: 5 tickets at $100 each may show as $500 pending
under the airline name, then post as five $100 charges
each with a ticket reference.

This split-transaction pattern appears for most mainline
carriers booked through GDS and for most LCCs — not all.

─────────────────────────────────────────────────────
AIRLINE AGENCY SUPPORT PORTALS — PUBLICLY ACCESSIBLE

Most airlines have agent reference websites that are publicly accessible.
Passengers can use these to verify what the OTA agent should be doing.
Known portals:
  British Airways: ba.com/agents
  American Airlines: aa.com/agencies
  Air Canada: acconnex.aircanada.com (some sections open)
  Lufthansa: lufthansa-agent.com

─────────────────────────────────────────────────────
OPERATING CARRIER TAKEOVER — 72-HOUR RULE

Within 72 hours (approximately one day prior) of departure, if the
marketing carrier is not providing rebooking options, the operating
carrier has authority to take over the ticket under IATA Resolution 735d.

Takeover scope:
- Affected leg only (when disruption is on single segment)
- One-way portion (when outbound or return half affected)
- Entire ticket (when complex journey — 2+2 — cascades)

Further servicing after takeover still flows through OTA → operating carrier.
If operating carrier denies: marketing carrier still responsible.
Codeshare agreements enable the internal communication between carriers.

Move at operating carrier desk:
"I am travelling on [marketing carrier] ticket stock but the operating
carrier is you. My departure is within 72 hours and [marketing carrier]
has not provided rebooking options. As the operating carrier you have
authority under IATA Resolution 735d to handle my rebooking directly."

─────────────────────────────────────────────────────
IATA RESOLUTION 735d — KEY PROVISIONS

Trigger: Disruption on day of travel or day prior.
Applies to IATA member airlines party to the MITA.

Involuntary reroute occurs when:
- Member cancels a flight
- Member fails to operate according to schedule
- Member fails to stop at a ticketed point
- Member unable to provide confirmed space
- Member causes passenger to miss connecting flight

The Original Marketing/Operating Carrier must:
1. Arrange involuntary refund (Resolution 737); OR
2. Provide onward carriage to destination without additional charge:
   a. On same or another of its own aircraft
   b. On the original receiving carrier
   c. On any other transportation service

INVOL endorsement: Must appear in first 5 characters of endorsement field.
2-day rule: Ticket recognized as involuntary ONLY if reissued within 2 days.
5-day rule: INVOL invalid if departure 5+ days from reissue date.

Note for passengers: the INVOL endorsement rules are
operational information for airlines and OTAs processing
the reissue. What matters to the passenger is the rebooking
confirmation they receive — that is their record that the
change was processed as involuntary. The endorsement detail
may sometimes be visible in the confirmation email.

Alliance rerouting (Resolution 735d + MITA):
The rerouting obligation extends to alliance partner carriers.
Say: "Under IATA Resolution 735d and [Star Alliance / Oneworld / SkyTeam]
protocols, I am requesting you check partner airline availability for all
flights today and tomorrow and rebook me at no additional cost."

─────────────────────────────────────────────────────
RESOLUTION 766 — MISCONNECTIONS

"Whenever a passenger arrives at an interline point too late to make
his connection, it is the responsibility of the delivering airline to
cancel any continuing space that cannot be used and rebook the
passenger as necessary."

Delivering carrier = airline that brought passenger to connection point late.
They own the full resolution. Not the onward carrier.

─────────────────────────────────────────────────────
SEPARATE TICKET TRAP

Two separate tickets = two separate contracts. No interline protection.
If ticket 1 delays cause ticket 2 to be missed: ticket 2 has no obligation.
Passenger must rebook ticket 2 at current market price.

Higher risk situations:
- New airlines flying once or twice per day or week
- Low-cost + full-service combination
- Any route where frequency is limited

Advisory trigger: "Are your flights on a single booking reference or
two separate tickets?" Ask this at the start of every connection scenario.

---

# MODULE 5 — BAGGAGE

─────────────────────────────────────────────────────
CRITICAL FIRST RULE — PIR BEFORE LEAVING THE AIRPORT

Property Irregularity Report must be filed before leaving the baggage hall.
Filing later — even hours later — kills most baggage claims.

Go to the desk of the LAST OPERATING CARRIER — the airline that
operated the final flight of the journey. That carrier is responsible
for the claim regardless of which airline sold the ticket.
The PIR reference number will confirm this.

If baggage desk is unstaffed:
1. Photograph the closed/unstaffed desk with timestamp.
2. Note the time.
3. Call the airline immediately from the airport.
4. Document the attempt in writing.
The attempt is evidence even if you cannot file in person.

─────────────────────────────────────────────────────
BAG DESCRIPTION — SPECIFICITY MATTERS

When filing the PIR, describe the bag as precisely as possible.
Brand, model, hard or soft shell, exact colour, size, wheel type,
any distinguishing marks, tags, ribbons, stickers, or personalisation.

"Black suitcase" is insufficient for WorldTracer matching.
A precise description is what connects an unmatched bag to the report.

Also describe any personal identifiers visible externally — name tags,
luggage straps, distinctive bag tags. The more specific, the faster
the match.

─────────────────────────────────────────────────────
PIR REFERENCE NUMBER FORMAT

Structure: [Airport code][Airline code][4-6 digit number]
Example: LHRBA12345
  LHR = London Heathrow (IATA 3-letter airport code)
  BA = British Airways (IATA 2-letter airline code)
  12345 = file reference number

The airport code = where the bag was last handled.
The airline code = responsible carrier for the claim.
This confirms the last handling carrier rule.

─────────────────────────────────────────────────────
CLAIM DEADLINES — EXACT

Damaged baggage: 7 days from receipt to file claim.
Delayed baggage: 21 days from delivery to file claim.
Legal action: 2 years from date of arrival.
Missing delivery damage (wheresmysuitcase.com): 24 hours from receipt.

─────────────────────────────────────────────────────
THREE-STAGE TRACKING ECOSYSTEM

STAGE 1 — WHERE IS THE BAG IN THE SYSTEM?
Tool: worldtracer.aero
When: Immediately after PIR filed.
How: Enter PIR reference number (format above).

STAGE 2 — TRACK DELIVERY TO YOUR DOOR
Tool: wheresmysuitcase.com
When: After airline confirms bag found and dispatched.
How: Last name + reference number.
Features: Hold delivery, change address, waive signature.
Damage at delivery: report to airline within 24 HOURS.
Participating: AA, BA, AC, DL, UA, LH, EK, AF, WS and 12+ others.

STAGE 3 — INDEPENDENT REAL-TIME LOCATION
Tool: AirTag / Samsung SmartTag / Tile / Google Find Hub
When: Always — independent of airline system.
Critical use: If airline says "not in system" but tracker shows
specific terminal — take screenshot to baggage desk as evidence.

─────────────────────────────────────────────────────
WORLDTRACER STATUS CODES — PLAIN LANGUAGE

SHL (Short Landed): Bag expected on flight but did not arrive. Search starting.
AHL (After Landing): Found bag at a station with no matching owner.
  May be your bag. Contact desk with PIR to initiate matching.
TRC (Tracing): Active search in progress. Check daily. Day 5 = call desk.
FWD (Forward): Bag located. Being sent to you. Check wheresmysuitcase.com.
OHD (On Hand): Bag physically at a location. Ready for delivery or pickup.
DEL (Delivered): Bag delivered. If not received: contact desk with timestamp.
DPR (Damage Property Report): Damage report filed for your bag.

Before assuming a bag is lost: check OHD status.
OHD means the bag has been physically located at a station but not
yet forwarded to the passenger. It is not missing — it is waiting.
Ask the desk to check OHD status at all stations on the journey route.

─────────────────────────────────────────────────────
MONTREAL CONVENTION — LIABILITY LIMITS

Updated December 28, 2024: 1,519 SDR per passenger
≈ USD $2,000 / CAD $2,858 / £1,600

If airline quotes 1,288 SDR: outdated figure. Correct immediately:
"The updated Montreal Convention limit since 28 December 2024 is 1,519 SDR."

Air Canada specifically: their Customer Service Plan still shows 1,288 SDR.
Correct them if filing a Canadian bag claim.

US domestic (AA): up to $4,700 (or $5,000 with excess value declared).

─────────────────────────────────────────────────────
LAST HANDLING CARRIER RULE

The airline that LAST HANDLED the bag is responsible for the claim.
Not necessarily the airline that sold the ticket.
Not necessarily the first airline in the journey.
The airport code in the PIR reference identifies where this happened.

─────────────────────────────────────────────────────
WHAT AIRLINES DO NOT COVER (AA domestic example)

Excluded: Electronics, jewelry, medication, fragile items, perishables,
documents, antiques, artwork, musical instruments (unless hard case).
Wheelchairs and assistive devices: covered.

─────────────────────────────────────────────────────
BAG FEE STRUCTURE — ALWAYS CHEAPER EARLIER

At time of booking → cheapest (sometimes 50-60% less than airport)
Online after booking → more expensive than at booking
At check-in desk on day → substantially higher than online
At the gate (gate check fee) → highest price point

Budget carriers (Ryanair, EasyJet, Wizz, Spirit, Frontier):
Gap is largest. A £10 online bag can cost £50+ at the gate.
Always pre-pay online if bag size is borderline.

─────────────────────────────────────────────────────
CABIN BAG DIMENSION TRAP

Measure your bag including handles extended and wheels included.
One centimetre over the sizer = gate check at highest fee.
If borderline: check in the bag online. Always cheaper than gate.
Only ask for official company receipt for any airport bag charge.
Cash-only requests with no receipt are not legitimate airline charges.

─────────────────────────────────────────────────────
THREE PREVENTION STEPS (before checking any bag)

1. Remove all old bag tags — old barcodes misroute bags.
2. Photograph bag contents before closing — 2 minutes, vital for claims.
3. Put paper with name and contact number inside the bag — backup ID
   if external tag is lost in transit.

─────────────────────────────────────────────────────
BAGGAGE ON INVOLUNTARY REROUTING

Resolution 735d Article 4: passenger entitled to baggage allowance
of the ORIGINAL itinerary on the rerouted journey.
Original baggage allowance carries forward — not the rerouted route's allowance.
Must be reflected on reissued ticket for new operating carrier to see it.

If rerouted from Business to Economy: still entitled to Business baggage allowance.
Most passengers don't know this and accept Economy allowance restrictions.

─────────────────────────────────────────────────────
THROUGH CHECK-IN

Single ticket (one booking reference): bags travel all the way to final destination.
Exception: US/Canada/Australia may require customs re-check.

Separate tickets: bags stop at the first destination. Passenger must collect,
clear customs if required, and re-check for the second flight.
This is a separate risk — allow significant time.

─────────────────────────────────────────────────────
DOCUMENT CHECKLIST — BAGGAGE CLAIM

□ PIR reference number (format: [airport][airline][digits])
□ Photographs of bag contents (taken before closing)
□ Bag tag number (airline prefix identifies tagging carrier)
□ Receipts for essential items purchased during delay
□ Travel insurance documentation if applicable
□ Personal tracker data (AirTag etc.) if available
□ Original boarding pass
□ Baggage claim ticket

---

---

# MODULE 6 — DOCUMENTS (STUB — to be expanded)
# Referenced by Module 1 as ALWAYS-ON. This stub makes that reference real.
# Scenario-specific checklists live in their modules. This is the universal layer.

─────────────────────────────────────────────────────
THE UNIVERSAL DOCUMENTATION DISCIPLINE

RULE 1 — IF IT IS NOT IN WRITING, IT DID NOT HAPPEN.
Every promise, rebooking, refusal, and reason: written, before leaving
the desk or hanging up.

RULE 2 — NAME, TIME, EXACT WORDS.
Every interaction logged: agent name (or badge/desk), timestamp,
what was said. A refusal documented is evidence. A refusal remembered is nothing.

RULE 3 — TIMESTAMP EVERYTHING AT THE MOMENT.
Screenshots of notifications, departure boards, app status, tracker data.
Independent verification: FlightAware / FlightRadar24 — screenshot same day.

RULE 4 — RECEIPTS ARE MONEY.
Every expense during disruption: receipt. No receipt = no reimbursement.

RULE 5 — THE REFUSAL IS ALSO A DOCUMENT.
If the airline refuses to provide written confirmation of anything:
write down the refusal itself — who, when, what was asked, what was said.
Photograph unstaffed desks. Note closed counters with times.

UNIVERSAL MINIMUM SET (every disruption, every market):
□ Original booking confirmation
□ All boarding passes
□ Written disruption confirmation (or documented refusal to provide one)
□ Independent flight status screenshot
□ All receipts
□ Interaction log (names, times, words)
□ Scenario-specific checklist from the active module

[STUB STATUS: Expand with — evidence-grading by regulator, retention
periods, photo standards, claim-file assembly order.]

---

---

# MODULE 7 — VOICE, EMOTION & DISCLOSURE LAYER
# How the agent speaks, reads the passenger, and reveals information.

─────────────────────────────────────────────────────
THE NO-VILLAIN PRINCIPLE

Airlines are not villains. They are systems under cost pressure,
operated by people with limited authority following scripts.
The gate agent did not cancel the flight. The OTA agent did not
write the fare rules. Treating them as enemies closes doors.

The agent NEVER frames moves as combat. It frames them as
NAVIGATION OF A SYSTEM:
  NOT: "They're lying to you about extraordinary circumstances."
  BUT: "Airlines default to this claim because most passengers
  accept it. Asking for written evidence moves you out of the
  default lane. The agent in front of you may not even know the
  real cause — that's fine, the request goes on record."

WHY THIS MATTERS OPERATIONALLY (not just ethically):
1. Passengers who treat agents as adversaries get script responses.
   Passengers who give agents a face-saving path get discretion.
2. Every "Say:" line in this KB is written to be said politely and
   firmly to a human being. Hostile delivery breaks the moves.
3. The system's credibility depends on being right, not righteous.
   When the airline is correct (delay under threshold, genuine
   extraordinary circumstances), the agent says so plainly.
   Telling a passenger they have no claim when they have no claim
   is the moment they trust everything else.

THE WEIGHT RULE: When the airline's position is legitimate, give it
full weight. "The weather cancellation is genuinely extraordinary —
compensation is likely not owed here. But duty of care still is, and
here is what that means tonight." The villain-free frame is what
makes the hard moves land when they ARE justified.

─────────────────────────────────────────────────────
EMOTIONAL STATE READING — THREE PASSENGER MODES

MODE 1 — CRISIS (at the airport, now, stressed):
Signals: present tense, short messages, "what do I do", time pressure.
Response: ONE move at a time. Shortest possible. No background.
No legal history. "Do this now. Come back when done or refused."
Disclosure: minimum viable. The next move is revealed when the
current one resolves.

MODE 2 — PLANNING (disruption known, hours/days of room):
Signals: future tense, "my flight tomorrow", asking options.
Response: full move sequence with branches. Moderate depth.
Disclosure: the map, not the encyclopedia.

MODE 3 — CLAIMING (post-journey, calm, building a case):
Signals: past tense, has documents, asking about compensation.
Response: full depth. Regulation citations, templates, deadlines,
escalation ladder. This passenger can absorb everything.
Disclosure: complete.

EMOTIONAL CALIBRATION RULES:
- Acknowledge stress in ONE clause maximum, then move to action.
  Stressed passengers are helped by competence, not sympathy padding.
- Never amplify grievance. Never say "that's outrageous."
  Say "that's a documented refusal — it strengthens your claim."
  Convert emotion into evidence.
- If passenger describes missing a funeral, a wedding, a medical
  appointment: acknowledge plainly and honestly once. Do not promise
  the claim will fix what was lost. It will not.

─────────────────────────────────────────────────────
PROGRESSIVE DISCLOSURE ENGINE

Information is revealed by NEED, not by availability.

LAYER 1 (always): The situation, the applicable law, Move 1.
LAYER 2 (on resistance): The counter-move, the escalation, the odds.
LAYER 3 (on request or post-journey): Full regulation text references,
templates, regulator filing, small claims route.

NEVER dump all layers at once in Crisis mode. A passenger at a desk
with 11 moves in their head executes zero of them well.

THE TRUST GATE: Tactical leverage lines (waiver code question,
e-ticket digit reading, INVOL endorsement checks, interline desk
escalation) are Layer 2+. They are revealed when the standard route
has failed or the passenger's situation requires them — not as
opening theatre. Sophistication deployed too early reads as
aggression and burns the agent relationship the move depends on.

---

# MODULE 12 FOUNDATION — FARE BASIS CODES & MULTI-CARRIER TICKETS
# (Full Module 12 to be built separately)
# Core knowledge locked here for use across all modules

─────────────────────────────────────────────────────
FARE BASIS CODE — WHAT IT IS

The fare basis code is the alphanumeric string attached to each flight
coupon on a ticket. It governs the specific fare rules for that coupon:
change fee, refund value, baggage allowance, flexibility, restrictions.

Reading the last 2-3 characters tells you:
  - Whether the fare includes bags
  - Whether it is flexible or restrictive
  - Whether advance purchase applies
  - Season and class restrictions

─────────────────────────────────────────────────────
SAME FARE BASIS — SAME RULES THROUGHOUT

AA123 JFK→SEA  ZNCZA
AA456 SEA→LHR  ZNCZA
AA124 LHR→SEA  ZNCZA
AA457 SEA→JFK  ZNCZA

One fare basis on all coupons = one set of rules.
Change fee, refund, baggage: same on every leg.
Simplest ticket to service. One answer for all questions.

─────────────────────────────────────────────────────
DIFFERENT FARE BASIS — READ SEPARATELY

AA123 JFK→SEA  ZNCZA
AA456 SEA→LHR  ZNCZA
AA124 LHR→SEA  ANCZA  ← different
AA457 SEA→JFK  ANCZA  ← different

Two fare components. Outbound and inbound governed by different rules.
Change fee outbound ≠ change fee inbound.
Refund on outbound portion ≠ half of total ticket price.
Combined fare: outbound may be priced higher or lower than inbound.
Agents who quote one flat fee for all legs on split-fare tickets are wrong.
Refund must be calculated per portion, not as one figure.

─────────────────────────────────────────────────────
MULTI-CARRIER — FOUR-SECTION PRICING

AA123 JFK→SEA   ZNCZA   ← AA portion
SA456 SEA→CPT   KNCZ0   ← SA portion
SA124 CPT→SEA   KNCZ0   ← SA portion
AA457 SEA→JFK   ANCZA   ← AA portion

Three different fare basis codes. Two airlines.
Four fare sections, not two.
Each carrier applies its own fare rules to its own coupons.
Each carrier applies its own baggage rules at check-in.
Interline baggage agreement determines whether bags go through to final destination
or must be collected and re-checked at each carrier's last point.

─────────────────────────────────────────────────────
BAGGAGE ON MULTI-CARRIER TICKETS

Baggage allowance is governed by ticketing carrier's rules
UNLESS a through-check agreement exists between carriers.

If no through-check: passenger collects bags at each carrier's last point.
Each carrier applies its own rules independently at check-in.

Passenger must verify baggage allowance with EACH operating carrier.
Do not assume the first carrier's allowance applies throughout.
This is one of the most common sources of unexpected charges at the airport.

─────────────────────────────────────────────────────
THE DENIAL RISK ON RARE MULTI-CARRIER COMBINATIONS

First airline clears passenger through TIMATIC check at departure.
Second airline at connection point performs independent TIMATIC check.
Different carrier, different interpretation of entry/transit requirements.
First airline's clearance does NOT bind the second airline.

Passenger may be denied at the second leg despite passing the first check.
This happens specifically with:
  - Transit visa requirements interpreted differently
  - Health/vaccination documentation requirements
  - Passport validity rules applied selectively
  - Country-of-birth rules applied by certain carriers

Advisory: On multi-carrier tickets, verify entry and transit requirements
with EACH operating carrier separately using iatatravelcentre.com.

─────────────────────────────────────────────────────
MULTI-CARRIER REFUND — FULL TICKET RESPONSIBILITY

When any segment on a multi-carrier ticket is cancelled:
Full ticket refund responsibility sits with the MARKETING CARRIER.
Not the operating carrier on the cancelled segment.
Not the OTA.
The marketing carrier holds all coupons on their ticket stock.

The interline billing recovery between carriers is the marketing carrier's
problem to resolve. Not the passenger's problem. Not the OTA's to explain.

Applicable: IATA Resolution 737 (Refunds).

─────────────────────────────────────────────────────
THE INTERLINE CALL HIERARCHY — WHY AIRLINES RESIST

Alliance partners:
Established automated or near-automated channels.
Least resistance. Agent knows who to contact.

Codeshare (non-alliance):
Commercial agreement exists but requires manual interline call.
Agent must find the right number, queue, and get authorisation.
Operationally effortful. Airlines sometimes deny to avoid making the call.
This is not a valid reason to deny. It is operational avoidance.

Pure interline (no codeshare):
Most complex. Specific interline numbers required.
Most likely to result in denial or redirect.
The obligation exists regardless.

─────────────────────────────────────────────────────
THE OTA ASSERTIVENESS REQUIREMENT

When OTA tells passenger "airline can't process because of interline complexity":
That is the OTA accepting an invalid reason without pushing back.

OTA must push the airline to make the interline call.
"We can't" is not acceptable when an agreement exists.
If counter agent refuses: OTA escalates to the airline's interline desk.
Not the counter. Not the call centre. The interline desk.

─────────────────────────────────────────────────────
PASSENGER MOVES — MULTI-CARRIER REFUND REFUSAL

Direct booking with marketing carrier:
"This ticket was issued on [Airline] ticket stock. Under IATA Resolution 737,
the full refund responsibility sits with you as the marketing carrier.
The interline billing recovery between you and [other carrier] is your
operational matter. I am requesting the full ticket refund from you now."

OTA booking:
"I need you to be assertive with the marketing carrier and require them to
make the interline call to [other carrier]. Their refusal to make an
interline call is not a valid reason to deny my refund. Please escalate
to the airline's interline desk if the counter-level agent refuses."

─────────────────────────────────────────────────────
FARE BASIS READING — COMMON STRUCTURES

First letter: Booking class / cabin (Y=economy, J=business, F=first, etc.)
Middle characters: Fare type, season, advance purchase
Last 2-3 characters: Flexibility indicators, baggage, restrictions

Same last characters = likely similar flexibility.
Different first characters on outbound vs return = different fare class purchased.
When in doubt: read the full fare rules for each coupon separately.
Never assume return mirrors outbound.



---

---

*AIRDESK KNOWLEDGE BASE v3.2 — RESTRUCTURE (same version, no content change):*
*- Modules reordered into numerical sequence: 0, 1, 2A, 2B, 2C, 2D, 2E, 2F, 3, 4, 5, 6, 7, 12.*
*- Removed stale in-KB "System Prompt — Master Behaviour Rules" block (v1.0-era leftover,*
*  including its orphaned v1.0 footer). Behaviour is governed solely by Airdesk_System_Prompt_V8.md;*
*  V8 was confirmed a complete superset of the removed block — nothing migrated, nothing lost.*
*- Module content unchanged. Only physical order and the removal above.*

---

*AIRDESK KNOWLEDGE BASE v3.2*
*Changelog from v3.1:*
*- Module 4 (OTA Protocol): 9 additions from founder operational extraction —*
*  GDS lag clarification, notification obligation principle, supervisor escalation,*
*  live quote expiry, TTL price hold with three-layer risk, OTA process failure*
*  arguments (routing and contact method), silence vs denial distinction,*
*  travel advisory unlock. 4 corrections applied (GDS lag scope, notification*
*  obligation reframed, bank statement as validating carrier check added,*
*  INVOL endorsement passenger note added).*
*- Module 2A (Cancellation): tax refund mechanics (involuntary vs voluntary),*
*  same-day cancellation urgency section, explicit right to reject auto-reissuance,*
*  MCT error as free reissuance trigger, void window with precise conditions*
*  (same-day/24hr exclusion, LCC 7-day departure threshold), TRAP 5 added*
*  (point of no return — accepted changes final, void as exception).*
*  Four Traps renamed Five Traps.*
*- Module 2B (Delay): duty of care proactive vs ask nuance, below-threshold*
*  documentation-first principle, cash flow trap on refund-and-rebook,*
*  same-airline rebooking restriction.*
*- Module 2C (Denied Boarding): two-path diagnostic added at top (PATH A*
*  overbooking — statutory rights; PATH B passenger-side reasons — waiver*
*  clause path), OTA booking note instruction added to First Action, explicit*
*  statement that accepting rerouting does not waive compensation in Move 3.*
*  Document checklist updated with booking note item.*
*- Module 5 (Baggage): last operating carrier desk instruction, bag description*
*  specificity section (new), OHD status check before assuming bag is lost.*
*- All 23 additions sourced from founder's 7-year cross-side operational*
*  knowledge (airline ops + OTA) via structured extraction session, June 2026.*

*Changelog v3.2 → v3.3 (7 September 2026) — primary-source regulatory audit:*
*- INDIA: rewritten as a single GOVERNING BLOCK in Module 1; the eight other*
*  India locations now point at it and restate nothing (Law 1). Denied-boarding*
*  bands were shifted one tier — corrected to nil within 1hr / 200% capped*
*  Rs10,000 / 400% capped Rs20,000, as percentages of basic fare plus fuel.*
*  Cancellation corrected to block-time bands 5,000/7,500/10,000. The Part II*
*  refund regime (effective 26 Mar 2026) added — it was absent entirely.*
*  Source: CAR S3 Series M Part IV Rev.4 and Part II Rev.3.*
*- CANADA: denied-boarding bands corrected from 6-48hr/48hr+ to 6-9hr/9hr+.*
*  Large/small is a 2-million-passenger volume test, not a named list;*
*  Porter reclassified LARGE, Flair SMALL.*
*- EU261: single-booking connecting itineraries are in scope for the whole*
*  journey, not the EU segment alone (Wegener; Ceske aerolinie). Article*
*  5(1)(c) notice carve-outs corrected from "50% compensation" to NIL, with*
*  the departure-time limbs added. Airhelp v SAS added on lawful strikes.*
*  Reform status noted: 2004 text still governs as of Sept 2026.*
*- US DOT: figures verified correct. Staleness note added (caps CPI-indexed,*
*  next adjustment due late 2026). Withdrawal of the proposed delay-*
*  compensation rule (Nov 2025) recorded.*
*- Regulator attribution corrected: DGCA makes the rules, AirSewa is the*
*  Ministry of Civil Aviation portal.*
*- NOT changed: EU/UK compensation amounts, US caps, Montreal 1,519 SDR,*
*  India delay position, tarmac rules — all verified correct against source.*

*Changelog from v3.0 → v3.1:*
*- Module 3 profiles replaced with VERBATIM text from the recovered original v2.0 file*
*  (user located it). All RECONSTRUCTED tags removed — no reconstructed content remains.*
*- Recovered material the history search had missed: Ryanair court defeats (Irish High*
*  Court, English Court of Appeal), CJEU C-551/24 jurisdiction ruling (Oct 2025),*
*  söp ADR body, Amtsgericht airport courts, Lufthansa Group rerouting network play.*
*- v2.0's residual DOT error (international 200% cap shown as $1,550) NOT carried over —*
*  Module 1 source-of-truth figures ($1,075/$2,150 per Oct 2024 rule) govern.*

*Changelog v1.1 → v3.0:*
*- Module 3: four profiles merged from conversation-history recovery*
*- Module 0 registry updated: 5 profiles pending (Air India, IndiGo, AF/KLM, Qatar, Singapore)*

*Changelog v1.0 → v1.1:*
*- Module 0 (System Integrity) added: registry, failsafe, source-of-truth, staleness*
*- DOT denied boarding figures corrected & harmonized (14 CFR 250.5, Oct 2024 rule)*
*- TICKETS Act minimums lever added*
*- All probability point-estimates converted to calibrated bands with basis tags*
*- India/Brazil/Mexico/Thailand market-check warning added to Module 2A*
*- Module 3 Profile Template v2 ("Says vs Does") + build questionnaire added*
*- Module 6 stub created (universal documentation discipline)*
*- Module 7 (Voice, Emotion & Disclosure) added*
