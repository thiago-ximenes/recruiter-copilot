"use server";

import { revalidatePath } from "next/cache";
import { softDeleteConversation } from "@/lib/conversations/repo";

export async function deleteConversationAction(formData: FormData) {
  const id = Number(formData.get("id"));
  if (!id) throw new Error("id inválido");
  await softDeleteConversation(id);
  revalidatePath("/admin/conversations");
}
