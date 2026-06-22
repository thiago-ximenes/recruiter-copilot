import { AdminNav } from "@/components/admin-nav";
import { listLeads } from "@/lib/leads/repo";
import { formatBRT } from "@/lib/format";
import { deleteLeadAction } from "./actions";

export const dynamic = "force-dynamic";

export default async function LeadsAdminPage() {
  const leads = await listLeads();

  return (
    <div className="min-h-[100dvh] bg-[#f0f2f5] text-[#111b21]">
      <AdminNav active="leads" />
      <main className="mx-auto max-w-5xl p-4 sm:p-6">
        <p className="mb-4 text-xs text-[#54656f]">
          Recrutadores que deixaram contato durante a conversa. Capturados automaticamente
          quando a mensagem traz um contato (email, telefone, link).
        </p>

        {leads.length === 0 ? (
          <div className="rounded-xl border border-black/5 bg-white p-10 text-center text-sm text-[#54656f]">
            Nenhum lead ainda.
          </div>
        ) : (
          <div className="overflow-hidden rounded-xl border border-black/5 bg-white">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-black/5 text-left text-xs uppercase tracking-wide text-[#54656f]">
                  <th className="px-4 py-3 font-medium">Quando</th>
                  <th className="px-4 py-3 font-medium">Nome</th>
                  <th className="px-4 py-3 font-medium">Empresa</th>
                  <th className="px-4 py-3 font-medium">Cargo</th>
                  <th className="px-4 py-3 font-medium">Contato</th>
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody>
                {leads.map((l) => (
                  <tr key={l.id} className="border-b border-black/5 last:border-0">
                    <td className="whitespace-nowrap px-4 py-3 text-[#54656f]">{formatBRT(l.createdAt)}</td>
                    <td className="px-4 py-3">{l.name ?? "—"}</td>
                    <td className="px-4 py-3">{l.company ?? "—"}</td>
                    <td className="px-4 py-3">{l.role ?? "—"}</td>
                    <td className="px-4 py-3 font-medium text-[#008069]">{l.contact ?? "—"}</td>
                    <td className="px-4 py-3 text-right">
                      <form action={deleteLeadAction}>
                        <input type="hidden" name="id" value={l.id} />
                        <button
                          type="submit"
                          className="rounded-md px-2 py-1 text-xs text-red-600 transition hover:bg-red-50"
                        >
                          Remover
                        </button>
                      </form>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </main>
    </div>
  );
}
