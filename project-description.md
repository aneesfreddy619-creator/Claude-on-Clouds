# WhatsApp Lead Recovery and Booking System

Clinic Lead Desk V0 is a safe WhatsApp front-desk test system for a fictional Delhi-NCR aesthetic dermatology and premium wellness clinic.

It captures inbound WhatsApp enquiries, creates or updates lead records, sends only approved administrative replies, collects missing booking details when appropriate, routes sensitive or unclear cases to a human, and logs messages, statuses, and escalation reasons.

This project is locked to a rule-based V0 test shell on a Meta WhatsApp Cloud API test number. It is not a production medical assistant and must not use real patient or clinic data.

**Status: V0 is complete as of 2026-09-05.** A real WhatsApp message produced an approved reply observed in WhatsApp, satisfying the definition of done. Nine of the ten acceptance rows were proven live; the tenth (duplicate webhook) is proven by automated test only, as Meta will not redeliver a message on demand.

## Future direction (gate met, still not adopted)

The longer-term intent is a reusable WhatsApp front-desk and case-intake shell serving several business types from one engine plus per-business approved content packs — helping a person identify their case type, collect the facts that case requires, receive an approved answer or checklist, and reach the right human next step.

It stays deterministic and rule-based: **no LLM or AI, ever.** Approved content packs, a two-layer truth model with pre-send rule validation, and human escalation whenever uncertain.

This direction was gated behind Clinic Lead Desk V0 achieving its first real end-to-end WhatsApp outcome. That outcome happened on 2026-09-05, so the gate is met — but nothing has been adopted. Taking the name **WhatsApp Front-Desk Shell**, restructuring the knowledge base, and any code or schema change are each now unblocked and each still needs its own explicit approval. Until one is given, this direction changes nothing. The design decisions are recorded in `v0-implementation-decisions.md`; where they conflict with the clinic instructions, the clinic instructions win.
