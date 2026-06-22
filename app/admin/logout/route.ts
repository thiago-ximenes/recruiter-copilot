import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { ADMIN_COOKIE } from "@/lib/auth";

export async function GET(req: Request) {
  const store = await cookies();
  store.delete(ADMIN_COOKIE);
  return NextResponse.redirect(new URL("/admin/login", req.url));
}
