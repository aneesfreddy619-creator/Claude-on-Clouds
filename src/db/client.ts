import postgres from "postgres";
import { drizzle } from "drizzle-orm/postgres-js";
import { env } from "../config/env.js";

const queryClient = postgres(env.databaseUrl);

export const db = drizzle(queryClient);
