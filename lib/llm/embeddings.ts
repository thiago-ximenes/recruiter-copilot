// Camada de embeddings provider-agnostic (espelha lib/llm/index.ts).
// Hoje Gemini (free tier, sem cartão); trocar provider = 1 env var + 1 branch.

export const EMBEDDING_DIMENSIONS = 768;

const GEMINI_MODEL = "models/gemini-embedding-001";
const GEMINI_URL = "https://generativelanguage.googleapis.com/v1beta";

export function embeddingsEnabled(): boolean {
  const provider = process.env.EMBEDDING_PROVIDER ?? "gemini";
  if (provider === "gemini") return Boolean(process.env.GEMINI_API_KEY);
  return false;
}

// MRL truncado (<3072) não vem unit-norm; normaliza pra cosseno ficar correto.
function normalize(v: number[]): number[] {
  const norm = Math.sqrt(v.reduce((acc, x) => acc + x * x, 0));
  return norm === 0 ? v : v.map((x) => x / norm);
}

async function embedGeminiOne(text: string, key: string): Promise<number[]> {
  const res = await fetch(`${GEMINI_URL}/${GEMINI_MODEL}:embedContent?key=${key}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model: GEMINI_MODEL,
      content: { parts: [{ text }] },
      outputDimensionality: EMBEDDING_DIMENSIONS,
    }),
  });
  if (!res.ok) {
    throw new Error(`Gemini embeddings ${res.status}: ${await res.text()}`);
  }
  const data = (await res.json()) as { embedding: { values: number[] } };
  return normalize(data.embedding.values);
}

async function embedGemini(texts: string[]): Promise<number[][]> {
  const key = process.env.GEMINI_API_KEY;
  if (!key) throw new Error("GEMINI_API_KEY ausente");
  const out: number[][] = [];
  for (const text of texts) out.push(await embedGeminiOne(text, key));
  return out;
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
