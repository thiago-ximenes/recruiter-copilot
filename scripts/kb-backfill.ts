import "dotenv/config";
import { eq } from "drizzle-orm";
import { db } from "../db";
import { kbDocuments, kbDocumentVersions } from "../db/schema";
import { reindexKbVersion } from "../lib/kb/repo";
import { embeddingsEnabled } from "../lib/llm/embeddings";

// Vetoriza a versão ATIVA de cada documento da KB (RAG). Roda após habilitar
// o provider de embeddings ou após um deploy novo.
async function main() {
  if (!embeddingsEnabled()) {
    console.error("Provider de embeddings não configurado (EMBEDDING_PROVIDER/GEMINI_API_KEY).");
    process.exit(1);
  }

  const docs = await db.select().from(kbDocuments);
  for (const d of docs) {
    if (!d.activeVersionId) {
      console.log(`• skip (sem versão ativa): ${d.key}`);
      continue;
    }
    const [v] = await db
      .select()
      .from(kbDocumentVersions)
      .where(eq(kbDocumentVersions.id, d.activeVersionId));
    const n = await reindexKbVersion(v.id, v.content);
    console.log(`✓ ${d.key} v${v.version}: ${n} chunks`);
  }
  console.log("\nDone.");
  process.exit(0);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
