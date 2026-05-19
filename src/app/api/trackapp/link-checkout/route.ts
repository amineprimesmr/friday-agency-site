import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

import { processCheckoutSessionCommission } from "@/lib/trackapp/affiliate/commissions";
import { attachReferrerIfEligible } from "@/lib/trackapp/affiliate/referral";
import { linkCheckoutSessionToUser } from "@/lib/trackapp/stripe-sync";
import { createAdminClient } from "@/lib/supabase/admin";
import { getStripe } from "@/lib/stripe";

/** Lie une session Stripe payée au compte Supabase connecté (Google ou e-mail). */
export async function POST(req: Request) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "JSON invalide." }, { status: 400 });
  }

  const sessionId =
    typeof body === "object" && body && "session_id" in body && typeof (body as { session_id: unknown }).session_id === "string"
      ?
        (body as { session_id: string }).session_id.trim()
      : "";

  const firstNameRaw =
    typeof body === "object" && body && "first_name" in body && typeof (body as { first_name: unknown }).first_name === "string"
      ? (body as { first_name: string }).first_name.trim().slice(0, 80)
      : "";

  if (!sessionId) {
    return NextResponse.json({ error: "session_id obligatoire." }, { status: 400 });
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !anon) {
    return NextResponse.json({ error: "Supabase incomplet." }, { status: 503 });
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
    error: userErr,
  } = await sb.auth.getUser();

  if (userErr || !user?.id || !user.email) {
    return NextResponse.json({ error: "Connecte-toi pour finaliser ton compte." }, { status: 401 });
  }

  const stripe = getStripe();
  if (!stripe) {
    return NextResponse.json({ error: "Stripe non configuré." }, { status: 503 });
  }

  let session;
  try {
    session = await stripe.checkout.sessions.retrieve(sessionId, {
      expand: ["subscription", "customer"],
    });
  } catch {
    return NextResponse.json({ error: "Session Stripe invalide." }, { status: 404 });
  }

  const link = await linkCheckoutSessionToUser({
    session,
    userId: user.id,
    userEmail: user.email,
  });

  if (!link.ok) {
    return NextResponse.json({ error: link.error }, { status: 403 });
  }

  const admin = createAdminClient();
  if (admin) {
    if (firstNameRaw.length >= 2) {
      await admin.auth.admin.updateUserById(user.id, {
        user_metadata: {
          ...user.user_metadata,
          first_name: firstNameRaw,
          full_name: firstNameRaw,
        },
      });
    }

    const refCode = session.metadata?.referral_code?.trim();
    if (refCode) {
      await attachReferrerIfEligible(admin, user.id, refCode);
    }

    await processCheckoutSessionCommission(admin, session);
  }

  return NextResponse.json({ ok: true, redirect: "/trackapp/accueil" });
}
