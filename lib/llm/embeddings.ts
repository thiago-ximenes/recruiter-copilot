// Camada de embeddings provider-agnostic (espelha lib/llm/index.ts).
// Hoje Gemini (free tier, sem cartão); trocar provider = 1 env var + 1 branch.

export const EMBEDDING_DIMENSIONS = 768;

const GEMINI_MODEL = "models/text-embedding-004";
const GEMINI_URL = "https://generativelanguage.googleapis.com/v1beta";

export function embeddingsEnabled(): boolean {
  const provider = process.env.EMBEDDING_PROVIDER ?? "gemini";
  if (provider === "gemini") return Boolean(process.env.GEMINI_API_KEY);
  return false;
}

async function embedGemini(texts: string[]): Promise<number[][]> {
  const key = process.env.GEMINI_API_KEY;
  if (!key) throw new Error("GEMINI_API_KEY ausente");

  const res = await fetch(`${GEMINI_URL}/${GEMINI_MODEL}:batchEmbedContents?key=${key}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      requests: texts.map((text) => ({
        model: GEMINI_MODEL,
        content: { parts: [{ text }] },
      })),
    }),
  });

  if (!res.ok) {
    throw new Error(`Gemini embeddings ${res.status}: ${await res.text()}`);
  }
  const data = (await res.json()) as { embeddings: { values: number[] }[] };
  return data.embeddings.map((e) => e.values);
}

export async function embedTexts(texts: string[]): Promise<number[][]> {
  if (texts.length === 0) return [];
  const provider = process.env.EMBEDDING_PROVIDER ?? "gemini";
  if (provider === "gemini") return embedGemini(texts);
  throw new Error(`Embedding provider não suportado: ${provider}`);
}

export async function embedText(text: string): Promise<number[]> {
  const [vec] = await embedTexts([text]);
  return vec;
}
