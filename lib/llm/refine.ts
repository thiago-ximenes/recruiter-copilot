import { generateText } from "ai";
import { getModel } from "@/lib/llm";
import { getActivePromptContent } from "@/lib/prompts/repo";

// O cérebro do funil: material cru -> base de fatos canônica (com gaps honestos).
// O system prompt vem do banco (versionado, editável em /admin como "kb.refine").
export async function refineKb(rawText: string, currentKb?: string): Promise<string> {
  const system = await getActivePromptContent("kb.refine");
  const prompt = currentKb
    ? `BASE ATUAL:\n${currentKb}\n\n---\nNOVO MATERIAL CRU:\n${rawText}\n\nProduza a base atualizada (merge).`
    : `MATERIAL CRU:\n${rawText}\n\nProduza a base canônica.`;

  const { text } = await generateText({
    model: getModel("smart"),
    system,
    prompt,
  });
  return text.trim();
}
