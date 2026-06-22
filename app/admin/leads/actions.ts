"use server";

import { revalidatePath } from "next/cache";
import { softDeleteLead } from "@/lib/leads/repo";

export async function deleteLeadAction(formData: FormData) {
  const id = Number(formData.get("id"));
  if (!id) throw new Error("id inválido");
  await softDeleteLead(id);
  revalidatePath("/admin/leads");
}
