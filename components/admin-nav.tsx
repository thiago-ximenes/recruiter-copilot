import Link from "next/link";

export type AdminTab = "prompts" | "kb" | "leads" | "gaps";

const TABS: { href: string; label: string; key: AdminTab }[] = [
  { href: "/admin", label: "Prompts", key: "prompts" },
  { href: "/admin/kb", label: "Base de Conhecimento", key: "kb" },
  { href: "/admin/leads", label: "Leads", key: "leads" },
  { href: "/admin/gaps", label: "Gaps", key: "gaps" },
];

export function AdminNav({ active }: { active: AdminTab }) {
  return (
    <header className="flex items-center justify-between border-b border-black/5 bg-white px-5 py-3">
      <div className="flex items-center gap-1">
        <span className="mr-2">🔒</span>
        {TABS.map((t) => (
          <Link
            key={t.key}
            href={t.href}
            className={`rounded-full px-3 py-1.5 text-sm font-medium transition ${
              active === t.key
                ? "bg-[#008069] text-white"
                : "text-[#54656f] hover:bg-[#f0f2f5]"
            }`}
          >
            {t.label}
          </Link>
        ))}
      </div>
      <div className="flex items-center gap-3">
        <Link href="/admin/logout" prefetch={false} className="text-xs text-[#54656f] hover:text-[#008069]">
          Sair
        </Link>
        <Link href="/" className="text-xs text-[#54656f] hover:text-[#008069]">
          ‹ Voltar à conversa
        </Link>
      </div>
    </header>
  );
}
