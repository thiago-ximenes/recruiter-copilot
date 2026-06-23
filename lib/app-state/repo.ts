import { eq } from "drizzle-orm";
import { db } from "@/db";
import { appState } from "@/db/schema";

// Throttle de notificação: retorna true no máximo 1x por cooldown pra uma chave.
// Evita spammar o Thiago quando o agente falha em rajada (ex.: DeepSeek sem saldo).
export async function claimNotification(key: string, cooldownMs: number): Promise<boolean> {
  const now = Date.now();
  const [row] = await db.select().from(appState).where(eq(appState.key, key));
  if (row?.value) {
    const last = Number(row.value);
    if (Number.isFinite(last) && now - last < cooldownMs) return false;
  }
  await db
    .insert(appState)
    .values({ key, value: String(now), updatedAt: new Date() })
    .onConflictDoUpdate({
      target: appState.key,
      set: { value: String(now), updatedAt: new Date() },
    });
  return true;
}
