import { and, desc, eq, isNull, sql } from "drizzle-orm";
import { db } from "@/db";
import { conversationMessages, conversations, leads, messageRoles } from "@/db/schema";

export type Role = "user" | "assistant";

async function roleId(code: Role): Promise<number> {
  const [r] = await db.select().from(messageRoles).where(eq(messageRoles.code, code));
  if (!r) throw new Error(`message_role inválido: ${code}`);
  return r.id;
}

export async function createConversation(lang: string): Promise<number> {
  const [c] = await db.insert(conversations).values({ lang }).returning();
  return c.id;
}

export async function appendMessage(
  conversationId: number,
  role: Role,
  content: string,
  trace?: unknown,
): Promise<void> {
  await db.insert(conversationMessages).values({
    conversationId,
    roleId: await roleId(role),
    content,
    trace: trace ?? null,
  });
}

export type ConversationSummary = {
  id: number;
  createdAt: Date;
  lang: string | null;
  messageCount: number;
  firstMessage: string | null;
  leadId: number | null;
};

export async function listConversations(): Promise<ConversationSummary[]> {
  const convs = await db
    .select()
    .from(conversations)
    .where(isNull(conversations.deletedAt))
    .orderBy(desc(conversations.createdAt));
  const userRole = await roleId("user");

  const out: ConversationSummary[] = [];
  for (const c of convs) {
    const [cnt] = await db
      .select({ n: sql<number>`count(*)::int` })
      .from(conversationMessages)
      .where(eq(conversationMessages.conversationId, c.id));
    const [first] = await db
      .select({ content: conversationMessages.content })
      .from(conversationMessages)
      .where(
        and(
          eq(conversationMessages.conversationId, c.id),
          eq(conversationMessages.roleId, userRole),
        ),
      )
      .orderBy(conversationMessages.createdAt)
      .limit(1);
    const [lead] = await db
      .select({ id: leads.id })
      .from(leads)
      .where(and(eq(leads.conversationId, c.id), isNull(leads.deletedAt)));
    out.push({
      id: c.id,
      createdAt: c.createdAt,
      lang: c.lang,
      messageCount: cnt?.n ?? 0,
      firstMessage: first?.content ?? null,
      leadId: lead?.id ?? null,
    });
  }
  return out;
}

export type ConversationMessage = {
  id: number;
  role: string;
  content: string;
  trace: unknown;
  createdAt: Date;
};

export async function getConversation(id: number) {
  const [c] = await db.select().from(conversations).where(eq(conversations.id, id));
  if (!c) return null;
  const messages = await db
    .select({
      id: conversationMessages.id,
      role: messageRoles.code,
      content: conversationMessages.content,
      trace: conversationMessages.trace,
      createdAt: conversationMessages.createdAt,
    })
    .from(conversationMessages)
    .innerJoin(messageRoles, eq(conversationMessages.roleId, messageRoles.id))
    .where(eq(conversationMessages.conversationId, id))
    .orderBy(conversationMessages.createdAt);
  const [lead] = await db
    .select()
    .from(leads)
    .where(and(eq(leads.conversationId, id), isNull(leads.deletedAt)));
  return { conversation: c, messages, lead: lead ?? null };
}

export async function softDeleteConversation(id: number): Promise<void> {
  await db.update(conversations).set({ deletedAt: new Date() }).where(eq(conversations.id, id));
}
