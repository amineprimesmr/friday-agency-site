import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import type Stripe from "stripe";

import { AFFILIATE_REF_COOKIE } from "@/lib/trackapp/affiliate/config";
import { attachReferrerIfEligible, resolveReferrerByCode } from "@/lib/trackapp/affiliate/referral";
import { resolveTrackappOrigin } from "@/lib/trackapp/checkout-session";
import { createAdminClient } from "@/lib/supabase/admin";
import { getStripe } from "@/lib/stripe";

export async function POST(req: Request) {
  const stripe = getStripe();

  type BillingPlan = "monthly" | "yearly";
  let plan: BillingPlan = "yearly";
  try {
    const ct = req.headers.get("content-type") ?? "";
    if (ct.includes("application/json")) {
      const body = (await req.json()) as { plan?: unknown };
      if (body?.plan === "monthly" || body?.plan === "yearly") {
        plan = body.plan;
      }
    }
  } catch {
    plan = "yearly";
  }

  const priceMonthly =
    process.env.STRIPE_PRICE_ID_TRACKAPP?.trim()
    ?? process.env.STRIPE_PRICE_ID_MONTHLY?.trim()
    ?? "";
  const priceYearly = process.env.STRIPE_PRICE_ID_YEARLY?.trim() ?? "";
  const price = plan === "yearly" ? priceYearly : priceMonthly;

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

  const origin = resolveTrackappOrigin();
  const cookieStore = await cookies();

  const metadata: Record<string, string> = {
    product: "trackapp_full_access",
    trackapp_plan: plan === "yearly" ? "subscription_yearly" : "subscription_monthly",
  };

  const refCode = cookieStore.get(AFFILIATE_REF_COOKIE)?.value?.trim();
  const admin = createAdminClient();
  if (refCode && admin) {
    const referrer = await resolveReferrerByCode(admin, refCode);
    if (referrer) {
      metadata.referrer_user_id = referrer.id;
      metadata.referral_code = refCode.toLowerCase();
    }
  }

  try {
    const referralFriendCoupon = process.env.STRIPE_COUPON_ID_REFERRAL_FRIEND?.trim();

    const sessionParams: Stripe.Checkout.SessionCreateParams = {
      mode: "subscription",
      customer_creation: "always",
      line_items: [{ price, quantity: 1 }],
      success_url: `${origin}/trackapp/activation?session_id={CHECKOUT_SESSION_ID}`,
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
      return NextResponse.json({ error: "Stripe n'a pas retourné d'URL de paiement." }, { status: 502 });
    }

    return NextResponse.json({ url: sessionStripe.url });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Stripe rejected checkout.";
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
