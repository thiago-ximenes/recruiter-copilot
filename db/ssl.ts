// Postgres gerenciado (Supabase/Neon) usa cadeia de cert não-confiável pelo Node.
// O objeto `ssl` do Pool não vence o `sslmode` que já vem na connection string, então
// normalizamos a própria URL para `sslmode=no-verify` (node-postgres -> rejectUnauthorized:false).
// Local (docker) não usa SSL e fica intocado.
export function normalizePgUrl(connectionString?: string): string | undefined {
  if (!connectionString) return connectionString;
  if (/localhost|127\.0\.0\.1/.test(connectionString)) return connectionString;
  if (/sslmode=disable/.test(connectionString)) return connectionString;

  const [base, query = ""] = connectionString.split("?");
  const params = new URLSearchParams(query);
  params.set("sslmode", "no-verify");
  return `${base}?${params.toString()}`;
}
