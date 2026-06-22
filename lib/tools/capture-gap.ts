import { generateText } from "ai";
import { getModel } from "@/lib/llm";
import { parseJson } from "@/lib/agents/json";
import { getActivePromptContent } from "@/lib/prompts/repo";
import { createGap, type Gap } from "@/lib/gaps/repo";

// Tool capture_gap: detecta quando o agente não soube responder por falta de fato
// na base e registra a lacuna pro Thiago se preparar. Não dispara em recusa de segurança.
export async function captureGap(
  question: string,
  answer: string,
  roleContext: string,
  lang: string,
): Promise<Gap | null> {
  const prompt = await getActivePromptContent("gap.detector");
  const res = await generateText({
    model: getModel("fast"),
    system: prompt,
    prompt: `PERGUNTA:\n"""${question}"""\n\nRESPOSTA:\n"""${answer}"""`,
  });

  let verdict: { isGap?: boolean; question?: string; reason?: string };
  try {
    verdict = parseJson(res.text);
  } catch {
    return null;
  }
  if (!verdict.isGap) return null;

  return createGap({
    question: verdict.question?.trim() || question,
    reason: verdict.reason ?? null,
    roleContext: roleContext || null,
    lang,
  });
}
