// Notifica o Thiago (Telegram). Env-gated: sem token/chat configurado, é no-op
// (não derruba o fluxo de lead). Trocar de canal = 1 branch aqui.

export function notifyEnabled(): boolean {
  return Boolean(process.env.TELEGRAM_BOT_TOKEN && process.env.TELEGRAM_CHAT_ID);
}

export async function notifyThiago(text: string): Promise<boolean> {
  if (!notifyEnabled()) return false;
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;
  try {
    const res = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ chat_id: chatId, text, parse_mode: "HTML" }),
    });
    if (!res.ok) {
      console.warn(`[notify] Telegram ${res.status}: ${await res.text()}`);
      return false;
    }
    return true;
  } catch (e) {
    console.warn(`[notify] falha ao notificar: ${(e as Error).message}`);
    return false;
  }
}
