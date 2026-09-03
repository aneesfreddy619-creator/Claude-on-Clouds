import { buildApp } from "./app.js";
import { env } from "./config/env.js";
import { logger } from "./lib/logger.js";

const app = buildApp();

// Boot-time config visibility. src/config/env.ts intentionally defaults every
// variable to "" rather than throwing, so the process can start before all
// values are supplied — which also means a misconfigured deploy looks
// perfectly healthy (/health returns 200) right up until a request needs the
// missing value. This line makes that state visible at startup instead of
// leaving it to be inferred from a downstream failure.
//
// Deliberately logs ONLY variable names and present/absent booleans — never a
// value, never a prefix, never a length. It does not validate or fail closed;
// startup behaviour is unchanged.
function logConfigPresence(): void {
  logger.info("config_loaded", {
    DATABASE_URL: Boolean(env.databaseUrl),
    WHATSAPP_VERIFY_TOKEN: Boolean(env.whatsapp.verifyToken),
    WHATSAPP_APP_SECRET: Boolean(env.whatsapp.appSecret),
    WHATSAPP_ACCESS_TOKEN: Boolean(env.whatsapp.accessToken),
    WHATSAPP_PHONE_NUMBER_ID: Boolean(env.whatsapp.phoneNumberId),
    ADMIN_BASIC_AUTH_USER: Boolean(env.admin.basicAuthUser),
    ADMIN_BASIC_AUTH_PASSWORD: Boolean(env.admin.basicAuthPassword),
  });
}

app
  .listen({ port: env.port, host: "0.0.0.0" })
  .then((address) => {
    logger.info("server_started", { address });
    logConfigPresence();
  })
  .catch((error) => {
    logger.error("server_start_failed", { error: String(error) });
    process.exit(1);
  });
