import type { FastifyInstance } from "fastify";

export async function adminRoutes(app: FastifyInstance): Promise<void> {
  // TODO: protect all /admin routes with basic authentication using
  // ADMIN_BASIC_AUTH_USER / ADMIN_BASIC_AUTH_PASSWORD, per Section 13
  // "Security requirements" and the locked implementation decision
  // ("Admin protection: Basic password protection").

  // Placeholder inspection route. Real lead/message/escalation queries and
  // test-lead deletion are implemented in a later build-order step
  // (v0-implementation-decisions.md, step 7).
  app.get("/admin", async () => {
    return { status: "admin scaffold placeholder" };
  });
}
