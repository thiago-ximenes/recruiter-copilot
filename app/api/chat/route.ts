import type { NextRequest } from "next/server";
import { runPipeline } from "@/lib/agents/pipeline";
import {
  appendMessage,
  createConversation,
  getRecentMessages,
} from "@/lib/conversations/repo";
import { claimNotification } from "@/lib/app-state/repo";
import { notifyThiago } from "@/lib/tools/notify";

export const runtime = "nodejs"; // pg precisa de Node runtime
export const maxDuration = 60;

const ALERT_COOLDOWN_MS = 15 * 60 * 1000;

function fallbackMessage(lang: "pt" | "en"): string {
  return lang === "en"
    ? "Oops, I hit a technical hiccup just now 😅 — try again in a moment, or leave your name and contact and Thiago will get back to you directly."
    : "Opa, tive uma instabilidade técnica agora 😅 — tenta de novo em instantes, ou me deixa seu nome e contato que o Thiago te responde direto.";
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const question = body.question;
    const lang: "pt" | "en" = body.lang === "en" ? "en" : "pt";
    if (typeof question !== "string" || !question.trim()) {
      return Response.json({ error: "pergunta vazia" }, { status: 400 });
    }

    const conversationId: number =
      typeof body.conversationId === "number"
        ? body.conversationId
        : await createConversation(lang);

    const history = await getRecentMessages(conversationId, 10);
    await appendMessage(conversationId, "user", question);

    try {
      const result = await runPipeline({ question, lang, conversationId, history });
      await appendMessage(conversationId, "assistant", result.answer, result.trace);
      return Response.json({ ...result, conversationId });
    } catch (agentErr) {
      // Agente indisponível (ex.: DeepSeek sem saldo). O recrutador NÃO vê o erro técnico.
      const message = (agentErr as Error).message;
      if (await claimNotification("agent_down", ALERT_COOLDOWN_MS)) {
        await notifyThiago(
          `🚨 <b>Recruiter Copilot indisponível</b>\nO agente falhou ao responder. Pode ser saldo do DeepSeek.\nErro: ${message}`,
        );
      }
      const answer = fallbackMessage(lang);
      await appendMessage(conversationId, "assistant", answer).catch(() => {});
      return Response.json({ answer, conversationId });
    }
  } catch (e) {
    return Response.json({ error: (e as Error).message }, { status: 500 });
  }
}
