"use client";

import { useRef, useState, useTransition } from "react";
import type { KbDoc, SourceSummary } from "@/lib/kb/repo";
import {
  deleteSourceAction,
  extractPdfAction,
  reRefineAction,
  refineAction,
  refineBatchAction,
  rollbackKbAction,
  saveKbAction,
} from "@/app/admin/kb/actions";

type StagedPdf = { filename: string; text: string };

export function KbFunnel({ doc, sources }: { doc: KbDoc; sources: SourceSummary[] }) {
  const active = doc.versions.find((v) => v.id === doc.activeVersionId);

  const [tab, setTab] = useState<"upload" | "paste">("upload");
  const [rawText, setRawText] = useState("");
  const [staged, setStaged] = useState<StagedPdf[]>([]);
  const [merge, setMerge] = useState(true);

  const [draft, setDraft] = useState<string | null>(null);
  const [sourceId, setSourceId] = useState<number>();
  const [note, setNote] = useState("");

  const [busy, start] = useTransition();
  const [msg, setMsg] = useState<string | null>(null);
  const [showActive, setShowActive] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  function onFile(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []);
    if (files.length === 0) return;
    setMsg(null);
    start(async () => {
      for (const f of files) {
        try {
          const fd = new FormData();
          fd.append("file", f);
          const text = await extractPdfAction(fd);
          setStaged((prev) => [...prev, { filename: f.name, text }]);
        } catch (err) {
          setMsg(`erro ao ler ${f.name}: ${(err as Error).message}`);
        }
      }
      if (fileRef.current) fileRef.current.value = "";
    });
  }

  function removeStaged(index: number) {
    setStaged((prev) => prev.filter((_, i) => i !== index));
  }

  function refine() {
    setMsg(null);
    start(async () => {
      try {
        const res =
          tab === "upload"
            ? await refineBatchAction(staged, merge)
            : await refineAction(rawText, "text", merge);
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
        setStaged([]);
        setNote("");
        if (fileRef.current) fileRef.current.value = "";
        setMsg("✓ nova versão da KB salva e ativada");
      } catch (err) {
        setMsg(`erro ao salvar: ${(err as Error).message}`);
      }
    });
  }

  function deleteSource(id: number) {
    setMsg(null);
    start(async () => {
      try {
        await deleteSourceAction(id);
        setMsg("✓ fonte removida — re-refine pra rebuildar a KB sem ela");
      } catch (err) {
        setMsg(`erro ao remover fonte: ${(err as Error).message}`);
      }
    });
  }

  function reRefine() {
    setMsg(null);
    start(async () => {
      try {
        const res = await reRefineAction();
        setDraft(res.draft);
        setSourceId(undefined);
        setNote("re-refino a partir das fontes ativas");
        setMsg("✓ re-refinado a partir das fontes — revise e salve");
        window.scrollTo({ top: 0, behavior: "smooth" });
      } catch (err) {
        setMsg(`erro no re-refino: ${(err as Error).message}`);
      }
    });
  }

  function editActive() {
    if (!active) return;
    setDraft(active.content);
    setSourceId(undefined);
    setNote("");
    setMsg("editando a base ativa — remova o que quiser e salve como nova versão");
    window.scrollTo({ top: 0, behavior: "smooth" });
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
              multiple
              onChange={onFile}
              className="block w-full text-sm file:mr-3 file:rounded-lg file:border-0 file:bg-[#008069] file:px-4 file:py-2 file:text-sm file:font-medium file:text-white hover:file:bg-[#00674f]"
            />
            <p className="mt-2 text-xs text-[#54656f]">
              Adicione um ou vários PDFs. Eles são extraídos e refinados juntos numa só versão.
            </p>
            {staged.length > 0 && (
              <ul className="mt-3 space-y-1.5">
                {staged.map((s, i) => (
                  <li
                    key={`${s.filename}-${i}`}
                    className="flex items-center justify-between gap-3 rounded-lg border border-black/5 bg-[#f8f9fa] px-3 py-2 text-xs"
                  >
                    <span className="min-w-0 truncate">
                      📄 {s.filename}{" "}
                      <span className="text-[#9aa6ad]">· {s.text.length} caracteres</span>
                    </span>
                    <button
                      onClick={() => removeStaged(i)}
                      disabled={busy}
                      className="shrink-0 rounded-md px-2 py-1 font-medium text-red-600 transition hover:bg-red-50 disabled:opacity-40"
                    >
                      remover
                    </button>
                  </li>
                ))}
              </ul>
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
            disabled={busy || (tab === "upload" ? staged.length === 0 : !rawText.trim())}
            className="ml-auto rounded-lg bg-[#008069] px-4 py-2 text-sm font-medium text-white transition disabled:cursor-not-allowed disabled:opacity-40"
          >
            {busy
              ? "processando…"
              : tab === "upload" && staged.length > 0
                ? `2. Refinar ${staged.length} PDF(s) com IA →`
                : "2. Refinar com IA →"}
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

      {/* FONTES INGERIDAS */}
      <section className="rounded-xl border border-black/5 bg-white p-4">
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-sm font-semibold">Fontes ingeridas ({sources.length})</h2>
          <button
            onClick={reRefine}
            disabled={busy || sources.length === 0}
            className="shrink-0 rounded-lg bg-[#008069] px-3 py-1.5 text-xs font-medium text-white transition disabled:opacity-40"
          >
            Re-refinar a partir das fontes →
          </button>
        </div>
        <p className="mt-1 text-xs text-[#54656f]">
          Delete uma fonte e re-refine pra rebuildar a KB sem o conteúdo dela. Gera um rascunho
          pra revisar antes de salvar (edições manuais da versão atual não são preservadas).
        </p>
        {sources.length === 0 ? (
          <p className="mt-3 text-xs text-[#9aa6ad]">Nenhuma fonte registrada.</p>
        ) : (
          <ul className="mt-3 space-y-1.5">
            {sources.map((s) => (
              <li
                key={s.id}
                className="flex items-center justify-between gap-3 rounded-lg border border-black/5 bg-[#f8f9fa] px-3 py-2 text-xs"
              >
                <span className="min-w-0 truncate">
                  📄 {s.filename ?? "fonte"}{" "}
                  <span className="text-[#9aa6ad]">
                    · {s.chars} caracteres · {new Date(s.createdAt).toLocaleDateString("pt-BR")}
                  </span>
                </span>
                <button
                  onClick={() => deleteSource(s.id)}
                  disabled={busy}
                  className="shrink-0 rounded-md px-2 py-1 font-medium text-red-600 transition hover:bg-red-50 disabled:opacity-40"
                >
                  deletar
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* KB ATIVA + HISTÓRICO */}
      <section className="rounded-xl border border-black/5 bg-white p-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold">
            {doc.title} — ativa: v{active?.version ?? "?"}
          </h2>
          <div className="flex items-center gap-3">
            <button
              onClick={editActive}
              disabled={!active || busy}
              className="text-xs font-medium text-[#008069] hover:underline disabled:opacity-40"
            >
              editar base ativa
            </button>
            <button
              onClick={() => setShowActive((s) => !s)}
              className="text-xs text-[#008069] hover:underline"
            >
              {showActive ? "ocultar conteúdo" : "ver conteúdo ativo"}
            </button>
          </div>
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
