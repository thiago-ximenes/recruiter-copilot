import { createDeepSeek } from "@ai-sdk/deepseek";
import type { LanguageModel } from "ai";

export type Tier = "fast" | "smart";

// Camada provider-agnostic. Hoje DeepSeek; trocar de provider = 1 env var + 1 branch.
export function getModel(_tier: Tier = "smart"): LanguageModel {
  const provider = process.env.LLM_PROVIDER ?? "deepseek";

  if (provider === "deepseek") {
    if (!process.env.DEEPSEEK_API_KEY) throw new Error("DEEPSEEK_API_KEY ausente");
    const deepseek = createDeepSeek({ apiKey: process.env.DEEPSEEK_API_KEY });
    // deepseek-chat (V3) cobre guard/router/refino/resposta com bom custo.
    return deepseek("deepseek-chat");
  }

  throw new Error(`LLM provider não suportado: ${provider}`);
}
