// Sessão de admin via cookie assinado (HMAC-SHA256). Web Crypto -> roda no Node
// e no edge (middleware). Sem ADMIN_PASSWORD/SECRET, a auth fica desligada (dev).

export const ADMIN_COOKIE = "rc_admin";
const PAYLOAD = "rc-admin-session-v1";

export function authConfigured(): boolean {
  return Boolean(process.env.ADMIN_PASSWORD && process.env.ADMIN_SESSION_SECRET);
}

async function hmacHex(secret: string, value: string): Promise<string> {
  const enc = new TextEncoder();
  const key = await crypto.subtle.importKey(
    "raw",
    enc.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const sig = await crypto.subtle.sign("HMAC", key, enc.encode(value));
  return Array.from(new Uint8Array(sig))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

export async function sessionToken(): Promise<string> {
  const secret = process.env.ADMIN_SESSION_SECRET;
  if (!secret) throw new Error("ADMIN_SESSION_SECRET ausente");
  return hmacHex(secret, PAYLOAD);
}

function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

export async function isValidToken(token?: string): Promise<boolean> {
  if (!authConfigured()) return true;
  if (!token) return false;
  return timingSafeEqual(token, await sessionToken());
}
