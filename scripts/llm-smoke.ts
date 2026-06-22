import "dotenv/config";
import { generateText } from "ai";
import { getModel } from "../lib/llm";

// Healthcheck do provider de LLM. Rodar: npx tsx scripts/llm-smoke.ts
async function main() {
  const { text, usage } = await generateText({
    model: getModel("fast"),
    prompt: 'Responda apenas com a palavra "ok".',
  });
  console.log("resposta:", text.trim());
  console.log("tokens:", usage);
  process.exit(0);
}

main().catch((e) => {
  console.error("FALHOU:", e.message);
  process.exit(1);
});
