// Pure STOP detection, per clinic-lead-desk-v0-product-instructions.md §23.2:
// "Match case-insensitively when the trimmed message text is exactly
// STOP." Deliberately separate from src/rules/classifier.ts — a STOP
// message must never be run through classification at all.
export function isStopMessage(text: string): boolean {
  return text.trim().toLowerCase() === "stop";
}
