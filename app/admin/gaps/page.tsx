import { AdminNav } from "@/components/admin-nav";
import { listGaps } from "@/lib/gaps/repo";
import { formatBRT } from "@/lib/format";
import { deleteGapAction, resolveGapAction } from "./actions";

export const dynamic = "force-dynamic";

export default async function GapsAdminPage() {
  const gaps = await listGaps();
  const open = gaps.filter((g) => !g.resolvedAt);
  const resolved = gaps.filter((g) => g.resolvedAt);

  return (
    <div className="min-h-[100dvh] bg-[#f0f2f5] text-[#111b21]">
      <AdminNav active="gaps" />
      <main className="mx-auto max-w-5xl p-4 sm:p-6">
        <p className="mb-4 text-xs text-[#54656f]">
          Perguntas que o agente não soube responder por falta de fato na base. Use pra
          alimentar a KB ou se preparar — marque como resolvido quando tratar.
        </p>

        {gaps.length === 0 ? (
          <div className="rounded-xl border border-black/5 bg-white p-10 text-center text-sm text-[#54656f]">
            Nenhum gap registrado.
          </div>
        ) : (
          <div className="space-y-6">
            <section>
              <h2 className="mb-2 text-xs font-semibold uppercase tracking-wide text-amber-700">
                Abertos ({open.length})
              </h2>
              <div className="space-y-2">
                {open.map((g) => (
                  <article key={g.id} className="rounded-xl border border-amber-200 bg-white p-4">
                    <p className="text-sm font-medium">{g.question}</p>
                    {g.reason && <p className="mt-1 text-xs text-[#54656f]">{g.reason}</p>}
                    <div className="mt-3 flex items-center justify-between text-xs text-[#54656f]">
                      <span>{formatBRT(g.createdAt)}</span>
                      <div className="flex gap-2">
                        <form action={resolveGapAction}>
                          <input type="hidden" name="id" value={g.id} />
                          <button
                            type="submit"
                            className="rounded-md bg-[#008069] px-2 py-1 text-xs font-medium text-white transition hover:bg-[#006d5a]"
                          >
                            Marcar resolvido
                          </button>
                        </form>
                        <form action={deleteGapAction}>
                          <input type="hidden" name="id" value={g.id} />
                          <button type="submit" className="rounded-md px-2 py-1 text-xs text-red-600 transition hover:bg-red-50">
                            Remover
                          </button>
                        </form>
                      </div>
                    </div>
                  </article>
                ))}
                {open.length === 0 && <p className="text-sm text-[#54656f]">Tudo tratado. 🎉</p>}
              </div>
            </section>

            {resolved.length > 0 && (
              <section>
                <h2 className="mb-2 text-xs font-semibold uppercase tracking-wide text-[#54656f]">
                  Resolvidos ({resolved.length})
                </h2>
                <div className="space-y-2 opacity-60">
                  {resolved.map((g) => (
                    <article key={g.id} className="rounded-xl border border-black/5 bg-white p-4">
                      <p className="text-sm line-through">{g.question}</p>
                      <div className="mt-2 flex items-center justify-between text-xs text-[#54656f]">
                        <span>resolvido {g.resolvedAt ? formatBRT(g.resolvedAt) : ""}</span>
                        <form action={deleteGapAction}>
                          <input type="hidden" name="id" value={g.id} />
                          <button type="submit" className="rounded-md px-2 py-1 text-xs text-red-600 transition hover:bg-red-50">
                            Remover
                          </button>
                        </form>
                      </div>
                    </article>
                  ))}
                </div>
              </section>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
