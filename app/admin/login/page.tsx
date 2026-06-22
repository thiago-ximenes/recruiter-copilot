import { authConfigured } from "@/lib/auth";
import { loginAction } from "./actions";

export const dynamic = "force-dynamic";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; next?: string }>;
}) {
  const { error, next } = await searchParams;
  const configured = authConfigured();

  return (
    <div className="flex min-h-[100dvh] items-center justify-center bg-[#f0f2f5] px-4 text-[#111b21]">
      <div className="w-full max-w-sm rounded-2xl border border-black/5 bg-white p-8 shadow-sm">
        <h1 className="text-lg font-semibold">Admin · Recruiter Copilot</h1>
        <p className="mt-1 text-sm text-[#54656f]">Acesso restrito.</p>

        {!configured ? (
          <p className="mt-6 rounded-lg bg-amber-50 p-3 text-xs text-amber-700">
            Auth não configurada (defina <code>ADMIN_PASSWORD</code> e{" "}
            <code>ADMIN_SESSION_SECRET</code>). O admin está aberto.
          </p>
        ) : (
          <form action={loginAction} className="mt-6 space-y-3">
            <input type="hidden" name="next" value={next ?? "/admin"} />
            <input
              type="password"
              name="password"
              autoFocus
              required
              placeholder="Senha"
              className="w-full rounded-lg border border-black/10 bg-white px-3 py-2 text-sm outline-none focus:border-[#008069]"
            />
            {error && <p className="text-xs text-red-600">Senha incorreta.</p>}
            <button
              type="submit"
              className="w-full rounded-lg bg-[#008069] px-3 py-2 text-sm font-medium text-white transition hover:bg-[#006d5a]"
            >
              Entrar
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
