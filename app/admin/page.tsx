import { getAllPromptsWithVersions } from "@/lib/prompts/repo";
import { AdminPrompts } from "@/components/admin-prompts";
import { AdminNav } from "@/components/admin-nav";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const prompts = await getAllPromptsWithVersions();

  return (
    <div className="min-h-[100dvh] bg-[#f0f2f5] text-[#111b21]">
      <AdminNav active="prompts" />
      <main className="mx-auto max-w-5xl p-4 sm:p-6">
        <p className="mb-4 text-xs text-[#54656f]">
          Cada edição cria uma nova versão (append-only). O agente usa sempre a versão ativa.
          É possível voltar (rollback) para qualquer versão anterior sem perder o histórico.
        </p>
        <AdminPrompts prompts={prompts} />
      </main>
    </div>
  );
}
