import { and, asc, desc, eq, isNull, max } from "drizzle-orm";
import { db } from "@/db";
import { prompts, promptVersions } from "@/db/schema";

export type PromptVersion = {
  id: number;
  version: number;
  content: string;
  changeNote: string | null;
  author: string;
  createdAt: Date;
};

export type PromptWithVersions = {
  id: number;
  key: string;
  name: string;
  description: string | null;
  activeVersionId: number | null;
  versions: PromptVersion[];
};

export async function getAllPromptsWithVersions(): Promise<PromptWithVersions[]> {
  const ps = await db
    .select()
    .from(prompts)
    .where(isNull(prompts.deletedAt))
    .orderBy(asc(prompts.id));

  const out: PromptWithVersions[] = [];
  for (const p of ps) {
    const versions = await db
      .select()
      .from(promptVersions)
      .where(eq(promptVersions.promptId, p.id))
      .orderBy(desc(promptVersions.version));
    out.push({
      id: p.id,
      key: p.key,
      name: p.name,
      description: p.description,
      activeVersionId: p.activeVersionId,
      versions,
    });
  }
  return out;
}

// Conteúdo da versão ativa de um prompt (usado em runtime pelos agentes/refino).
export async function getActivePromptContent(key: string): Promise<string> {
  const [p] = await db.select().from(prompts).where(eq(prompts.key, key));
  if (!p?.activeVersionId) throw new Error(`prompt sem versão ativa: ${key}`);
  const [v] = await db
    .select()
    .from(promptVersions)
    .where(eq(promptVersions.id, p.activeVersionId));
  if (!v) throw new Error(`versão ativa não encontrada: ${key}`);
  return v.content;
}

// Editar = criar nova versão (append-only) e marcá-la como ativa.
export async function saveNewVersion(key: string, content: string, changeNote: string) {
  const [p] = await db.select().from(prompts).where(eq(prompts.key, key));
  if (!p) throw new Error(`prompt não encontrado: ${key}`);

  const [{ value: maxV }] = await db
    .select({ value: max(promptVersions.version) })
    .from(promptVersions)
    .where(eq(promptVersions.promptId, p.id));

  const nextV = (maxV ?? 0) + 1;
  const [v] = await db
    .insert(promptVersions)
    .values({
      promptId: p.id,
      version: nextV,
      content,
      changeNote: changeNote.trim() || null,
      author: "admin",
    })
    .returning();

  await db
    .update(prompts)
    .set({ activeVersionId: v.id, updatedAt: new Date() })
    .where(eq(prompts.id, p.id));

  return v;
}

// Rollback = re-apontar a versão ativa para uma versão antiga (histórico intacto).
export async function rollbackTo(key: string, versionId: number) {
  const [p] = await db.select().from(prompts).where(eq(prompts.key, key));
  if (!p) throw new Error(`prompt não encontrado: ${key}`);

  const [v] = await db
    .select()
    .from(promptVersions)
    .where(and(eq(promptVersions.id, versionId), eq(promptVersions.promptId, p.id)));
  if (!v) throw new Error("versão não pertence a este prompt");

  await db
    .update(prompts)
    .set({ activeVersionId: v.id, updatedAt: new Date() })
    .where(eq(prompts.id, p.id));
}
