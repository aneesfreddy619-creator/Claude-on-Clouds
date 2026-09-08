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
// invented information — three explicit rules over explicit facts.
//
// Deliberately pure: no database access, no I/O, no clock. Callers gather
// the facts; this decides. That keeps every rule unit-testable without a
// database, and keeps the decision auditable from its inputs alone.

import type { OpenEscalationStatus } from "./persistence.js";

// The full result vocabulary. Only BLOCKED, HUMAN_REQUIRED and VALID are
// reachable today; the rest are declared so later work extends this type
// rather than redefining it, and so a `switch` on the state is exhaustive
// from the start.
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
  // Deliberately NOT lead_status === "human_escalation". That status is
  // set by the classifier and means "this message needed a human", not "a
  // human has taken over". A lead never leaves it, so using it here would
  // silence the lead permanently with no way back.
  openEscalationStatus: OpenEscalationStatus;
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
// 3. An observed open escalation permits only the pending reply.
// 4. Otherwise the ordinary approved reply is permitted.
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

  // Human takeover. Checked against state BEFORE this message, so the
  // escalation reply that THIS message triggers still reaches the
  // customer — otherwise asking for a human is answered with silence.
  if (facts.openEscalationStatus === "open") {
    return { state: "HUMAN_REQUIRED", permittedReply: "pending_escalation", reason: "open_escalation" };
  }

  return { state: "VALID", permittedReply: "ordinary", reason: "no_restriction" };
}
