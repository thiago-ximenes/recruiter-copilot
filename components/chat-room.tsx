"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import type { Lang, Trace } from "@/lib/agents/pipeline";
import { DICT } from "@/lib/i18n";
import { ChatMarkdown } from "@/components/chat-markdown";

type Msg = { role: "user" | "assistant"; text: string; trace?: Trace };

export function ChatRoom({
  initialIntent,
  initialLang,
}: {
  initialIntent: string | null;
  initialLang: Lang;
}) {
  const [lang] = useState<Lang>(initialLang);
  const t = DICT[lang].chat;
  const [messages, setMessages] = useState<Msg[]>([{ role: "assistant", text: t.greeting }]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [stage, setStage] = useState(0);
  const scrollRef = useRef<HTMLDivElement>(null);
  const started = useRef(false);
  const conversationId = useRef<number | null>(null);

  // intro: auto-send ou prefill conforme a intenção vinda da landing
  useEffect(() => {
    if (started.current) return;
    started.current = true;
    if (initialIntent && t.starters[initialIntent]) {
      send(t.starters[initialIntent]);
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
        body: JSON.stringify({ question: q, lang, conversationId: conversationId.current }),
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      if (typeof data.conversationId === "number") conversationId.current = data.conversationId;
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
                {m.role === "assistant" ? (
                  <ChatMarkdown>{m.text}</ChatMarkdown>
                ) : (
                  <p className="whitespace-pre-wrap">{m.text}</p>
                )}
                {m.trace && (
                  <div className="mt-2 flex flex-wrap gap-1 border-t border-black/5 pt-1.5 text-[10px] text-[#54656f]">
                    <span className="rounded-full bg-black/5 px-1.5 py-0.5">
                      {m.trace.safe ? t.trace.safe : t.trace.blocked}
                    </span>
                    <span className="rounded-full bg-black/5 px-1.5 py-0.5">
                      🧭 {t.trace.routes[m.trace.route] ?? m.trace.route}
                    </span>
                    <span className="rounded-full bg-black/5 px-1.5 py-0.5">
                      {m.trace.retrievedChunks > 0 ? `📚 RAG (${m.trace.retrievedChunks})` : t.trace.grounded}
                    </span>
                    {m.trace.verified && (
                      <span className="rounded-full bg-[#008069]/10 px-1.5 py-0.5 text-[#008069]">
                        {t.trace.verified}
                      </span>
                    )}
                    {m.trace.leadCaptured && (
                      <span className="rounded-full bg-[#008069]/10 px-1.5 py-0.5 text-[#008069]">
                        {t.trace.lead}
                      </span>
                    )}
                    {m.trace.gapCaptured && (
                      <span className="rounded-full bg-amber-500/10 px-1.5 py-0.5 text-amber-700">
                        {t.trace.gap}
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
            aria-label={t.send}
          >
            ➤
          </button>
        </form>
      </div>
    </div>
  );
}
