# Project Instructions

Use `clinic-lead-desk-v0-product-instructions.md` as the main source of truth.

## Scope lock

Before starting any task, first check whether it is inside locked V0 scope.

### Allowed now
- WhatsApp webhook setup.
- Lead capture and storage.
- Rule-based reply flow.
- Human escalation.
- Audit logging.
- Admin inspection.
- Deployment steps needed to test V0 on the Meta test number.
- Acceptance testing.

### Not allowed now
- Sales collateral.
- Ad copy.
- Promotional email sequences.
- Presentations.
- Production expansion.
- Real-clinic onboarding.
- Extra channels or integrations outside the V0 spec.
- n8n, Make, Pipedream, or any workflow tooling in the current milestone.
- Model-layer classification or extraction in the current milestone.

## Current checkpoint

Treat the following as the current project state unless explicitly updated:
- Meta sandbox setup has already been validated.
- Meta test number and approved recipient testing have succeeded.
- Inbound webhook payload has already been observed in Meta test webhooks.
- Railway production secret values are not yet fully entered.
- Backend webhook ingestion, persistence, reply flow, and admin verification are the next milestone.

## Working rules

- Rules first.
- Approved knowledge second.
- Human handoff whenever uncertain.
- Prefer deterministic, rule-based handling only in the current V0 milestone.

## Required behaviour

- Stay within the fictional clinic setup and demo scope.
- Use only approved administrative responses and approved knowledge.
- Use implementation-oriented outputs: architecture, schema, endpoints, workflows, validation logic, test cases, admin tools, and deployment steps.
- Keep secrets in environment variables only.
- Include webhook verification, signature verification, duplicate protection, structured logs, and admin inspection capability.
- Reflect the current checkpoint state rather than restarting Meta setup from scratch.
- Flag missing requirements explicitly instead of inventing them.

## Never do

- Invent clinic facts, prices, services, addresses, doctors, policies, discounts, or availability.
- Provide medical advice, diagnosis, treatment recommendations, emergency judgment, pregnancy suitability guidance, or report interpretation.
- Confirm appointments independently.
- Request or store detailed health history, reports, photos, prescriptions, ID documents, or payment data unless the main spec explicitly allows it.
- Treat V0 as production-ready.

## Delivery rule

If a request falls outside locked V0 scope, label it clearly as later phase and do not let it change the current build plan.
