import { buildApp } from "./app.js";
import { env } from "./config/env.js";
import { logger } from "./lib/logger.js";

const app = buildApp();

app
  .listen({ port: env.port, host: "0.0.0.0" })
  .then((address) => {
    logger.info("server_started", { address });
  })
  .catch((error) => {
    logger.error("server_start_failed", { error: String(error) });
    process.exit(1);
  });
