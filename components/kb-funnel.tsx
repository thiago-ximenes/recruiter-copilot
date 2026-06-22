"use client";

import { useRef, useState, useTransition } from "react";
import type { KbDoc } from "@/lib/kb/repo";
import {
  extractPdfAction,
  refineAction,
  rollbackKbAction,
  saveKbAction,
} from "@/app/admin/kb/actions";

export function KbFunnel({ doc }: { doc: KbDoc }) {
  const active = doc.versions.find((v) => v.id === doc.activeVersionId);

  const [tab, setTab] = useState<"upload" | "paste">("upload");
  const [rawText, setRawText] = useState("");
  const [filename, setFilename] = useState<string>();
  const [merge, setMerge] = useState(true);

  const [draft, setDraft] = useState<string | null>(null);
  const [sourceId, setSourceId] = useState<number>();
  const [note, setNote] = useState("");

  const [busy, start] = useTransition();
  const [msg, setMsg] = useState<string | null>(null);
  const [showActive, setShowActive] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  function onFile(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (!f) return;
    setFilename(f.name);
    setMsg(null);
    const fd = new FormData();
    fd.append("file", f);
    start(async () => {
      try {
        const text = await extractPdfAction(fd);
        setRawText(text);
        setMsg(`✓ PDF extraído (${text.length} caracteres)`);
      } catch (err) {
        setMsg(`erro ao ler PDF: ${(err as Error).message}`);
      }
    });
  }

  function refine() {
    setMsg(null);
    start(async () => {
      try {
        const type = tab === "upload" ? "pdf" : "text";
        const res = await refineAction(rawText, type, merge, filename);
        setDraft(res.draft);
        setSourceId(res.sourceId);
        setMsg("✓ refinado — revise antes de salvar");
      } catch (err) {
        setMsg(`erro no refino: ${(err as Error).message}`);
      }
    });
  }

  function save() {
    if (!draft) return;
    setMsg(null);
    start(async () => {
      try {
        await saveKbAction(draft, note, sourceId);
        setDraft(null);
        setRawText("");
        setFilename(undefined);
        setNote("");
        if (fileRef.current) fileRef.current.value = "";
        setMsg("✓ nova versão da KB salva e ativada");
      } catch (err) {
        setMsg(`erro ao salvar: ${(err as Error).message}`);
      }
    });
  }

  function rollback(versionId: number) {
    setMsg(null);
    start(async () => {
      try {
        await rollbackKbAction(versionId);
        setMsg("✓ rollback aplicado");
      } catch (err) {
        setMsg(`erro: ${(err as Error).message}`);
      }
    });
  }

  return (
    <div className="space-y-4">
      {/* ENTRADA */}
      <section className="rounded-xl border border-black/5 bg-white p-4">
        <div className="mb-3 flex items-center gap-2">
          <span className="text-sm font-semibold">1. Entrada</span>
          <div className="ml-auto flex overflow-hidden rounded-full border border-black/10 text-xs">
            {(["upload", "paste"] as const).map((t) => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={`px-3 py-1 font-medium transition ${
                  tab === t ? "bg-[#008069] text-white" : "text-[#54656f]"
                }`}
              >
                {t === "upload" ? "Upload PDF" : "Colar texto"}
              </button>
            ))}
          </div>
        </div>

        {tab === "upload" ? (
          <div>
            <input
              ref={fileRef}
              type="file"
              accept="application/pdf"
              onChange={onFile}
              className="block w-full text-sm file:mr-3 file:rounded-lg file:border-0 file:bg-[#008069] file:px-4 file:py-2 file:text-sm file:font-medium file:text-white hover:file:bg-[#00674f]"
            />
            {filename && (
              <p className="mt-2 text-xs text-[#54656f]">arquivo: {filename}</p>
            )}
            {rawText && (
              <p className="mt-1 text-xs text-[#54656f]">
                texto extraído: {rawText.length} caracteres
              </p>
            )}
          </div>
        ) : (
          <textarea
            value={rawText}
            onChange={(e) => setRawText(e.target.value)}
            rows={6}
            placeholder="Cole aqui o texto do CV ou um trecho a adicionar…"
            className="w-full resize-y rounded-lg border border-black/10 bg-[#f8f9fa] p-3 text-sm outline-none focus:border-[#008069]"
          />
        )}

        <div className="mt-3 flex flex-wrap items-center gap-3">
          <label className="flex items-center gap-2 text-xs text-[#54656f]">
            <input
              type="checkbox"
              checked={merge}
              onChange={(e) => setMerge(e.target.checked)}
            />
            Mesclar com a base atual (preserva os gaps)
          </label>
          <button
            onClick={refine}
            disabled={!rawText.trim() || busy}
            className="ml-auto rounded-lg bg-[#008069] px-4 py-2 text-sm font-medium text-white transition disabled:cursor-not-allowed disabled:opacity-40"
          >
            {busy ? "processando…" : "2. Refinar com IA →"}
          </button>
        </div>
        {msg && <p className="mt-2 text-xs text-[#54656f]">{msg}</p>}
      </section>

      {/* SAÍDA / REVISÃO */}
      {draft !== null && (
        <section className="rounded-xl border border-[#008069]/30 bg-[#008069]/5 p-4">
          <div className="mb-2 flex items-center justify-between">
            <span className="text-sm font-semibold">3. Saída refinada — revise e edite</span>
            <button
              onClick={() => setDraft(null)}
              className="text-xs text-[#54656f] hover:text-red-600"
            >
              descartar
            </button>
          </div>
          <textarea
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            rows={16}
            className="w-full resize-y rounded-lg border border-black/10 bg-white p-3 font-mono text-[12.5px] leading-relaxed outline-none focus:border-[#008069]"
          />
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <input
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="nota da versão (ex.: 'add CV backend')"
              className="min-w-0 flex-1 rounded-lg border border-black/10 px-3 py-2 text-sm outline-none focus:border-[#008069]"
            />
            <button
              onClick={save}
              disabled={busy}
              className="rounded-lg bg-[#008069] px-4 py-2 text-sm font-medium text-white transition disabled:opacity-40"
            >
              4. Salvar versão (ativar)
            </button>
          </div>
        </section>
      )}

      {/* KB ATIVA + HISTÓRICO */}
      <section className="rounded-xl border border-black/5 bg-white p-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold">
            {doc.title} — ativa: v{active?.version ?? "?"}
          </h2>
          <button
            onClick={() => setShowActive((s) => !s)}
            className="text-xs text-[#008069] hover:underline"
          >
            {showActive ? "ocultar conteúdo" : "ver conteúdo ativo"}
          </button>
        </div>
        {showActive && active && (
          <pre className="mt-3 max-h-80 overflow-auto rounded-lg bg-[#f8f9fa] p-3 text-[12px] leading-relaxed whitespace-pre-wrap">
            {active.content}
          </pre>
        )}

        <h3 className="mb-2 mt-4 text-xs font-semibold uppercase tracking-wide text-[#54656f]">
          Histórico ({doc.versions.length})
        </h3>
        <ul className="space-y-1.5">
          {doc.versions.map((v) => {
            const isActive = v.id === doc.activeVersionId;
            return (
              <li
                key={v.id}
                className={`flex items-center justify-between gap-3 rounded-lg border px-3 py-2 text-xs ${
                  isActive ? "border-[#008069]/40 bg-[#008069]/5" : "border-black/5 bg-white"
                }`}
              >
                <div className="min-w-0">
                  <span className="font-semibold">v{v.version}</span>
                  {isActive && (
                    <span className="ml-2 rounded-full bg-[#008069] px-2 py-0.5 text-[10px] font-medium text-white">
                      ativa
                    </span>
                  )}
                  <span className="ml-2 text-[#54656f]">{v.changeNote ?? "—"}</span>
                  <span className="ml-2 text-[#9aa6ad]">
                    {new Date(v.createdAt).toLocaleString("pt-BR")} · {v.author}
                  </span>
                </div>
                {!isActive && (
                  <button
                    onClick={() => rollback(v.id)}
                    disabled={busy}
                    className="shrink-0 rounded-md border border-[#008069]/30 px-2.5 py-1 font-medium text-[#008069] transition hover:bg-[#008069] hover:text-white disabled:opacity-40"
                  >
                    Rollback
                  </button>
                )}
              </li>
            );
          })}
        </ul>
      </section>
    </div>
  );
}
