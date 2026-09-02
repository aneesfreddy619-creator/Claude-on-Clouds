import { timingSafeEqual } from "node:crypto";
import type { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import { desc, eq } from "drizzle-orm";
import { env } from "../config/env.js";
import { logger } from "../lib/logger.js";
import { db } from "../db/client.js";
import { leads } from "../db/schema/leads.js";
import { messageLog } from "../db/schema/messageLog.js";
import { escalations } from "../db/schema/escalations.js";
import { deleteLeadAndHistory } from "../services/persistence.js";

// Admin inspection page for Clinic Lead Desk V0 (Section 13 "Simple admin
// page or API endpoint"). Read-only except for one action: deleting a test
// lead and its history (Section 13 "Provide a clear deletion function for
// a test lead and its message history"). No edit/assignment actions, no
// search/filter/export, per the locked V0 scope. Protected by basic
// password protection using ADMIN_BASIC_AUTH_USER / ADMIN_BASIC_AUTH_PASSWORD
// (env vars only), matching the locked implementation decision ("Admin
// protection: Basic password protection") — the delete route below reuses
// the exact same auth check as the read view, so it never weakens it.
const ADMIN_ROW_LIMIT = 50;

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function timingSafeEqualStrings(a: string, b: string): boolean {
  const bufferA = Buffer.from(a, "utf8");
  const bufferB = Buffer.from(b, "utf8");
  if (bufferA.length !== bufferB.length) return false;
  return timingSafeEqual(bufferA, bufferB);
}

// Fails closed: if either credential env var is unset, no request can be
// authorized, rather than silently allowing unauthenticated access.
function isAuthorized(request: FastifyRequest): boolean {
  if (!env.admin.basicAuthUser || !env.admin.basicAuthPassword) return false;

  const header = request.headers.authorization;
  if (!header || !header.startsWith("Basic ")) return false;

  const decoded = Buffer.from(header.slice("Basic ".length), "base64").toString("utf8");
  const separatorIndex = decoded.indexOf(":");
  if (separatorIndex === -1) return false;

  const user = decoded.slice(0, separatorIndex);
  const password = decoded.slice(separatorIndex + 1);

  return timingSafeEqualStrings(user, env.admin.basicAuthUser) && timingSafeEqualStrings(password, env.admin.basicAuthPassword);
}

export interface SerializedError {
  name: string;
  message: string;
  code?: string;
  cause?: SerializedError;
}

// Drizzle wraps every driver-level failure in a DrizzleQueryError whose own
// .message is only "Failed query: ...\nparams: ..." — the actual
// PostgreSQL/driver error (the real reason, and for real SQL errors the
// SQLSTATE via .code) lives on .cause, one level down. This walks that
// chain (depth-bounded, so a pathological/circular cause can't loop
// forever) so admin_data_fetch_failed logs the real cause instead of just
// Drizzle's generic wrapper message. Only structural error fields (name,
// message, code) are captured — never the query text, its bound
// parameters, DATABASE_URL, request headers, or any other secret.
export function serializeError(error: unknown, depth = 3): SerializedError {
  if (!(error instanceof Error)) {
    return { name: "UnknownError", message: String(error) };
  }

  const serialized: SerializedError = { name: error.name, message: error.message };

  const code = (error as { code?: unknown }).code;
  if (typeof code === "string") serialized.code = code;

  const cause = (error as { cause?: unknown }).cause;
  if (depth > 0 && cause instanceof Error) {
    serialized.cause = serializeError(cause, depth - 1);
  }

  return serialized;
}

function escapeHtml(value: string): string {
  return value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#39;");
}

function cell(value: unknown): string {
  if (value === null || value === undefined || value === "") return "—";
  return escapeHtml(String(value));
}

interface LeadRow {
  leadId: string;
  whatsappPhone: string;
  displayName: string | null;
  leadStatus: string;
  primaryCategory: string | null;
  escalationReason: string | null;
  optedOut: boolean;
  lastInboundAt: Date | null;
  lastOutboundAt: Date | null;
  updatedAt: Date;
}

interface MessageRow {
  messageId: string;
  whatsappPhone: string | null;
  direction: string;
  text: string;
  classification: string | null;
  status: string;
  receivedOrSentAt: Date;
}

interface EscalationRow {
  escalationId: string;
  whatsappPhone: string | null;
  displayName: string | null;
  lastUserMessage: string;
  escalationReason: string;
  requiredAction: string;
  status: string;
  createdAt: Date;
}

interface StatusMessage {
  kind: "success" | "error";
  text: string;
}

// Maps the tiny query-flag vocabulary POST /admin/leads/:leadId/delete
// redirects with back into a plain status line — no session/flash storage,
// just a query param read once on the next GET, matching the page's
// existing "minimal, practical, not polished" style.
function statusMessageFromQuery(query: { deleted?: string; error?: string }): StatusMessage | null {
  if (query.deleted === "1") return { kind: "success", text: "Lead and its message/escalation history were deleted." };
  if (query.error === "delete_failed") return { kind: "error", text: "Deletion failed. Check server logs for details." };
  if (query.error === "invalid_lead_id") return { kind: "error", text: "Invalid lead id — nothing was deleted." };
  return null;
}

function renderAdminPage(data: {
  leads: LeadRow[];
  messages: MessageRow[];
  escalations: EscalationRow[];
  statusMessage: StatusMessage | null;
}): string {
  const leadRows = data.leads
    .map(
      (lead) => `<tr>
        <td>${cell(lead.whatsappPhone)}</td>
        <td>${cell(lead.displayName)}</td>
        <td>${cell(lead.leadStatus)}</td>
        <td>${cell(lead.primaryCategory)}</td>
        <td>${cell(lead.escalationReason)}</td>
        <td>${lead.optedOut ? "yes" : "no"}</td>
        <td>${cell(lead.lastInboundAt?.toISOString())}</td>
        <td>${cell(lead.lastOutboundAt?.toISOString())}</td>
        <td>${cell(lead.updatedAt.toISOString())}</td>
        <td>
          <form method="POST" action="/admin/leads/${encodeURIComponent(lead.leadId)}/delete" style="margin:0;" onsubmit="return confirm('Delete this test lead and all its messages/escalations? This cannot be undone.');">
            <button type="submit">Delete</button>
          </form>
        </td>
      </tr>`
    )
    .join("\n");

  const messageRows = data.messages
    .map(
      (message) => `<tr>
        <td>${cell(message.whatsappPhone)}</td>
        <td>${cell(message.direction)}</td>
        <td>${cell(message.text)}</td>
        <td>${cell(message.classification)}</td>
        <td>${cell(message.status)}</td>
        <td>${cell(message.receivedOrSentAt.toISOString())}</td>
      </tr>`
    )
    .join("\n");

  const escalationRows = data.escalations
    .map(
      (escalation) => `<tr>
        <td>${cell(escalation.whatsappPhone)}</td>
        <td>${cell(escalation.displayName)}</td>
        <td>${cell(escalation.lastUserMessage)}</td>
        <td>${cell(escalation.escalationReason)}</td>
        <td>${cell(escalation.requiredAction)}</td>
        <td>${cell(escalation.status)}</td>
        <td>${cell(escalation.createdAt.toISOString())}</td>
      </tr>`
    )
    .join("\n");

  const statusHtml = data.statusMessage
    ? `<p class="status ${data.statusMessage.kind}">${escapeHtml(data.statusMessage.text)}</p>`
    : "";

  return `<!doctype html>
<html>
<head>
<meta charset="utf-8">
<title>Clinic Lead Desk V0 — Admin</title>
<style>
  body { font-family: system-ui, sans-serif; margin: 1.5rem; color: #1a1a1a; }
  h1 { font-size: 1.25rem; }
  h2 { font-size: 1rem; margin-top: 2rem; }
  table { border-collapse: collapse; width: 100%; margin-top: 0.5rem; font-size: 0.85rem; }
  th, td { border: 1px solid #ccc; padding: 4px 8px; text-align: left; vertical-align: top; }
  th { background: #f0f0f0; }
  .note { color: #555; font-size: 0.85rem; }
  .status { padding: 6px 10px; border-radius: 4px; font-size: 0.9rem; }
  .status.success { background: #e6f4ea; color: #1e7e34; }
  .status.error { background: #fdecea; color: #b02a37; }
</style>
</head>
<body>
<h1>Clinic Lead Desk V0 — Admin</h1>
<p class="note">Test shell only. Showing the most recent ${ADMIN_ROW_LIMIT} rows per table. Deleting a lead removes its message and escalation history and cannot be undone.</p>
${statusHtml}

<h2>Leads (${data.leads.length})</h2>
<table>
<tr><th>Phone</th><th>Display name</th><th>Status</th><th>Category</th><th>Escalation reason</th><th>Opted out</th><th>Last inbound</th><th>Last outbound</th><th>Updated</th><th>Actions</th></tr>
${leadRows || '<tr><td colspan="10">No leads yet.</td></tr>'}
</table>

<h2>Recent messages (${data.messages.length})</h2>
<table>
<tr><th>Phone</th><th>Direction</th><th>Text</th><th>Classification</th><th>Status</th><th>Timestamp</th></tr>
${messageRows || '<tr><td colspan="6">No messages yet.</td></tr>'}
</table>

<h2>Escalations (${data.escalations.length})</h2>
<table>
<tr><th>Phone</th><th>Display name</th><th>Last user message</th><th>Escalation reason</th><th>Required action</th><th>Status</th><th>Created</th></tr>
${escalationRows || '<tr><td colspan="7">No escalations yet.</td></tr>'}
</table>
</body>
</html>`;
}

export async function adminRoutes(app: FastifyInstance): Promise<void> {
  app.get(
    "/admin",
    async (request: FastifyRequest<{ Querystring: { deleted?: string; error?: string } }>, reply: FastifyReply) => {
      if (!isAuthorized(request)) {
        logger.warn("admin_access_denied", { ip: request.ip });
        return reply.status(401).header("WWW-Authenticate", 'Basic realm="Clinic Lead Desk Admin"').send("Unauthorized");
      }

      try {
        const [leadRows, messageRows, escalationRows] = await Promise.all([
          db.select().from(leads).orderBy(desc(leads.updatedAt)).limit(ADMIN_ROW_LIMIT),
          db
            .select({
              messageId: messageLog.messageId,
              whatsappPhone: leads.whatsappPhone,
              direction: messageLog.direction,
              text: messageLog.text,
              classification: messageLog.classification,
              status: messageLog.status,
              receivedOrSentAt: messageLog.receivedOrSentAt,
            })
            .from(messageLog)
            .leftJoin(leads, eq(messageLog.leadId, leads.leadId))
            .orderBy(desc(messageLog.receivedOrSentAt))
            .limit(ADMIN_ROW_LIMIT),
          db
            .select({
              escalationId: escalations.escalationId,
              whatsappPhone: leads.whatsappPhone,
              displayName: leads.displayName,
              lastUserMessage: escalations.lastUserMessage,
              escalationReason: escalations.escalationReason,
              requiredAction: escalations.requiredAction,
              status: escalations.status,
              createdAt: escalations.createdAt,
            })
            .from(escalations)
            .leftJoin(leads, eq(escalations.leadId, leads.leadId))
            .orderBy(desc(escalations.createdAt))
            .limit(ADMIN_ROW_LIMIT),
        ]);

        logger.info("admin_page_viewed", {
          leadCount: leadRows.length,
          messageCount: messageRows.length,
          escalationCount: escalationRows.length,
        });

        return reply.type("text/html").send(
          renderAdminPage({
            leads: leadRows,
            messages: messageRows,
            escalations: escalationRows,
            statusMessage: statusMessageFromQuery(request.query),
          })
        );
      } catch (error) {
        logger.error("admin_data_fetch_failed", { error: serializeError(error) });
        return reply.status(500).send("Failed to load admin data");
      }
    }
  );

  // Deletes a test lead and its message/escalation history (Section 13).
  // Reuses the same isAuthorized() check as GET /admin — no separate,
  // weaker auth path for the destructive action.
  app.post("/admin/leads/:leadId/delete", async (request: FastifyRequest<{ Params: { leadId: string } }>, reply: FastifyReply) => {
    if (!isAuthorized(request)) {
      logger.warn("admin_access_denied", { ip: request.ip });
      return reply.status(401).header("WWW-Authenticate", 'Basic realm="Clinic Lead Desk Admin"').send("Unauthorized");
    }

    const { leadId } = request.params;
    if (!UUID_PATTERN.test(leadId)) {
      logger.warn("admin_lead_deletion_rejected", { leadId, reason: "invalid_lead_id" });
      return reply.redirect("/admin?error=invalid_lead_id");
    }

    const success = await deleteLeadAndHistory(leadId);
    return reply.redirect(success ? "/admin?deleted=1" : "/admin?error=delete_failed");
  });
}
