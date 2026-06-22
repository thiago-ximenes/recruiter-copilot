"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { ADMIN_COOKIE, authConfigured, sessionToken } from "@/lib/auth";

export async function loginAction(formData: FormData) {
  const password = String(formData.get("password") ?? "");
  const next = String(formData.get("next") ?? "/admin") || "/admin";

  if (!authConfigured()) redirect(next);
  if (password !== process.env.ADMIN_PASSWORD) {
    redirect(`/admin/login?error=1&next=${encodeURIComponent(next)}`);
  }

  const store = await cookies();
  store.set(ADMIN_COOKIE, await sessionToken(), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
  });
  redirect(next.startsWith("/admin") ? next : "/admin");
}
