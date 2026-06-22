import type { NextRequest } from "next/server";
import { runPipeline } from "@/lib/agents/pipeline";

export const runtime = "nodejs"; // pg precisa de Node runtime
export const maxDuration = 60;

export async function POST(req: NextRequest) {
  try {
    const { question, lang } = await req.json();
    if (typeof question !== "string" || !question.trim()) {
      return Response.json({ error: "pergunta vazia" }, { status: 400 });
    }
    const result = await runPipeline({ question, lang: lang === "en" ? "en" : "pt" });
    return Response.json(result);
  } catch (e) {
    return Response.json({ error: (e as Error).message }, { status: 500 });
  }
}
