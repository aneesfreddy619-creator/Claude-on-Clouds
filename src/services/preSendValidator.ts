// Pre-send validator.
//
// Sits between approved-reply selection and sending. It never selects,
// composes, or alters reply text — it only decides whether the already
// selected approved reply may be sent, by checking live state that the
// classifier never sees.
//
// This is the deterministic core in miniature: an approved reply exists
// (possibility), live state may forbid sending it (admissibility), and
// this function decides applicability. No model, no inference, no
// invented information — a fixed, ordered set of rules over explicit facts.
//
// Deliberately pure: no database access, no I/O, no clock. Callers gather
// the facts; this decides. That keeps every rule unit-testable without a
// database, and keeps the decision auditable from its inputs alone.

import type { OpenEscalationStatus } from "./persistence.js";

// The full result vocabulary. BLOCKED, INCOMPLETE, CONTRADICTORY,
// HUMAN_REQUIRED and VALID are all reachable today. NOT_APPLICABLE is
// declared but unreachable, so later work extends this type rather than
// redefining it, and a `switch` on the state is exhaustive from the start.
export type ValidationState =
  | "VALID"
  | "INCOMPLETE"
  | "BLOCKED"
  | "CONTRADICTORY"
  | "NOT_APPLICABLE"
  | "HUMAN_REQUIRED";

// Which approved reply this decision permits. Never reply *text* — the
// validator selects nothing and composes nothing; it names which
// already-approved reply the caller may send.
export type PermittedReply = "ordinary" | "pending_escalation" | "none";

export interface PreSendFacts {
  // The lead has opted out of automated messages (STOP, or staff action).
  optedOut: boolean;
  // Escalation state as it was BEFORE the current message's own escalation
  // row was created. Tri-state on purpose — see OpenEscalationStatus in
  // src/services/persistence.ts.
  //
  // Deliberately NOT the same thing as lead_status === "human_escalation".
  // That status is set by the classifier and means "this message needed a
  // human"; the open escalation row is what means "a human owns this case".
  // Staff resolving the last open escalation returns the lead to
  // acknowledged (see resolveEscalation in ./persistence.ts), so the two can
  // and do move independently — which is exactly why both are checked.
  openEscalationStatus: OpenEscalationStatus;

  // The lead's status after this message was applied.
  leadStatus: string;

  // Whether an escalation row was SUCCESSFULLY written for THIS message.
  // Deterministic and never unknown: false for every non-escalating
  // message, false when creation was attempted and failed, true only on a
  // confirmed write.
  //
  // This is what separates the healthy escalating message (lead just became
  // human_escalation, pre-message lookup was none, row was written) from a
  // lead stranded in human_escalation with no escalation row at all.
  escalationRecordedThisMessage: boolean;
}

export interface ValidationResult {
  state: ValidationState;
  permittedReply: PermittedReply;
  // Which rule decided, for the audit trail. Never shown to a customer.
  reason: string;
}

// Decides which approved reply, if any, may be sent.
//
// Rules are evaluated in a fixed order and the first match wins. The order
// is part of the contract:
//
// 1. Opt-out outranks everything — it is the customer's own standing
//    instruction, so an opted-out lead receives nothing at all, not even
//    the pending-escalation reply.
// 2. Unknown escalation state outranks a send. We could not establish
//    whether a human owns this case, so we send nothing rather than
//    guessing in either direction.
// 3. A contradiction between the lead row and the escalations table
//    permits nothing.
// 4. An observed open escalation permits only the pending reply.
// 5. Otherwise the ordinary approved reply is permitted.
export function validateBeforeSend(facts: PreSendFacts): ValidationResult {
  if (facts.optedOut) {
    return { state: "BLOCKED", permittedReply: "none", reason: "opted_out" };
  }

  // Escalation state could not be established. This is INCOMPLETE, not
  // BLOCKED: BLOCKED asserts that an explicit rule prohibited the action,
  // and no rule fired here — a required fact simply could not be read.
  // Calling it BLOCKED would record a restriction that was never observed.
  //
  // The pending reply is withheld too. It asserts that a message is
  // awaiting review, and that is exactly what we failed to establish.
  // Missing information stays missing; it is never substituted with a
  // convenient value.
  if (facts.openEscalationStatus === "escalation_state_unavailable") {
    return { state: "INCOMPLETE", permittedReply: "none", reason: "escalation_state_unavailable" };
  }

  // Contradiction: the lead row says a human owns this case, but no open
  // escalation exists to support that — and this message did not just
  // record one. Two authoritative sources disagree and nothing here can
  // resolve which is right, so we send nothing.
  //
  // Reachable when an escalation row could not be written while the lead
  // had already been moved to human_escalation. Without this rule the lead
  // is stranded: the status is sticky (computeLeadStatus never downgrades
  // it), the lookup keeps reporting none, and ordinary automation would
  // resume for a customer who was told a human would take over.
  //
  // The healthy escalating message is NOT caught here: its lookup also
  // reports none, but its escalation row was written this turn, so
  // escalationRecordedThisMessage is true and it falls through to VALID.
  if (
    facts.leadStatus === "human_escalation" &&
    facts.openEscalationStatus === "none" &&
    !facts.escalationRecordedThisMessage
  ) {
    return { state: "CONTRADICTORY", permittedReply: "none", reason: "escalated_lead_without_open_escalation" };
  }

  // Human takeover. Checked against state BEFORE this message, so the
  // escalation reply that THIS message triggers still reaches the
  // customer — otherwise asking for a human is answered with silence.
  if (facts.openEscalationStatus === "open") {
    return { state: "HUMAN_REQUIRED", permittedReply: "pending_escalation", reason: "open_escalation" };
  }

  return { state: "VALID", permittedReply: "ordinary", reason: "no_restriction" };
}
