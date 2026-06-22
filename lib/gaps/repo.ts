import { desc, eq, isNull } from "drizzle-orm";
import { db } from "@/db";
import { gaps } from "@/db/schema";

export type Gap = typeof gaps.$inferSelect;
export type NewGap = {
  question: string;
  reason?: string | null;
  roleContext?: string | null;
  lang?: string | null;
};

export async function createGap(data: NewGap): Promise<Gap> {
  const [gap] = await db.insert(gaps).values(data).returning();
  return gap;
}

export async function listGaps(): Promise<Gap[]> {
  return db.select().from(gaps).where(isNull(gaps.deletedAt)).orderBy(desc(gaps.createdAt));
}

export async function resolveGap(id: number): Promise<void> {
  await db.update(gaps).set({ resolvedAt: new Date() }).where(eq(gaps.id, id));
}

export async function softDeleteGap(id: number): Promise<void> {
  await db.update(gaps).set({ deletedAt: new Date() }).where(eq(gaps.id, id));
}
