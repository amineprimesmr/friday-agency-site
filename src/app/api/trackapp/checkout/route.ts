import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import type Stripe from "stripe";

import { AFFILIATE_REF_COOKIE } from "@/lib/trackapp/affiliate/config";
import { attachReferrerIfEligible, resolveReferrerByCode } from "@/lib/trackapp/affiliate/referral";
import { createAdminClient } from "@/lib/supabase/admin";
import { getStripe } from "@/lib/stripe";

export async function POST(req: Request) {
  const stripe = getStripe();

  type BillingPlan = "monthly" | "yearly";
  let plan: BillingPlan = "monthly";
  let billingFirstName = "";
  let billingLastName = "";
  let billingEmailFromClient = "";
  try {
    const ct = req.headers.get("content-type") ?? "";
    if (ct.includes("application/json")) {
      const body = (await req.json()) as {
        plan?: unknown;
        billingFirstName?: unknown;
        billingLastName?: unknown;
        billingEmail?: unknown;
      };
      if (body?.plan === "yearly") plan = "yearly";
      if (typeof body?.billingFirstName === "string") {
        billingFirstName = body.billingFirstName.trim().slice(0, 80);
      }
      if (typeof body?.billingLastName === "string") {
        billingLastName = body.billingLastName.trim().slice(0, 80);
      }
      if (typeof body?.billingEmail === "string") {
        billingEmailFromClient = body.billingEmail.trim().slice(0, 320);
      }
    }
  } catch {
    plan = "monthly";
  }

  const priceMonthly =
    process.env.STRIPE_PRICE_ID_TRACKAPP?.trim()
    ?? process.env.STRIPE_PRICE_ID_MONTHLY?.trim()
    ?? "";
  const priceYearly = process.env.STRIPE_PRICE_ID_YEARLY?.trim() ?? "";

  const price = plan === "yearly" ? priceYearly : priceMonthly;

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const originRaw = process.env.NEXT_PUBLIC_APP_URL?.trim();

  if (!stripe) {
    return NextResponse.json({ error: "Stripe non configuré (STRIPE_SECRET_KEY)." }, { status: 503 });
  }
  if (!price) {
    const msg =
      plan === "yearly" ?
        "Définir STRIPE_PRICE_ID_YEARLY dans .env (abonnement annuel 99 € / an)."
      : "Définir STRIPE_PRICE_ID_TRACKAPP ou STRIPE_PRICE_ID_MONTHLY dans .env.local (abonnement 39 € / mois).";
    return NextResponse.json({ error: msg }, { status: 400 });
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

  if (!billingFirstName || !billingLastName) {
    return NextResponse.json({ error: "Prénom et nom sont requis pour continuer." }, { status: 400 });
  }
  const clientEmail = billingEmailFromClient.toLowerCase();
  const accountEmail = user.email.trim().toLowerCase();
  if (!clientEmail || clientEmail !== accountEmail) {
    return NextResponse.json(
      { error: "Utilise l’adresse e-mail de ton compte Trackapp (celle avec laquelle tu es connecté)." },
      { status: 400 },
    );
  }

  const origin =
    originRaw ?
      /^https?:\/\//i.test(originRaw) ?
        originRaw.replace(/\/$/, "")
      : `http://${originRaw.replace(/\/$/, "")}`
    : "http://127.0.0.1:3000";

  const metadata: Record<string, string> = {
    supabase_user_id: user.id,
    product: "trackapp_full_access",
    trackapp_plan: plan === "yearly" ? "subscription_yearly" : "subscription_monthly",
    billing_first_name: billingFirstName,
    billing_last_name: billingLastName,
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
    const referralFriendCoupon = process.env.STRIPE_COUPON_ID_REFERRAL_FRIEND?.trim();

    const sessionParams: Stripe.Checkout.SessionCreateParams = {
      mode: "subscription",
      customer_email: user.email,
      line_items: [{ price, quantity: 1 }],
      success_url: `${origin}/trackapp/accueil?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/trackapp/paiement`,
      metadata,
    };

    if (referralFriendCoupon && metadata.referrer_user_id) {
      sessionParams.discounts = [{ coupon: referralFriendCoupon }];
    } else {
      sessionParams.allow_promotion_codes = true;
    }

    const sessionStripe = await stripe.checkout.sessions.create(sessionParams);

    if (!sessionStripe.url) {
      return NextResponse.json({ error: "Stripe n’a pas retourné d’URL de paiement." }, { status: 502 });
    }

    return NextResponse.json({ url: sessionStripe.url });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Stripe rejected checkout.";
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
