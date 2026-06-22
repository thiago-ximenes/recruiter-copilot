"use server";

import { revalidatePath } from "next/cache";
import { extractText, getDocumentProxy } from "unpdf";
import {
  DEFAULT_KEY,
  addSource,
  getActiveKbContent,
  rollbackKb,
  saveKbVersion,
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
