"use client";

import { useMemo, useState, useTransition } from "react";
import type { PromptWithVersions } from "@/lib/prompts/repo";
import { rollbackPromptAction, savePromptAction } from "@/app/admin/actions";

export function AdminPrompts({ prompts }: { prompts: PromptWithVersions[] }) {
  const [selectedKey, setSelectedKey] = useState(prompts[0]?.key ?? "");
  const selected = useMemo(
    () => prompts.find((p) => p.key === selectedKey) ?? prompts[0],
    [prompts, selectedKey],
  );

  if (!selected) return <p className="text-sm text-[#54656f]">Nenhum prompt encontrado.</p>;

  return (
    <div className="grid gap-4 sm:grid-cols-[220px_1fr]">
      {/* lista */}
      <nav className="h-fit overflow-hidden rounded-xl border border-black/5 bg-white">
        {prompts.map((p) => {
          const active = p.key === selected.key;
          return (
            <button
              key={p.key}
              onClick={() => setSelectedKey(p.key)}
              className={`block w-full border-b border-black/5 px-3 py-2.5 text-left text-sm last:border-0 transition ${
                active ? "bg-[#008069] text-white" : "hover:bg-[#f0f2f5]"
              }`}
            >
              <span className="block font-medium leading-tight">{p.name}</span>
              <span className={`text-[11px] ${active ? "text-white/70" : "text-[#54656f]"}`}>
                {p.key} · v{p.versions.find((v) => v.id === p.activeVersionId)?.version ?? "?"}
              </span>
            </button>
          );
        })}
      </nav>

      {/* editor */}
      <PromptDetail key={selected.key} prompt={selected} />
    </div>
  );
}

function PromptDetail({ prompt }: { prompt: PromptWithVersions }) {
  const activeVersion = prompt.versions.find((v) => v.id === prompt.activeVersionId);
  const [content, setContent] = useState(activeVersion?.content ?? "");
  const [note, setNote] = useState("");
  const [pending, startTransition] = useTransition();
  const [msg, setMsg] = useState<string | null>(null);

  const dirty = content !== (activeVersion?.content ?? "");

  function save() {
    setMsg(null);
    startTransition(async () => {
      try {
        await savePromptAction(prompt.key, content, note);
        setNote("");
        setMsg("✓ nova versão salva e ativada");
      } catch (e) {
        setMsg(`erro: ${(e as Error).message}`);
      }
    });
  }

  function rollback(versionId: number) {
    setMsg(null);
    startTransition(async () => {
      try {
        await rollbackPromptAction(prompt.key, versionId);
        setMsg("✓ rollback aplicado");
      } catch (e) {
        setMsg(`erro: ${(e as Error).message}`);
      }
    });
  }

  return (
    <section className="rounded-xl border border-black/5 bg-white p-4">
      <div className="mb-1 flex items-center justify-between">
        <h2 className="text-sm font-semibold">{prompt.name}</h2>
        <span className="text-[11px] text-[#54656f]">
          ativo: v{activeVersion?.version ?? "?"}
        </span>
      </div>
      {prompt.description && (
        <p className="mb-3 text-xs text-[#54656f]">{prompt.description}</p>
      )}

      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        rows={12}
        className="w-full resize-y rounded-lg border border-black/10 bg-[#f8f9fa] p-3 font-mono text-[12.5px] leading-relaxed outline-none focus:border-[#008069]"
      />

      <div className="mt-3 flex flex-wrap items-center gap-2">
        <input
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="nota da mudança (opcional)"
          className="min-w-0 flex-1 rounded-lg border border-black/10 px-3 py-2 text-sm outline-none focus:border-[#008069]"
        />
        <button
          onClick={save}
          disabled={!dirty || pending}
          className="rounded-lg bg-[#008069] px-4 py-2 text-sm font-medium text-white transition disabled:cursor-not-allowed disabled:opacity-40"
        >
          {pending ? "salvando…" : "Salvar nova versão"}
        </button>
        {msg && <span className="text-xs text-[#54656f]">{msg}</span>}
      </div>

      {/* histórico */}
      <div className="mt-5">
        <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-[#54656f]">
          Histórico ({prompt.versions.length})
        </h3>
        <ul className="space-y-1.5">
          {prompt.versions.map((v) => {
            const isActive = v.id === prompt.activeVersionId;
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
                    disabled={pending}
                    className="shrink-0 rounded-md border border-[#008069]/30 px-2.5 py-1 font-medium text-[#008069] transition hover:bg-[#008069] hover:text-white disabled:opacity-40"
                  >
                    Rollback
                  </button>
                )}
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
