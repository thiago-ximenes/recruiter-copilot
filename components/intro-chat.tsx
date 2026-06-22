"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { DICT, type Lang } from "@/lib/i18n";

function renderBold(text: string) {
  // splits on *bold* segments (trusted, own content)
  return text.split(/(\*[^*]+\*)/g).map((part, i) =>
    part.startsWith("*") && part.endsWith("*") ? (
      <strong key={i} className="font-semibold">
        {part.slice(1, -1)}
      </strong>
    ) : (
      <span key={i}>{part}</span>
    ),
  );
}

export function IntroChat() {
  const router = useRouter();
  const [lang, setLang] = useState<Lang>("pt");
  const [shown, setShown] = useState(0);
  const [typing, setTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const script = DICT[lang].intro;
  const total = script.messages.length;
  const done = shown >= total;

  // reset when language changes
  useEffect(() => {
    setShown(0);
    setTyping(false);
  }, [lang]);

  // sequential reveal with typing indicator
  useEffect(() => {
    if (shown >= total) return;
    setTyping(true);
    const len = script.messages[shown]?.length ?? 0;
    const delay = Math.min(1500, 650 + len * 14);
    const t = setTimeout(() => {
      setTyping(false);
      setShown((n) => n + 1);
    }, delay);
    return () => clearTimeout(t);
  }, [shown, total, script.messages]);

  // keep scrolled to bottom
  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [shown, typing, done]);

  function skip() {
    if (!done) {
      setTyping(false);
      setShown(total);
    }
  }

  function go(intent: string) {
    router.push(`/chat?intent=${intent}&lang=${lang}`);
  }

  return (
    <div className="relative flex h-[100dvh] w-full items-center justify-center bg-[#d9dbd4] p-0 sm:p-6">
      <Link
        href="/admin"
        className="absolute right-3 top-3 z-10 flex items-center gap-1.5 rounded-full bg-white/80 px-3 py-1.5 text-xs font-medium text-[#54656f] shadow-sm backdrop-blur transition hover:bg-white hover:text-[#008069]"
      >
        🔒 Admin
      </Link>
      <div className="flex h-full w-full max-w-md flex-col overflow-hidden bg-white shadow-xl sm:h-[88vh] sm:rounded-xl">
        {/* header */}
        <header className="flex items-center gap-3 bg-[#008069] px-4 py-3 text-white">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/thiago.jpg"
            alt={script.headerName}
            className="h-10 w-10 shrink-0 rounded-full object-cover ring-2 ring-white/40"
          />
          <div className="min-w-0 flex-1">
            <p className="truncate text-[15px] font-semibold leading-tight">{script.headerName}</p>
            <p className="flex items-center gap-1 text-xs text-white/80">
              <span className="inline-block h-2 w-2 rounded-full bg-green-300" />
              {script.headerStatus}
            </p>
          </div>
          <div className="flex overflow-hidden rounded-full border border-white/30 text-xs">
            {(["pt", "en"] as Lang[]).map((l) => (
              <button
                key={l}
                onClick={() => setLang(l)}
                className={`px-2.5 py-1 font-medium transition ${
                  lang === l ? "bg-white text-[#008069]" : "text-white/90"
                }`}
              >
                {l.toUpperCase()}
              </button>
            ))}
          </div>
        </header>

        {/* messages */}
        <div ref={scrollRef} onClick={skip} className="wa-bg flex-1 space-y-2 overflow-y-auto px-3 py-4">
          <AnimatePresence initial={false}>
            {script.messages.slice(0, shown).map((msg, i) => (
              <motion.div
                key={`${lang}-${i}`}
                initial={{ opacity: 0, y: 8, scale: 0.97 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 0.22, ease: "easeOut" }}
                className="flex justify-start"
              >
                <div className="wa-bubble-in max-w-[85%] px-3 py-2 text-[14.5px] leading-snug text-[#111b21]">
                  {renderBold(msg)}
                  <span className="ml-2 inline-block translate-y-0.5 text-[10px] text-[#667781]">
                    {script.now}
                  </span>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>

          {typing && (
            <motion.div
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex justify-start"
            >
              <div className="wa-bubble-in flex items-center gap-1 px-4 py-3">
                <span className="wa-dot" />
                <span className="wa-dot" />
                <span className="wa-dot" />
              </div>
            </motion.div>
          )}
        </div>

        {/* quick replies + composer */}
        <div className="border-t border-black/5 bg-[#f0f2f5] px-3 py-3">
          <AnimatePresence>
            {done && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                <p className="mb-2 px-1 text-center text-[11px] text-[#667781]">{script.startHint}</p>
                <div className="flex flex-wrap gap-2">
                  {script.quickReplies.map((q) => (
                    <button
                      key={q.intent}
                      onClick={() => go(q.intent)}
                      className="rounded-full border border-[#008069]/30 bg-white px-3.5 py-2 text-[13px] font-medium text-[#008069] shadow-sm transition hover:bg-[#008069] hover:text-white active:scale-95"
                    >
                      {q.label}
                    </button>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {!done && (
            <p className="px-1 text-center text-[11px] text-[#667781]">{script.skipHint}</p>
          )}
        </div>
      </div>
    </div>
  );
}
