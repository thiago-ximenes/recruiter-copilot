import "dotenv/config";
import { saveNewVersion } from "../lib/prompts/repo";
import { PROMPT_SEEDS } from "../lib/prompts/defaults";

// Aplica o conteúdo atual de um prompt (defaults.ts) como nova versão ativa no banco.
// Uso: npx tsx scripts/sync-prompt.ts <key>
async function main() {
  const key = process.argv[2];
  const seed = PROMPT_SEEDS.find((s) => s.key === key);
  if (!seed) {
    console.error(`key não encontrada em PROMPT_SEEDS: ${key}`);
    process.exit(1);
  }
  await saveNewVersion(key, seed.content, "sync de defaults.ts");
  console.log(`✓ nova versão ativa de "${key}"`);
  process.exit(0);
}

main().catch((e) => {
  console.error("FALHOU:", e.message);
  process.exit(1);
});
