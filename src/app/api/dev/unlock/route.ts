import { NextResponse } from "next/server";
import { MEMBER_COOKIE, signMemberSession } from "@/lib/session";

export async function POST() {
  if (process.env.NODE_ENV === "production") {
    return NextResponse.json({ error: "Non disponible en production." }, { status: 403 });
  }

  const token = await signMemberSession("dev@local.test");
  const res = NextResponse.json({ ok: true });
  res.cookies.set(MEMBER_COOKIE, token, {
    httpOnly: true,
    secure: false,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 24 * 60 * 60,
  });
  return res;
}
