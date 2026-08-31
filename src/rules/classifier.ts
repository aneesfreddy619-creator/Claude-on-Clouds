// Pure, deterministic rule-based classifier for Clinic Lead Desk V0.
// No LLM/model logic — see v0-implementation-decisions.md ("Model layer:
// None in V0; rule-based handling only") and Section 19 "Rules first."
// No I/O, no state: classifyMessage is a pure function of its input text.

export type EnquiryCategory =
  | "appointment_request"
  | "hours_location"
  | "service_information"
  | "published_pricing"
  | "existing_appointment"
  | "human_escalation";

// Groups the Section 6 human-escalation triggers into distinct, explainable
// reasons. Section 8's approved knowledge only defines three escalation
// reply texts (medical_or_urgent, complaint, human_request), so several of
// these reasons share a reply — see src/rules/approvedReplies.ts.
export type EscalationReason =
  | "medical_or_urgent"
  | "complaint"
  | "refund_dispute"
  | "privacy_or_legal"
  | "abusive_language"
  | "custom_quote_or_discount_or_guarantee"
  | "human_request"
  | "unclear_intent";

export interface ClassificationResult {
  category: EnquiryCategory;
  escalationReason: EscalationReason | null;
  /** Names which rule/keyword fired, for explainability and debugging. */
  matchedRule: string;
  languageHint: "hindi_english" | "english";
}

function normalize(text: string): string {
  return text.toLowerCase();
}

function firstMatch(normalizedText: string, terms: string[]): string | null {
  for (const term of terms) {
    if (normalizedText.includes(term)) return term;
  }
  return null;
}

// Section 6: "Symptoms, diagnosis requests, medical advice requests,
// medication, side effects, adverse events, emergency concerns,
// pregnancy-related suitability questions, lab reports, photographs, or
// treatment suitability."
const MEDICAL_OR_URGENT_TERMS = [
  "pregnant",
  "pregnancy",
  "side effect",
  "adverse",
  "emergency",
  "diagnos",
  "prescri",
  "medication",
  "medicine",
  "symptom",
  "redness",
  "swelling",
  "swollen",
  "rash",
  "allergic",
  "reaction",
  "bleeding",
  "infection",
  "lab report",
  "test result",
  "is it safe for me",
  "safe for me to",
  "suitable for me",
  "suitability",
  "will this cure",
  "will this treat my",
  "can i use this treatment while",
];

// Section 6: "Complaint, refund dispute, harassment, privacy/data request,
// legal threat, abusive language, or serious dissatisfaction." Split into
// sub-groups because each maps to a distinct escalation reason even though
// most share the same approved reply text.
const COMPLAINT_TERMS = ["complaint", "complain", "unhappy", "disappointed", "unsatisf", "bad experience", "worst service"];
const REFUND_TERMS = ["refund", "money back", "reimburse"];
const PRIVACY_OR_LEGAL_TERMS = ["privacy", "data request", "delete my data", "gdpr", "legal action", "lawyer", "sue you", "consumer court"];
const ABUSIVE_TERMS = ["idiot", "stupid", "useless bot", "shut up", "screw you"];

// Section 6: "A request for a custom quote, a discount, guaranteed
// outcome, or a treatment recommendation."
const CUSTOM_QUOTE_TERMS = [
  "discount",
  "cheaper",
  "best price",
  "lowest price",
  "guarantee",
  "guaranteed result",
  "100% result",
  "custom quote",
  "negotiate",
  "which treatment should i",
  "what treatment do i need",
  "recommend a treatment",
];

const HUMAN_REQUEST_TERMS = [
  "talk to a person",
  "speak to a person",
  "talk to someone",
  "speak to someone",
  "human agent",
  "real person",
  "speak to staff",
  "speak to reception",
  "talk to reception",
  "connect me to",
  "representative",
  "agent please",
];

const EXISTING_APPOINTMENT_TERMS = [
  "reschedule",
  "postpone",
  "cancel my appointment",
  "cancel appointment",
  "change my appointment",
  "change appointment",
  "my appointment",
  "confirm my appointment",
  "existing appointment",
  "already booked",
  "my booking",
];

const APPOINTMENT_REQUEST_TERMS = [
  "book an appointment",
  "book appointment",
  "want an appointment",
  "need an appointment",
  "i want an appointment",
  "schedule a consultation",
  "schedule an appointment",
  "consultation request",
  "want to book",
  "can i book",
  "appointment on",
  "appointment for",
  "want a consultation",
  "book a slot",
  "available slot",
];

const PUBLISHED_PRICING_TERMS = ["price", "fee", "fees", "cost", "charge", "charges", "how much", "₹", "rs.", "rate"];

const HOURS_LOCATION_TERMS = [
  "hours",
  "timing",
  "timings",
  "open",
  "close",
  "closed",
  "location",
  "address",
  "where are you",
  "directions",
  "which area",
  "branch",
];

const SERVICE_INFORMATION_TERMS = [
  "service",
  "services",
  "treatment",
  "treatments",
  "laser",
  "acne",
  "pigmentation",
  "peel",
  "hair reduction",
  "wellness",
  "do you offer",
  "do you provide",
  "what treatments",
];

// Common Devanagari range plus a small set of frequently romanized
// Hindi-English tokens, used only to *detect* Hindi-English phrasing (see
// src/rules/approvedReplies.ts for why we never invent a translated reply).
const DEVANAGARI_RANGE = /[ऀ-ॿ]/;
const ROMANIZED_HINDI_TOKENS = ["hai", "kya", "kaise", "chahiye", "kripya", "namaste", "aap", "mujhe", "kab", "kitna", "batao"];

function detectLanguageHint(normalizedText: string): "hindi_english" | "english" {
  if (DEVANAGARI_RANGE.test(normalizedText)) return "hindi_english";
  const words = normalizedText.split(/\s+/);
  const hasRomanizedHindi = words.some((word) => ROMANIZED_HINDI_TOKENS.includes(word));
  return hasRomanizedHindi ? "hindi_english" : "english";
}

export function classifyMessage(text: string): ClassificationResult {
  const normalizedText = normalize(text);
  const languageHint = detectLanguageHint(normalizedText);

  // 1. Medical / urgent / treatment-suitability — highest priority per
  // Section 7 "when in doubt: hand off to a human" and Section 19.
  const medicalMatch = firstMatch(normalizedText, MEDICAL_OR_URGENT_TERMS);
  if (medicalMatch) {
    return {
      category: "human_escalation",
      escalationReason: "medical_or_urgent",
      matchedRule: `medical_or_urgent_keyword:${medicalMatch}`,
      languageHint,
    };
  }

  // 2. Complaint / refund / privacy-legal / abusive-language, in that order.
  const complaintMatch = firstMatch(normalizedText, COMPLAINT_TERMS);
  if (complaintMatch) {
    return {
      category: "human_escalation",
      escalationReason: "complaint",
      matchedRule: `complaint_keyword:${complaintMatch}`,
      languageHint,
    };
  }

  const refundMatch = firstMatch(normalizedText, REFUND_TERMS);
  if (refundMatch) {
    return {
      category: "human_escalation",
      escalationReason: "refund_dispute",
      matchedRule: `refund_keyword:${refundMatch}`,
      languageHint,
    };
  }

  const privacyOrLegalMatch = firstMatch(normalizedText, PRIVACY_OR_LEGAL_TERMS);
  if (privacyOrLegalMatch) {
    return {
      category: "human_escalation",
      escalationReason: "privacy_or_legal",
      matchedRule: `privacy_or_legal_keyword:${privacyOrLegalMatch}`,
      languageHint,
    };
  }

  const abusiveMatch = firstMatch(normalizedText, ABUSIVE_TERMS);
  if (abusiveMatch) {
    return {
      category: "human_escalation",
      escalationReason: "abusive_language",
      matchedRule: `abusive_language_keyword:${abusiveMatch}`,
      languageHint,
    };
  }

  // 3. Custom quote / discount / guaranteed outcome / treatment recommendation.
  const customQuoteMatch = firstMatch(normalizedText, CUSTOM_QUOTE_TERMS);
  if (customQuoteMatch) {
    return {
      category: "human_escalation",
      escalationReason: "custom_quote_or_discount_or_guarantee",
      matchedRule: `custom_quote_keyword:${customQuoteMatch}`,
      languageHint,
    };
  }

  // 4. Explicit human-request phrases.
  const humanRequestMatch = firstMatch(normalizedText, HUMAN_REQUEST_TERMS);
  if (humanRequestMatch) {
    return {
      category: "human_escalation",
      escalationReason: "human_request",
      matchedRule: `human_request_keyword:${humanRequestMatch}`,
      languageHint,
    };
  }

  // 5. Existing appointment — checked before generic appointment_request so
  // "reschedule my appointment" isn't misread as a new booking request.
  const existingAppointmentMatch = firstMatch(normalizedText, EXISTING_APPOINTMENT_TERMS);
  if (existingAppointmentMatch) {
    return {
      category: "existing_appointment",
      escalationReason: null,
      matchedRule: `existing_appointment_keyword:${existingAppointmentMatch}`,
      languageHint,
    };
  }

  // 6. New appointment request.
  const appointmentRequestMatch = firstMatch(normalizedText, APPOINTMENT_REQUEST_TERMS);
  if (appointmentRequestMatch) {
    return {
      category: "appointment_request",
      escalationReason: null,
      matchedRule: `appointment_request_keyword:${appointmentRequestMatch}`,
      languageHint,
    };
  }

  // 7. Published pricing.
  const pricingMatch = firstMatch(normalizedText, PUBLISHED_PRICING_TERMS);
  if (pricingMatch) {
    return {
      category: "published_pricing",
      escalationReason: null,
      matchedRule: `published_pricing_keyword:${pricingMatch}`,
      languageHint,
    };
  }

  // 8. Hours / location.
  const hoursLocationMatch = firstMatch(normalizedText, HOURS_LOCATION_TERMS);
  if (hoursLocationMatch) {
    return {
      category: "hours_location",
      escalationReason: null,
      matchedRule: `hours_location_keyword:${hoursLocationMatch}`,
      languageHint,
    };
  }

  // 9. Service information.
  const serviceInformationMatch = firstMatch(normalizedText, SERVICE_INFORMATION_TERMS);
  if (serviceInformationMatch) {
    return {
      category: "service_information",
      escalationReason: null,
      matchedRule: `service_information_keyword:${serviceInformationMatch}`,
      languageHint,
    };
  }

  // 10. Fallback: nothing matched. Section 6 describes an "unclear intent
  // after one allowed clarification question" trigger, which implies a
  // clarification turn — that needs conversation-state tracking this
  // codebase doesn't have yet. Per Section 7 "when in doubt: hand off to a
  // human", V0 escalates immediately instead of asking a clarification
  // question. See the assumptions note in the task summary.
  return {
    category: "human_escalation",
    escalationReason: "unclear_intent",
    matchedRule: "fallback_unclear_intent",
    languageHint,
  };
}
