import Fastify, { type FastifyInstance } from "fastify";
import { healthRoutes } from "./routes/health.js";
import { webhookRoutes } from "./routes/webhook.js";
import { adminRoutes } from "./routes/admin.js";

export function buildApp(): FastifyInstance {
  const app = Fastify({ logger: true });

  app.register(healthRoutes);
  app.register(webhookRoutes);
  app.register(adminRoutes);

  return app;
}
