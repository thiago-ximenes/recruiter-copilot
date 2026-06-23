import { getKbDoc, listSources } from "@/lib/kb/repo";
import { KbFunnel } from "@/components/kb-funnel";
import { AdminNav } from "@/components/admin-nav";

export const dynamic = "force-dynamic";

export default async function KbAdminPage() {
  const [doc, sources] = await Promise.all([getKbDoc(), listSources()]);

  return (
    <div className="min-h-[100dvh] bg-[#f0f2f5] text-[#111b21]">
      <AdminNav active="kb" />
      <main className="mx-auto max-w-5xl p-4 sm:p-6">
        <p className="mb-4 text-xs text-[#54656f]">
          Funil: suba um PDF de CV ou cole texto → a IA refina em fatos canônicos (com gaps
          honestos) → você revisa/edita → salva como nova versão ativa. A versão ativa é o
          grounding do agente. Histórico e rollback preservados.
        </p>
        {doc ? (
          <KbFunnel doc={doc} sources={sources} />
        ) : (
          <p className="text-sm text-red-600">
            KB não encontrada — rode <code>npm run db:seed</code>.
          </p>
        )}
      </main>
    </div>
  );
}
