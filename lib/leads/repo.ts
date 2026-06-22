import { desc, isNull } from "drizzle-orm";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { leads } from "@/db/schema";

export type Lead = typeof leads.$inferSelect;
export type NewLead = {
  name?: string | null;
  company?: string | null;
  role?: string | null;
  contact?: string | null;
  jdText?: string | null;
  lang?: string | null;
};

export async function createLead(data: NewLead): Promise<Lead> {
  const [lead] = await db.insert(leads).values(data).returning();
  return lead;
}

export async function listLeads(): Promise<Lead[]> {
  return db.select().from(leads).where(isNull(leads.deletedAt)).orderBy(desc(leads.createdAt));
}

export async function softDeleteLead(id: number): Promise<void> {
  await db.update(leads).set({ deletedAt: new Date() }).where(eq(leads.id, id));
}
