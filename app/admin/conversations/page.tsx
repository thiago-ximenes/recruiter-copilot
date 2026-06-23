import Link from "next/link";
import { AdminNav } from "@/components/admin-nav";
import { listConversations } from "@/lib/conversations/repo";
import { formatBRT } from "@/lib/format";
import { deleteConversationAction } from "./actions";

export const dynamic = "force-dynamic";

export default async function ConversationsAdminPage() {
  const conversations = await listConversations();

  return (
    <div className="min-h-[100dvh] bg-[#f0f2f5] text-[#111b21]">
      <AdminNav active="conversations" />
      <main className="mx-auto max-w-5xl p-4 sm:p-6">
        <p className="mb-4 text-xs text-[#54656f]">
          Transcrições das conversas com recrutadores. Clique para ver as mensagens e o raciocínio
          do agente. Quando há contato, o lead aparece vinculado.
        </p>

        {conversations.length === 0 ? (
          <div className="rounded-xl border border-black/5 bg-white p-10 text-center text-sm text-[#54656f]">
            Nenhuma conversa ainda.
          </div>
        ) : (
          <ul className="space-y-2">
            {conversations.map((c) => (
              <li
                key={c.id}
                className="flex items-center justify-between gap-3 rounded-xl border border-black/5 bg-white px-4 py-3"
              >
                <Link href={`/admin/conversations/${c.id}`} className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">{c.firstMessage ?? "(sem mensagem)"}</p>
                  <p className="mt-0.5 text-xs text-[#54656f]">
                    {formatBRT(c.createdAt)} · {c.messageCount} msgs · {c.lang ?? "pt"}
                    {c.leadId && (
                      <span className="ml-2 rounded-full bg-[#008069]/10 px-1.5 py-0.5 text-[10px] font-medium text-[#008069]">
                        🤝 lead
                      </span>
                    )}
                  </p>
                </Link>
                <form action={deleteConversationAction}>
                  <input type="hidden" name="id" value={c.id} />
                  <button
                    type="submit"
                    className="shrink-0 rounded-md px-2 py-1 text-xs text-red-600 transition hover:bg-red-50"
                  >
                    Remover
                  </button>
                </form>
              </li>
            ))}
          </ul>
        )}
      </main>
    </div>
  );
}
