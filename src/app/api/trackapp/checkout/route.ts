import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

import { AFFILIATE_REF_COOKIE } from "@/lib/trackapp/affiliate/config";
import { attachReferrerIfEligible, resolveReferrerByCode } from "@/lib/trackapp/affiliate/referral";
import { createAdminClient } from "@/lib/supabase/admin";
import { getStripe } from "@/lib/stripe";

export async function POST() {
  const stripe = getStripe();
  const price =
    process.env.STRIPE_PRICE_ID_TRACKAPP?.trim()
    ?? process.env.STRIPE_PRICE_ID_MONTHLY?.trim()
    ?? "";

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const originRaw = process.env.NEXT_PUBLIC_APP_URL?.trim();

  if (!stripe) {
    return NextResponse.json({ error: "Stripe non configuré (STRIPE_SECRET_KEY)." }, { status: 503 });
  }
  if (!price) {
    return NextResponse.json(
      { error: "Définir STRIPE_PRICE_ID_TRACKAPP ou STRIPE_PRICE_ID_MONTHLY dans .env.local." },
      { status: 400 },
    );
  }
  if (!supabaseUrl || !supabaseAnon) {
    return NextResponse.json({ error: "Supabase (URL / anon) manquant pour authentifier l’utilisateur." }, { status: 503 });
  }

  const cookieStore = await cookies();
  const supabase = createServerClient(supabaseUrl, supabaseAnon, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) => {
            cookieStore.set(name, value, options);
          });
        } catch {
          /* ignore cookie write edge cases */
        }
      },
    },
  });

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user?.id || !user.email) {
    return NextResponse.json({ error: "Connexion Trackapp requise." }, { status: 401 });
  }

  const origin =
    originRaw ?
      /^https?:\/\//i.test(originRaw) ?
        originRaw.replace(/\/$/, "")
      : `http://${originRaw.replace(/\/$/, "")}`
    : "http://127.0.0.1:3000";

  const metadata: Record<string, string> = {
    supabase_user_id: user.id,
    product: "trackapp_full_playbook",
  };

  const refCode = cookieStore.get(AFFILIATE_REF_COOKIE)?.value?.trim();
  const admin = createAdminClient();
  if (refCode && admin) {
    const referrer = await resolveReferrerByCode(admin, refCode);
    if (referrer && referrer.id !== user.id) {
      metadata.referrer_user_id = referrer.id;
      metadata.referral_code = refCode.toLowerCase();
      await attachReferrerIfEligible(admin, user.id, refCode);
    }
  }

  try {
    const sessionStripe = await stripe.checkout.sessions.create({
      mode: "subscription",
      customer_email: user.email,
      line_items: [{ price, quantity: 1 }],
      success_url: `${origin}/trackapp/espace?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/trackapp/accueil`,
      allow_promotion_codes: true,
      metadata,
    });

    if (!sessionStripe.url) {
      return NextResponse.json({ error: "Stripe n’a pas retourné d’URL de paiement." }, { status: 502 });
    }

    return NextResponse.json({ url: sessionStripe.url });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Stripe rejected checkout.";
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
