# V0 Operational Clarifications

## Purpose

This file resolves V0 operational details that need explicit rules so future work remains consistent.

This file is inside locked V0 scope. It does not expand the product scope.

The main source-of-truth files remain:
- `clinic-lead-desk-v0-product-instructions.md`
- `v0-implementation-decisions.md`

## 1. Unclear intent

The product instructions mention escalation after one allowed clarification question.

For the current V0 implementation, until conversation-state tracking is explicitly built:

- If an inbound message does not match a supported safe administrative category, classify it immediately as `human_escalation`.
- Set `escalation_reason = unclear_intent`.
- Do not implement a clarification-turn workflow yet.
- Use only the approved `human_request` acknowledgment.
- Revisit this only when multi-turn conversation state is explicitly added.

## 2. STOP and opt-out

For current V0, treat `STOP` as follows:

- Match case-insensitively when the trimmed message text is exactly `STOP`.
- Set `lead.opted_out = true`.
- Update `lead.updated_at` and `lead.last_inbound_at`.
- Store the inbound STOP message in `message_log`.
- Do not send an automated reply to STOP.
- Do not run automated classification, reply, appointment, or escalation handling for that STOP message.
- Do not automatically clear `opted_out` if the person messages again later.
- Only a human staff action may re-enable automation.

## 3. Escalation actions

When a message is classified as `human_escalation`, use these required-action defaults:

- `medical_or_urgent` -> `clinical team review`
- `complaint` -> `review complaint`
- `refund_dispute` -> `review complaint`
- `privacy_or_legal` -> `review complaint`
- `abusive_language` -> `review complaint`
- `human_request` -> `reply`
- `custom_quote_or_discount_or_guarantee` -> `reply`
- `unclear_intent` -> `reply`

For V0, do not automatically assign `call`. A callback decision is staff-controlled.

## 4. Escalation replies

Use only the already-approved escalation replies:

- `medical_or_urgent` -> approved `medical_or_urgent` reply
- `complaint` -> approved `complaint` reply
- `refund_dispute` -> approved `complaint` reply
- `privacy_or_legal` -> approved `complaint` reply
- `abusive_language` -> approved `complaint` reply
- `human_request` -> approved `human_request` reply
- `custom_quote_or_discount_or_guarantee` -> approved `human_request` reply
- `unclear_intent` -> approved `human_request` reply

Do not create, translate, rewrite, or add new escalation reply text unless the product instructions are updated first.

## 5. Lead status rules

For V0 automation:

- A newly created lead starts as `new`.
- A safe non-escalation administrative message may move a lead from `new` to `acknowledged`.
- An `appointment_request` sets `lead_status = appointment_requested`.
- A `human_escalation` sets `lead_status = human_escalation`.
- Automation must not reopen a `closed` lead unless the new message is itself a `human_escalation`.
- Automation must not clear or downgrade an existing `human_escalation`.
- Automation must not downgrade staff-controlled statuses such as `qualified` or `staff_assigned`.
- Automation does not set `information_captured`, `qualified`, `staff_assigned`, or `closed`.

## 6. New or existing leads

For V0:

- Set `is_new_or_existing = new` when a lead is created for a phone number not already stored.
- Set `is_new_or_existing = existing` when a lead already exists for that phone number.
- Use `unknown` only when a manual admin action, migration, or import creates ambiguity.
- Do not infer this field from treatment history, booking history, or any clinical relationship.

## 7. Hindi-English messages

For V0:

- Hindi-English detection may be used for logging only.
- Automated replies must remain the approved English text exactly as written.
- Do not create Hindi, Hindi-English, translated, or paraphrased reply variants unless those are explicitly added to approved knowledge.

## 8. Current implementation status

Implemented or in progress:
- Backend scaffold and environment configuration
- Database schema and migrations
- Webhook verification
- Signature verification
- Duplicate protection
- Rule-based classification
- Approved reply selection
- Lead persistence
- Inbound message persistence

Still pending:
- STOP and opt-out implementation
- Escalation row creation
- Actual WhatsApp reply sending
- Admin inspection endpoint or view
- Appointment missing-detail collection
- Meta test-number connection
- End-to-end V0 acceptance testing
