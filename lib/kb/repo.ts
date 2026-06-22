import { desc, eq, max } from "drizzle-orm";
import { db } from "@/db";
import {
  kbDocuments,
  kbDocumentVersions,
  kbSources,
  kbSourceTypes,
} from "@/db/schema";

const DEFAULT_KEY = "profile-facts";

export type KbVersion = {
  id: number;
  version: number;
  content: string;
  changeNote: string | null;
  author: string;
  createdAt: Date;
};

export type KbDoc = {
  id: number;
  key: string;
  title: string;
  activeVersionId: number | null;
  versions: KbVersion[];
};

// Conteúdo da KB ativa (grounding do agente).
export async function getActiveKbContent(key = DEFAULT_KEY): Promise<string> {
  const [d] = await db.select().from(kbDocuments).where(eq(kbDocuments.key, key));
  if (!d?.activeVersionId) throw new Error(`KB sem versão ativa: ${key}`);
  const [v] = await db
    .select()
    .from(kbDocumentVersions)
    .where(eq(kbDocumentVersions.id, d.activeVersionId));
  return v.content;
}

export async function getKbDoc(key = DEFAULT_KEY): Promise<KbDoc | null> {
  const [d] = await db.select().from(kbDocuments).where(eq(kbDocuments.key, key));
  if (!d) return null;
  const versions = await db
    .select()
    .from(kbDocumentVersions)
    .where(eq(kbDocumentVersions.documentId, d.id))
    .orderBy(desc(kbDocumentVersions.version));
  return {
    id: d.id,
    key: d.key,
    title: d.title,
    activeVersionId: d.activeVersionId,
    versions,
  };
}

// Entrada do funil: guarda o material cru e devolve o id da fonte.
export async function addSource(
  typeCode: "pdf" | "text" | "snippet",
  rawText: string,
  filename?: string,
): Promise<number> {
  const [type] = await db
    .select()
    .from(kbSourceTypes)
    .where(eq(kbSourceTypes.code, typeCode));
  if (!type) throw new Error(`tipo de fonte inválido: ${typeCode}`);
  const [s] = await db
    .insert(kbSources)
    .values({ typeId: type.id, rawText, filename: filename ?? null })
    .returning();
  return s.id;
}

// Saída do funil: salva o refinado como nova versão e ativa.
export async function saveKbVersion(
  key: string,
  content: string,
  changeNote: string,
  refinedFromSourceId?: number,
) {
  const [d] = await db.select().from(kbDocuments).where(eq(kbDocuments.key, key));
  if (!d) throw new Error(`KB não encontrada: ${key}`);
  const [{ value: maxV }] = await db
    .select({ value: max(kbDocumentVersions.version) })
    .from(kbDocumentVersions)
    .where(eq(kbDocumentVersions.documentId, d.id));
  const nextV = (maxV ?? 0) + 1;
  const [v] = await db
    .insert(kbDocumentVersions)
    .values({
      documentId: d.id,
      version: nextV,
      content,
      changeNote: changeNote.trim() || null,
      refinedFromSourceId: refinedFromSourceId ?? null,
      author: "admin",
    })
    .returning();
  await db
    .update(kbDocuments)
    .set({ activeVersionId: v.id, updatedAt: new Date() })
    .where(eq(kbDocuments.id, d.id));
  return v;
}

export async function rollbackKb(key: string, versionId: number) {
  const [d] = await db.select().from(kbDocuments).where(eq(kbDocuments.key, key));
  if (!d) throw new Error(`KB não encontrada: ${key}`);
  const [v] = await db
    .select()
    .from(kbDocumentVersions)
    .where(eq(kbDocumentVersions.id, versionId));
  if (!v || v.documentId !== d.id) throw new Error("versão não pertence a esta KB");
  await db
    .update(kbDocuments)
    .set({ activeVersionId: v.id, updatedAt: new Date() })
    .where(eq(kbDocuments.id, d.id));
}

export { DEFAULT_KEY };
