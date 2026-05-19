import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

import { processCheckoutSessionCommission } from "@/lib/trackapp/affiliate/commissions";
import { linkCheckoutSessionToUser } from "@/lib/trackapp/stripe-sync";
import { createAdminClient } from "@/lib/supabase/admin";
import { getStripe } from "@/lib/stripe";

/** Rétrocompatibilité : lie une session au compte connecté. */
export async function POST(req: Request) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ detail: "JSON invalide." }, { status: 400 });
  }

  const sessionId =
    typeof body === "object" && body && "session_id" in body && typeof (body as { session_id: unknown }).session_id === "string"
      ?
        (body as { session_id: string }).session_id
      : null;

  if (!sessionId?.trim()) {
    return NextResponse.json({ detail: "session_id obligatoire." }, { status: 400 });
  }

  const stripe = getStripe();
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!stripe) {
    return NextResponse.json({ detail: "Stripe non configuré." }, { status: 503 });
  }
  if (!supabaseUrl || !anon) {
    return NextResponse.json({ detail: "Supabase incomplet." }, { status: 503 });
  }

  const cookieStore = await cookies();
  const sb = createServerClient(supabaseUrl, anon, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookieList) {
        cookieList.forEach(({ name, value, options }) => {
          cookieStore.set(name, value, options);
        });
      },
    },
  });

  const {
    data: { user },
    error,
  } = await sb.auth.getUser();
  if (error || !user?.id || !user.email) {
    return NextResponse.json({ detail: "Session Trackapp nécessaire." }, { status: 401 });
  }

  let session;
  try {
    session = await stripe.checkout.sessions.retrieve(sessionId, {
      expand: ["subscription", "customer"],
    });
  } catch {
    return NextResponse.json({ detail: "Session Stripe invalide ou expirée." }, { status: 404 });
  }

  const link = await linkCheckoutSessionToUser({
    session,
    userId: user.id,
    userEmail: user.email,
  });

  if (!link.ok) {
    return NextResponse.json({ detail: link.error }, { status: 403 });
  }

  const admin = createAdminClient();
  if (admin) {
    await processCheckoutSessionCommission(admin, session);
  }

  return NextResponse.json({ ok: true });
}
