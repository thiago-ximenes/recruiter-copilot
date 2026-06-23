import type { NextRequest } from "next/server";
import { runPipeline } from "@/lib/agents/pipeline";
import {
  appendMessage,
  createConversation,
  getRecentMessages,
} from "@/lib/conversations/repo";

export const runtime = "nodejs"; // pg precisa de Node runtime
export const maxDuration = 60;

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const question = body.question;
    const lang = body.lang === "en" ? "en" : "pt";
    if (typeof question !== "string" || !question.trim()) {
      return Response.json({ error: "pergunta vazia" }, { status: 400 });
    }

    const conversationId: number =
      typeof body.conversationId === "number"
        ? body.conversationId
        : await createConversation(lang);

    const history = await getRecentMessages(conversationId, 10);
    await appendMessage(conversationId, "user", question);
    const result = await runPipeline({ question, lang, conversationId, history });
    await appendMessage(conversationId, "assistant", result.answer, result.trace);

    return Response.json({ ...result, conversationId });
  } catch (e) {
    return Response.json({ error: (e as Error).message }, { status: 500 });
  }
}
