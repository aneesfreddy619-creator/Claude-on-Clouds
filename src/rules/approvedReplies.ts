// Approved reply text — copied EXACTLY from
// clinic-lead-desk-v0-product-instructions.md Sections 8 ("Approved
// knowledge") and 9 ("Reply patterns"). No paraphrasing, no rewriting, no
// translation, no added variants. If a reply needs to change, change the
// product instructions first, then copy the new text here verbatim.

import type { ClassificationResult, EnquiryCategory } from "./classifier.js";

type NonEscalationCategory = Exclude<EnquiryCategory, "human_escalation">;

// Section 9, "Reply patterns", plus Section 8's faq.reschedule (Section 9
// has no separate bubble for existing_appointment).
export const NON_ESCALATION_REPLIES: Record<NonEscalationCategory, string> = {
  appointment_request:
    "Hello! I can help you request a consultation. Please share your name, the service or concern category you want to discuss, and your preferred date/time. The reception team will check availability and confirm it.",
  published_pricing:
    "The consultation fee is ₹800. Final treatment plans and costs are discussed by the clinic team after assessment. Would you like to request a consultation?",
  service_information:
    "We offer consultations for acne and pigmentation, skin and hair concerns, laser hair reduction, chemical peels, and wellness services. For personalised medical guidance, the clinic team will need to assist you. Would you like to request a consultation?",
  hours_location:
    "Our Gurugram Demo Branch is open Monday–Saturday, 10:00–19:00. The address is Demo address only — Gurugram. Would you like to request an appointment?",
  existing_appointment:
    "I can pass your request to the reception team. Please share the name used for the booking and your preferred new date/time.",
};

// Section 8/9's three escalation reply texts.
export const ESCALATION_REPLIES = {
  medicalOrUrgent:
    "I’m unable to provide medical guidance on WhatsApp. I’m notifying the clinic team so they can assist you. If this is an emergency, please contact local emergency services or seek urgent medical care.",
  complaint: "I’m sorry to hear that. I’m notifying the clinic team so they can review this and contact you directly.",
  humanRequest: "I’m notifying the reception team. They will assist you as soon as possible during clinic hours.",
};

// Section 12 "Required action: reply, call, review complaint, or clinical
// team review."
export type RequiredAction = "reply" | "call" | "review complaint" | "clinical team review";

export interface ApprovedReplySelection {
  text: string;
  requiredAction: RequiredAction;
}

// Maps a classification to its approved reply text and Section 12 required
// action. Section 8 defines only three escalation reply texts, so several
// EscalationReason values intentionally share one: refund/privacy/abuse all
// use the "complaint" text (Section 6 groups them with complaint), and
// custom-quote/unclear-intent use the general "human_request"
// acknowledgment, since no more specific approved text exists for them.
export function selectApprovedReply(classification: ClassificationResult): ApprovedReplySelection {
  if (classification.category !== "human_escalation") {
    return {
      text: NON_ESCALATION_REPLIES[classification.category],
      requiredAction: "reply",
    };
  }

  switch (classification.escalationReason) {
    case "medical_or_urgent":
      return { text: ESCALATION_REPLIES.medicalOrUrgent, requiredAction: "clinical team review" };
    case "complaint":
    case "refund_dispute":
    case "privacy_or_legal":
    case "abusive_language":
      return { text: ESCALATION_REPLIES.complaint, requiredAction: "review complaint" };
    case "human_request":
    case "custom_quote_or_discount_or_guarantee":
    case "unclear_intent":
    default:
      return { text: ESCALATION_REPLIES.humanRequest, requiredAction: "reply" };
  }
}
