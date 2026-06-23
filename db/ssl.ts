import type { PoolConfig } from "pg";

// Postgres gerenciado (Supabase/Neon) exige SSL com cadeia não-confiável pelo Node.
// Local (docker) não usa SSL. Decide pela connection string.
export function sslFor(connectionString?: string): PoolConfig["ssl"] {
  if (!connectionString) return undefined;
  if (/localhost|127\.0\.0\.1/.test(connectionString)) return undefined;
  if (/sslmode=disable/.test(connectionString)) return undefined;
  return { rejectUnauthorized: false };
}
