import { Pool } from "pg";
import { drizzle } from "drizzle-orm/node-postgres";
import * as schema from "./schema";

const globalForDb = globalThis as unknown as { pool?: Pool };

// Aceita DATABASE_URL (Neon/local) ou POSTGRES_URL (integração Supabase na Vercel).
const connectionString = process.env.DATABASE_URL ?? process.env.POSTGRES_URL;

const pool = globalForDb.pool ?? new Pool({ connectionString });

if (process.env.NODE_ENV !== "production") globalForDb.pool = pool;

export const db = drizzle(pool, { schema });
export { schema };
