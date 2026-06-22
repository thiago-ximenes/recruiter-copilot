import "dotenv/config";
import { EMBEDDING_DIMENSIONS, embedText, embeddingsEnabled } from "../lib/llm/embeddings";

// Healthcheck do provider de embeddings.
async function main() {
  console.log("embeddingsEnabled:", embeddingsEnabled());
  const vec = await embedText("Engenheiro de software backend e IA.");
  console.log(`dimensões: ${vec.length} (esperado ${EMBEDDING_DIMENSIONS})`);
  console.log("amostra:", vec.slice(0, 4));
  process.exit(0);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
