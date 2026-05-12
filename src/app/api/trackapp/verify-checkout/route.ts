import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import type Stripe from "stripe";

import {
  billingIdsFromCheckoutSession,
  persistTrackappPremium,
} from "@/lib/trackapp/stripe-sync";
import { getStripe } from "@/lib/stripe";

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
  if (error || !user?.id) {
    return NextResponse.json({ detail: "Session Trackapp nécessaire." }, { status: 401 });
  }

  let session: Stripe.Checkout.Session | null = null;
  try {
    session = await stripe.checkout.sessions.retrieve(sessionId, {
      expand: ["subscription", "customer"],
    });
  } catch {
    return NextResponse.json({ detail: "Session Stripe invalide ou expirée." }, { status: 404 });
  }

  if (!session) {
    return NextResponse.json({ detail: "Session introuvable." }, { status: 404 });
  }

  const metadataUser =
    typeof session.metadata?.supabase_user_id === "string" ? session.metadata.supabase_user_id : null;
  const productOk = session.metadata?.product === "trackapp_full_playbook";
  if (!productOk || metadataUser !== user.id) {
    return NextResponse.json({ detail: "Cette session Trackapp est invalide." }, { status: 403 });
  }

  const paid =
    session.payment_status === "paid"
    || session.payment_status === "no_payment_required"
    || session.status === "complete";

  if (!paid) {
    return NextResponse.json({ detail: "Paiement non finalisé côté Stripe." }, { status: 402 });
  }

  const billing = billingIdsFromCheckoutSession(session);
  const persisted = await persistTrackappPremium({
    userId: user.id,
    stripeCustomerId: billing.customerId,
    stripeSubscriptionId: billing.subscriptionId,
  });

  if (!persisted) {
    return NextResponse.json(
      {
        detail: "Impossible de consigner la souscription Trackapp. Réessayez dans un instant.",
      },
      { status: 503 },
    );
  }

  return NextResponse.json({ ok: true });
}
