// Pure, deterministic rule-based extraction of appointment-request details
// for Clinic Lead Desk V0. No LLM/model logic — see v0-implementation-
// decisions.md ("Model layer: None in V0; rule-based handling only").
// Every function here is a pure function of its input text: no I/O, no
// state, and no invented values — a field is only ever returned when an
// explicit, low-ambiguity pattern matches; otherwise null.

// Common connector/filler words that can follow a name in a run-on
// sentence (e.g. "my name is Anjali Sharma and I want..."). The regex
// below captures up to 3 words greedily, so any of these appearing in the
// captured group means the name ends right before that word.
const NAME_STOPWORDS = new Set([
  "and",
  "is",
  "not",
  "sure",
  "unsure",
  "unknown",
  "na",
  "the",
  "i",
  "want",
  "would",
  "like",
  "for",
  "to",
  "in",
  "a",
  "an",
  "but",
  "so",
]);

// Only two explicit, low-ambiguity self-identification patterns.
// Deliberately does NOT match a broader "this is <name>" pattern — that
// produces false positives like "this is confusing" or "this is urgent."
const NAME_PATTERNS = [/\bmy name is\s+([a-z][a-z'-]*(?:\s+[a-z][a-z'-]*){0,2})/i, /\bname\s*[:\-]\s*([a-z][a-z'-]*(?:\s+[a-z][a-z'-]*){0,2})/i];

export function extractDisplayName(text: string): string | null {
  for (const pattern of NAME_PATTERNS) {
    const match = text.match(pattern);
    if (!match) continue;

    const rawWords = match[1].trim().split(/\s+/);
    const nameWords: string[] = [];
    for (const word of rawWords) {
      if (NAME_STOPWORDS.has(word.toLowerCase())) break;
      nameWords.push(word);
    }

    if (nameWords.length === 0) continue;
    const candidate = nameWords.join(" ");
    if (candidate.length > 40) continue;

    return candidate;
  }
  return null;
}

// Section 5 approved consultation categories, matched most-specific phrase
// first so overlapping terms (e.g. "hair") resolve to the right category.
// A lone generic word (e.g. "skin", "peel") is never enough to match —
// only these exact phrases, to keep precision high over recall.
const SERVICE_CATEGORY_RULES: Array<{ terms: string[]; category: string }> = [
  { terms: ["laser hair", "hair reduction"], category: "Laser hair-reduction consultation" },
  { terms: ["chemical peel", "chemical-peel"], category: "Chemical-peel consultation" },
  { terms: ["acne", "pigmentation"], category: "Acne and pigmentation consultation" },
  { terms: ["skin and hair"], category: "Skin and hair consultation" },
  { terms: ["wellness"], category: "Wellness consultation" },
];

export function extractRequestedServiceCategory(text: string): string | null {
  const normalized = text.toLowerCase();
  for (const rule of SERVICE_CATEGORY_RULES) {
    if (rule.terms.some((term) => normalized.includes(term))) return rule.category;
  }
  return null;
}

const DAY_NAMES = ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"];
const RELATIVE_DAY_WORDS = ["today", "tomorrow"];
const TIME_PATTERN = /\b([01]?\d)(:[0-5]\d)?\s?(am|pm)\b/i;

// Triggered by a day name, "today"/"tomorrow", or an explicit time
// pattern. When triggered, stores the ENTIRE trimmed original message
// verbatim — no parsing into a date, no reformatting, no guessing word
// boundaries. Intentionally coarse: safer to over-capture the whole
// message than to guess which substring is "the date part."
export function extractPreferredDateTime(text: string): string | null {
  const normalized = text.toLowerCase();
  const hasDayName = DAY_NAMES.some((day) => normalized.includes(day));
  const hasRelativeDay = RELATIVE_DAY_WORDS.some((word) => normalized.includes(word));
  const hasTimePattern = TIME_PATTERN.test(text);

  if (!hasDayName && !hasRelativeDay && !hasTimePattern) return null;

  const trimmed = text.trim();
  return trimmed.length > 0 ? trimmed : null;
}

export interface ExtractedAppointmentDetails {
  displayName: string | null;
  requestedServiceCategory: string | null;
  preferredDateTime: string | null;
}

export function extractAppointmentDetails(text: string): ExtractedAppointmentDetails {
  return {
    displayName: extractDisplayName(text),
    requestedServiceCategory: extractRequestedServiceCategory(text),
    preferredDateTime: extractPreferredDateTime(text),
  };
}
