import "dotenv/config";
import fs from "node:fs";
import path from "node:path";
import { eq } from "drizzle-orm";
import { db } from "./index";
import {
  kbDocuments,
  kbDocumentVersions,
  kbSourceTypes,
  prompts,
  promptVersions,
} from "./schema";
import { PROMPT_SEEDS } from "../lib/prompts/defaults";

async function seedKb() {
  // tipos de fonte (lookup)
  for (const code of ["pdf", "text", "snippet"]) {
    const existing = await db.select().from(kbSourceTypes).where(eq(kbSourceTypes.code, code));
    if (existing.length === 0) await db.insert(kbSourceTypes).values({ code });
  }

  // documento canônico profile-facts (v1 = facts.md atual)
  const existing = await db.select().from(kbDocuments).where(eq(kbDocuments.key, "profile-facts"));
  if (existing.length > 0) {
    console.log("• skip (já existe): kb profile-facts");
    return;
  }
  const factsPath = path.join(process.cwd(), "data/profile/facts.md");
  const content = fs.readFileSync(factsPath, "utf8");

  const [doc] = await db
    .insert(kbDocuments)
    .values({ key: "profile-facts", title: "Perfil — fatos verificados" })
    .returning();
  const [v1] = await db
    .insert(kbDocumentVersions)
    .values({
      documentId: doc.id,
      version: 1,
      content,
      changeNote: "seed inicial (facts.md)",
      author: "seed",
    })
    .returning();
  await db.update(kbDocuments).set({ activeVersionId: v1.id }).where(eq(kbDocuments.id, doc.id));
  console.log("✓ seed: kb profile-facts (v1)");
}

// Semeia os prompts (idempotente): cria o prompt + versão 1 + marca como ativa.
// Não sobrescreve prompts já existentes (preserva edições feitas no admin).
async function main() {
  for (const seed of PROMPT_SEEDS) {
    const existing = await db.select().from(prompts).where(eq(prompts.key, seed.key));
    if (existing.length > 0) {
      console.log(`• skip (já existe): ${seed.key}`);
      continue;
    }

    const [prompt] = await db
      .insert(prompts)
      .values({ key: seed.key, name: seed.name, description: seed.description })
      .returning();

    const [v1] = await db
      .insert(promptVersions)
      .values({
        promptId: prompt.id,
        version: 1,
        content: seed.content,
        changeNote: "seed inicial",
        author: "seed",
      })
      .returning();

    await db
      .update(prompts)
      .set({ activeVersionId: v1.id })
      .where(eq(prompts.id, prompt.id));

    console.log(`✓ seed: ${seed.key} (v1)`);
  }
  await seedKb();
  console.log("\nDone.");
  process.exit(0);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
