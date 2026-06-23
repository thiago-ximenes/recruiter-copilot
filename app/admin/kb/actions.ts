"use server";

import { revalidatePath } from "next/cache";
import { extractText, getDocumentProxy } from "unpdf";
import {
  DEFAULT_KEY,
  addSource,
  getActiveKbContent,
  getSourcesCombined,
  rollbackKb,
  saveKbVersion,
  softDeleteSource,
} from "@/lib/kb/repo";
import { refineKb } from "@/lib/llm/refine";

// Entrada do funil (PDF): extrai o texto cru do CV.
export async function extractPdfAction(formData: FormData): Promise<string> {
  const file = formData.get("file") as File | null;
  if (!file) throw new Error("nenhum arquivo enviado");
  const buf = new Uint8Array(await file.arrayBuffer());
  const pdf = await getDocumentProxy(buf);
  const { text } = await extractText(pdf, { mergePages: true });
  return Array.isArray(text) ? text.join("\n") : text;
}

// Processamento do funil: guarda a fonte crua e refina (cru -> base canônica).
export async function refineAction(
  rawText: string,
  type: "pdf" | "text" | "snippet",
  merge: boolean,
  filename?: string,
): Promise<{ draft: string; sourceId: number }> {
  if (!rawText.trim()) throw new Error("material vazio");
  const sourceId = await addSource(type, rawText, filename);
  let currentKb: string | undefined;
  if (merge) {
    try {
      currentKb = await getActiveKbContent();
    } catch {
      currentKb = undefined;
    }
  }
  const draft = await refineKb(rawText, currentKb);
  return { draft, sourceId };
}

// Processamento em lote: N PDFs viram fontes + texto combinado refinado de uma vez.
export async function refineBatchAction(
  items: { filename: string; text: string }[],
  merge: boolean,
): Promise<{ draft: string; sourceId?: number }> {
  const valid = items.filter((i) => i.text.trim());
  if (valid.length === 0) throw new Error("nenhum PDF com texto");

  let firstSourceId: number | undefined;
  for (const item of valid) {
    const id = await addSource("pdf", item.text, item.filename);
    firstSourceId ??= id;
  }

  const combined = valid.map((i) => `### ${i.filename}\n${i.text}`).join("\n\n---\n\n");
  let currentKb: string | undefined;
  if (merge) {
    try {
      currentKb = await getActiveKbContent();
    } catch {
      currentKb = undefined;
    }
  }
  const draft = await refineKb(combined, currentKb);
  return { draft, sourceId: firstSourceId };
}

// Saída do funil: salva o refinado revisado como nova versão ativa.
export async function saveKbAction(content: string, changeNote: string, sourceId?: number) {
  if (!content.trim()) throw new Error("conteúdo vazio");
  await saveKbVersion(DEFAULT_KEY, content, changeNote, sourceId);
  revalidatePath("/admin/kb");
}

export async function rollbackKbAction(versionId: number) {
  await rollbackKb(DEFAULT_KEY, versionId);
  revalidatePath("/admin/kb");
}

// Deleta (soft) uma fonte ingerida. Atualiza a lista; o re-refino é um passo separado.
export async function deleteSourceAction(id: number) {
  await softDeleteSource(id);
  revalidatePath("/admin/kb");
}

// Re-refina a KB a partir das fontes ATIVAS (sem as deletadas). Gera rascunho pra revisar.
export async function reRefineAction(): Promise<{ draft: string }> {
  const combined = await getSourcesCombined();
  if (!combined.trim()) throw new Error("nenhuma fonte ativa para re-refinar");
  const draft = await refineKb(combined);
  return { draft };
}
