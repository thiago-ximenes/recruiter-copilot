"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import type { Lang, Trace } from "@/lib/agents/pipeline";

type Msg = { role: "user" | "assistant"; text: string; trace?: Trace };

const T = {
  pt: {
    header: "Assistente do Thiago",
    status: "online · IA",
    placeholder: "Escreva sua pergunta…",
    greeting:
      "Oi! 👋 Pergunte o que quiser sobre o Thiago, ou cole a sua vaga que eu meço o fit. Respondo só com base nos fatos reais dele.",
    stages: ["🛡️ verificando entrada", "🧭 roteando", "📚 consultando a base", "✓ verificando"],
    back: "‹ Voltar",
    fitPrefill: "Minha vaga: ",
  },
  en: {
    header: "Thiago's Assistant",
    status: "online · AI",
    placeholder: "Type your question…",
    greeting:
      "Hi! 👋 Ask anything about Thiago, or paste your role and I'll measure the fit. I only answer grounded in his real facts.",
    stages: ["🛡️ checking input", "🧭 routing", "📚 consulting the KB", "✓ verifying"],
    back: "‹ Back",
    fitPrefill: "My role: ",
  },
} as const;

const STARTERS: Record<string, { pt: string; en: string }> = {
  skills: { pt: "Quais tecnologias o Thiago domina?", en: "What technologies does Thiago know?" },
  why: { pt: "Por que contratar o Thiago?", en: "Why should we hire Thiago?" },
  contact: { pt: "Quero falar com o Thiago.", en: "I'd like to talk to Thiago." },
};

const ROUTE_LABEL: Record<string, string> = {
  fit: "fit",
  tech: "técnico",
  factual: "factual",
  contact: "contato",
};

export function ChatRoom({
  initialIntent,
  initialLang,
}: {
  initialIntent: string | null;
  initialLang: Lang;
}) {
  const [lang] = useState<Lang>(initialLang);
  const t = T[lang];
  const [messages, setMessages] = useState<Msg[]>([{ role: "assistant", text: t.greeting }]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [stage, setStage] = useState(0);
  const scrollRef = useRef<HTMLDivElement>(null);
  const started = useRef(false);

  // intro: auto-send ou prefill conforme a intenção vinda da landing
  useEffect(() => {
    if (started.current) return;
    started.current = true;
    if (initialIntent && STARTERS[initialIntent]) {
      send(STARTERS[initialIntent][lang]);
    } else if (initialIntent === "fit") {
      setInput(t.fitPrefill);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, busy, stage]);

  // cicla os rótulos de estágio enquanto espera (os estágios acontecem no servidor)
  useEffect(() => {
    if (!busy) return;
    const id = setInterval(() => setStage((s) => (s + 1) % t.stages.length), 1400);
    return () => clearInterval(id);
  }, [busy, t.stages.length]);

  async function send(text: string) {
    const q = text.trim();
    if (!q || busy) return;
    setInput("");
    setMessages((m) => [...m, { role: "user", text: q }]);
    setBusy(true);
    setStage(0);
    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: q, lang }),
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setMessages((m) => [...m, { role: "assistant", text: data.answer, trace: data.trace }]);
    } catch (e) {
      setMessages((m) => [
        ...m,
        { role: "assistant", text: `⚠️ ${(e as Error).message}` },
      ]);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex h-[100dvh] w-full items-center justify-center bg-[#d9dbd4] p-0 sm:p-6">
      <div className="flex h-full w-full max-w-md flex-col overflow-hidden bg-white shadow-xl sm:h-[88vh] sm:rounded-xl">
        <header className="flex items-center gap-3 bg-[#008069] px-4 py-3 text-white">
          <Link href="/" className="text-white/90">
            {t.back}
          </Link>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/thiago.jpg" alt={t.header} className="h-9 w-9 rounded-full object-cover ring-2 ring-white/40" />
          <div className="min-w-0">
            <p className="truncate text-[15px] font-semibold leading-tight">{t.header}</p>
            <p className="text-xs text-white/80">{t.status}</p>
          </div>
        </header>

        <div ref={scrollRef} className="wa-bg flex-1 space-y-2 overflow-y-auto px-3 py-4">
          {messages.map((m, i) => (
            <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
              <div
                className={`max-w-[85%] px-3 py-2 text-[14.5px] leading-snug shadow-sm ${
                  m.role === "user"
                    ? "rounded-l-lg rounded-br-lg bg-[#d9fdd3] text-[#111b21]"
                    : "wa-bubble-in text-[#111b21]"
                }`}
              >
                <p className="whitespace-pre-wrap">{m.text}</p>
                {m.trace && (
                  <div className="mt-2 flex flex-wrap gap-1 border-t border-black/5 pt-1.5 text-[10px] text-[#54656f]">
                    <span className="rounded-full bg-black/5 px-1.5 py-0.5">
                      {m.trace.safe ? "🛡️ seguro" : "🛡️ bloqueado"}
                    </span>
                    <span className="rounded-full bg-black/5 px-1.5 py-0.5">
                      🧭 {ROUTE_LABEL[m.trace.route] ?? m.trace.route}
                    </span>
                    <span className="rounded-full bg-black/5 px-1.5 py-0.5">
                      {m.trace.retrievedChunks > 0 ? `📚 RAG (${m.trace.retrievedChunks})` : "📚 grounded"}
                    </span>
                    {m.trace.verified && (
                      <span className="rounded-full bg-[#008069]/10 px-1.5 py-0.5 text-[#008069]">
                        ✓ verificado
                      </span>
                    )}
                  </div>
                )}
              </div>
            </div>
          ))}

          {busy && (
            <div className="flex justify-start">
              <div className="wa-bubble-in flex items-center gap-2 px-3 py-2 text-[13px] text-[#54656f]">
                <span className="wa-dot" />
                <span>{t.stages[stage]}</span>
              </div>
            </div>
          )}
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            send(input);
          }}
          className="flex items-center gap-2 border-t border-black/5 bg-[#f0f2f5] px-3 py-2.5"
        >
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                send(input);
              }
            }}
            rows={1}
            placeholder={t.placeholder}
            className="max-h-28 min-h-[40px] flex-1 resize-none rounded-2xl border border-black/10 bg-white px-3 py-2 text-sm outline-none focus:border-[#008069]"
          />
          <button
            type="submit"
            disabled={busy || !input.trim()}
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#008069] text-white transition disabled:opacity-40"
            aria-label="enviar"
          >
            ➤
          </button>
        </form>
      </div>
    </div>
  );
}
