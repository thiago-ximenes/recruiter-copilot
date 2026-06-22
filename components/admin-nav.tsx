import Link from "next/link";

const TABS = [
  { href: "/admin", label: "Prompts", key: "prompts" },
  { href: "/admin/kb", label: "Base de Conhecimento", key: "kb" },
];

export function AdminNav({ active }: { active: "prompts" | "kb" }) {
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
        <span className="ml-2 rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-medium text-amber-700">
          sem auth (TODO)
        </span>
      </div>
      <Link href="/" className="text-xs text-[#54656f] hover:text-[#008069]">
        ‹ Voltar à conversa
      </Link>
    </header>
  );
}
