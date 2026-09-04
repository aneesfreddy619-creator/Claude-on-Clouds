# WhatsApp Lead Recovery and Booking System

Clinic Lead Desk V0 is a safe WhatsApp front-desk test system for a fictional Delhi-NCR aesthetic dermatology and premium wellness clinic.

It captures inbound WhatsApp enquiries, creates or updates lead records, sends only approved administrative replies, collects missing booking details when appropriate, routes sensitive or unclear cases to a human, and logs messages, statuses, and escalation reasons.

This project is locked to a rule-based V0 test shell on a Meta WhatsApp Cloud API test number. It is not a production medical assistant and must not use real patient or clinic data.

## Future direction (gated, not active)

The longer-term intent is a reusable WhatsApp front-desk and case-intake shell serving several business types from one engine plus per-business approved content packs — helping a person identify their case type, collect the facts that case requires, receive an approved answer or checklist, and reach the right human next step.

It stays deterministic and rule-based: **no LLM or AI, ever.** Approved content packs, a two-layer truth model with pre-send rule validation, and human escalation whenever uncertain.

This direction changes nothing today. Adopting the name **WhatsApp Front-Desk Shell**, any knowledge restructure, and all code or schema changes are gated behind Clinic Lead Desk V0 achieving its first real end-to-end WhatsApp outcome. The design decisions are recorded in `v0-implementation-decisions.md`; where they conflict with the clinic instructions, the clinic instructions win.
