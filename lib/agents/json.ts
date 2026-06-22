// Extrai o primeiro objeto JSON de uma resposta de LLM (tolera cercas de código).
export function parseJson<T>(s: string): T {
  const cleaned = s.replace(/```json/gi, "").replace(/```/g, "").trim();
  const start = cleaned.indexOf("{");
  const end = cleaned.lastIndexOf("}");
  return JSON.parse(cleaned.slice(start, end + 1)) as T;
}
