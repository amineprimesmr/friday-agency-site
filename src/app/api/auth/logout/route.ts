import { NextResponse } from "next/server";
import { MEMBER_COOKIE } from "@/lib/session";

function redirectHome(req: Request) {
  const origin = process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, "") ?? new URL(req.url).origin;
  return NextResponse.redirect(new URL("/", origin));
}

export async function GET(req: Request) {
  const res = redirectHome(req);
  res.cookies.set(MEMBER_COOKIE, "", { httpOnly: true, path: "/", maxAge: 0 });
  return res;
}

export async function POST(req: Request) {
  const res = redirectHome(req);
  res.cookies.set(MEMBER_COOKIE, "", { httpOnly: true, path: "/", maxAge: 0 });
  return res;
}
