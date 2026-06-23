import "dotenv/config";
import { Pool } from "pg";
import { drizzle } from "drizzle-orm/node-postgres";
import { migrate } from "drizzle-orm/node-postgres/migrator";
import { normalizePgUrl } from "../db/ssl";

// Auto-migration de deploy. Tenta conexão direta (melhor pra DDL) e cai pro
// pooler se a direta não for alcançável (ex.: IPv6 no build da Vercel).
async function main() {
  const candidates = [
    process.env.DATABASE_URL,
    process.env.POSTGRES_URL_NON_POOLING,
    process.env.POSTGRES_URL,
  ].filter((u): u is string => Boolean(u));

  if (candidates.length === 0) throw new Error("nenhuma connection string disponível");

  let lastErr: unknown;
  for (const raw of candidates) {
    const pool = new Pool({
      connectionString: normalizePgUrl(raw),
      connectionTimeoutMillis: 15_000,
    });
    try {
      await migrate(drizzle(pool), { migrationsFolder: "db/migrations" });
      await pool.end();
      console.log("✓ migrations aplicadas");
      return;
    } catch (e) {
      lastErr = e;
      await pool.end().catch(() => {});
      console.warn(`migrate falhou nesta conexão: ${(e as Error).message}`);
    }
  }
  throw lastErr;
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
