"use server";

import { revalidatePath } from "next/cache";
import { resolveGap, softDeleteGap } from "@/lib/gaps/repo";

export async function resolveGapAction(formData: FormData) {
  const id = Number(formData.get("id"));
  if (!id) throw new Error("id inválido");
  await resolveGap(id);
  revalidatePath("/admin/gaps");
}

export async function deleteGapAction(formData: FormData) {
  const id = Number(formData.get("id"));
  if (!id) throw new Error("id inválido");
  await softDeleteGap(id);
  revalidatePath("/admin/gaps");
}
