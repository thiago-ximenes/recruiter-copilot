"use server";

import { revalidatePath } from "next/cache";
import { rollbackTo, saveNewVersion } from "@/lib/prompts/repo";

export async function savePromptAction(key: string, content: string, changeNote: string) {
  if (!content.trim()) throw new Error("conteúdo vazio");
  await saveNewVersion(key, content, changeNote);
  revalidatePath("/admin");
}

export async function rollbackPromptAction(key: string, versionId: number) {
  await rollbackTo(key, versionId);
  revalidatePath("/admin");
}
