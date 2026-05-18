import { NextResponse } from "next/server";
import { getStripe } from "@/lib/stripe";
import { MEMBER_COOKIE, signMemberSession } from "@/lib/session";

export async function GET(req: Request) {
  const stripe = getStripe();
  const sessionId = new URL(req.url).searchParams.get("session_id");

  const origin =
    process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, "") ?? new URL(req.url).origin;

  if (!stripe || !sessionId) {
    return NextResponse.redirect(new URL("/pricing?error=session", origin));
  }

  const session = await stripe.checkout.sessions.retrieve(sessionId);
  const email =
    session.customer_details?.email ??
    (typeof session.customer_email === "string" ? session.customer_email : null) ??
    "member@trackapp.app";

  const token = await signMemberSession(email);

  const res = NextResponse.redirect(new URL("/dashboard", origin));
  res.cookies.set(MEMBER_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 24 * 60 * 60,
  });

  return res;
}
