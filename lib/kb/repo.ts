import { desc, eq, max, sql } from "drizzle-orm";
import { db } from "@/db";
import {
  kbChunks,
  kbDocuments,
  kbDocumentVersions,
  kbSources,
  kbSourceTypes,
} from "@/db/schema";
import { chunkMarkdown } from "@/lib/kb/chunk";
import { embedText, embedTexts, embeddingsEnabled } from "@/lib/llm/embeddings";

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

// Vetoriza uma versão da KB (RAG): chunk -> embed -> grava. Idempotente por versão.
// Sem provider de embeddings configurado, é no-op (pipeline cai no fallback de KB full).
export async function reindexKbVersion(documentVersionId: number, content: string): Promise<number> {
  if (!embeddingsEnabled()) return 0;
  const chunks = chunkMarkdown(content);
  if (chunks.length === 0) return 0;
  const vectors = await embedTexts(chunks);
  await db.delete(kbChunks).where(eq(kbChunks.documentVersionId, documentVersionId));
  await db.insert(kbChunks).values(
    chunks.map((c, i) => ({
      documentVersionId,
      chunkIndex: i,
      content: c,
      embedding: vectors[i],
    })),
  );
  return chunks.length;
}

// Recupera os top-K chunks mais próximos da pergunta na versão ativa da KB.
// Retorna null quando RAG não está disponível -> caller usa a KB completa.
export async function retrieveChunks(
  query: string,
  k = 5,
  key = DEFAULT_KEY,
): Promise<string[] | null> {
  if (!embeddingsEnabled()) return null;
  const [d] = await db.select().from(kbDocuments).where(eq(kbDocuments.key, key));
  if (!d?.activeVersionId) return null;
  try {
    const vec = await embedText(query);
    const literal = `[${vec.join(",")}]`;
    const res = await db.execute(sql`
      SELECT content FROM kb_chunks
      WHERE document_version_id = ${d.activeVersionId}
      ORDER BY embedding <=> ${literal}::vector
      LIMIT ${k}
    `);
    const rows = res.rows as { content: string }[];
    return rows.length > 0 ? rows.map((r) => r.content) : null;
  } catch (e) {
    console.warn(`[rag] retrieval indisponível, usando KB completa: ${(e as Error).message}`);
    return null;
  }
}

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
  try {
    await reindexKbVersion(v.id, content);
  } catch (e) {
    console.warn(`[rag] indexação falhou (rode o backfill depois): ${(e as Error).message}`);
  }
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
  const [existing] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(kbChunks)
    .where(eq(kbChunks.documentVersionId, v.id));
  if (!existing || existing.count === 0) await reindexKbVersion(v.id, v.content);
}

export { DEFAULT_KEY };
