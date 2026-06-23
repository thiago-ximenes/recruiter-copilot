import Link from "next/link";
import { AdminNav } from "@/components/admin-nav";
import { ChatMarkdown } from "@/components/chat-markdown";
import { getConversation } from "@/lib/conversations/repo";
import { formatBRT } from "@/lib/format";

export const dynamic = "force-dynamic";

type Trace = {
  route?: string;
  safe?: boolean;
  verified?: boolean;
  retrievedChunks?: number;
  leadCaptured?: boolean;
  gapCaptured?: boolean;
};

export default async function ConversationDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const data = await getConversation(Number(id));

  return (
    <div className="min-h-[100dvh] bg-[#f0f2f5] text-[#111b21]">
      <AdminNav active="conversations" />
      <main className="mx-auto max-w-3xl p-4 sm:p-6">
        <Link href="/admin/conversations" className="text-xs text-[#008069] hover:underline">
          ‹ Voltar às conversas
        </Link>

        {!data ? (
          <p className="mt-4 text-sm text-red-600">Conversa não encontrada.</p>
        ) : (
          <>
            <div className="mt-3 mb-4 flex flex-wrap items-center justify-between gap-2">
              <h1 className="text-sm font-semibold">
                Conversa #{data.conversation.id} · {formatBRT(data.conversation.createdAt)}
              </h1>
              {data.lead && (
                <Link
                  href="/admin/leads"
                  className="rounded-full bg-[#008069]/10 px-2.5 py-1 text-xs font-medium text-[#008069]"
                >
                  🤝 lead: {data.lead.name ?? data.lead.contact ?? "ver"}
                </Link>
              )}
            </div>

            <div className="space-y-2 rounded-xl border border-black/5 bg-white p-4">
              {data.messages.map((m) => {
                const trace = (m.trace ?? null) as Trace | null;
                return (
                  <div
                    key={m.id}
                    className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}
                  >
                    <div
                      className={`max-w-[85%] rounded-lg px-3 py-2 text-sm ${
                        m.role === "user"
                          ? "bg-[#d9fdd3] text-[#111b21]"
                          : "bg-[#f0f2f5] text-[#111b21]"
                      }`}
                    >
                      {m.role === "assistant" ? (
                        <ChatMarkdown>{m.content}</ChatMarkdown>
                      ) : (
                        <p className="whitespace-pre-wrap">{m.content}</p>
                      )}
                      {trace && (
                        <div className="mt-1.5 flex flex-wrap gap-1 border-t border-black/5 pt-1 text-[10px] text-[#54656f]">
                          {trace.safe === false && (
                            <span className="rounded-full bg-red-100 px-1.5 py-0.5 text-red-700">
                              🛡️ bloqueado
                            </span>
                          )}
                          {trace.route && (
                            <span className="rounded-full bg-black/5 px-1.5 py-0.5">🧭 {trace.route}</span>
                          )}
                          {typeof trace.retrievedChunks === "number" && trace.retrievedChunks > 0 && (
                            <span className="rounded-full bg-black/5 px-1.5 py-0.5">
                              📚 RAG ({trace.retrievedChunks})
                            </span>
                          )}
                          {trace.verified && (
                            <span className="rounded-full bg-[#008069]/10 px-1.5 py-0.5 text-[#008069]">
                              ✓ verificado
                            </span>
                          )}
                          {trace.leadCaptured && (
                            <span className="rounded-full bg-[#008069]/10 px-1.5 py-0.5 text-[#008069]">
                              🤝 lead
                            </span>
                          )}
                          {trace.gapCaptured && (
                            <span className="rounded-full bg-amber-500/10 px-1.5 py-0.5 text-amber-700">
                              📝 gap
                            </span>
                          )}
                        </div>
                      )}
                      <p className="mt-1 text-[10px] text-[#9aa6ad]">{formatBRT(m.createdAt)}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </main>
    </div>
  );
}
