import { NextResponse } from "next/server";

import {
  AFFILIATE_COMMISSION_RATE,
  AFFILIATE_FRIEND_DISCOUNT_PERCENT,
  AFFILIATE_MIN_PAYOUT_CENTS,
} from "@/lib/trackapp/affiliate/config";
import { getAffiliateBalance } from "@/lib/trackapp/affiliate/commissions";
import { ensureAffiliateProfile, referralLink } from "@/lib/trackapp/affiliate/referral";
import { getConnectAccountStatus, stripeConnectConfigured } from "@/lib/trackapp/affiliate/stripe-connect";
import { appOriginFromEnv, getTrackappRouteUser } from "@/lib/trackapp/supabase-route";
import { createAdminClient } from "@/lib/supabase/admin";
import { getStripe } from "@/lib/stripe";

export async function GET() {
  const user = await getTrackappRouteUser();
  if (!user?.email) {
    return NextResponse.json({ error: "Connexion requise." }, { status: 401 });
  }

  const admin = createAdminClient();
  if (!admin) {
    return NextResponse.json({ error: "Service indisponible." }, { status: 503 });
  }

  const profile = await ensureAffiliateProfile(admin, user.id);
  if (!profile?.referral_code) {
    return NextResponse.json({ error: "Profil affilié introuvable." }, { status: 500 });
  }

  const origin = appOriginFromEnv();
  const balance = await getAffiliateBalance(admin, user.id);

  const { count: referralsCount } = await admin
    .from("trackapp_profiles")
    .select("id", { count: "exact", head: true })
    .eq("referred_by_id", user.id);

  const { data: recentCommissions } = await admin
    .from("trackapp_affiliate_commissions")
    .select(
      "id, created_at, commission_cents, gross_amount_cents, status, event_type, description, currency",
    )
    .eq("affiliate_user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(20);

  const { data: recentPayouts } = await admin
    .from("trackapp_affiliate_payouts")
    .select("id, created_at, amount_cents, status, stripe_transfer_id, currency")
    .eq("affiliate_user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(10);

  let connect = {
    configured: stripeConnectConfigured(),
    accountId: profile.stripe_connect_account_id,
    payoutsEnabled: false,
    detailsSubmitted: false,
  };

  const stripe = getStripe();
  if (stripe && profile.stripe_connect_account_id) {
    const status = await getConnectAccountStatus(stripe, profile.stripe_connect_account_id);
    connect = { ...connect, ...status };
  }

  return NextResponse.json({
    referralCode: profile.referral_code,
    referralLink: referralLink(origin, profile.referral_code),
    friendDiscountPercent: AFFILIATE_FRIEND_DISCOUNT_PERCENT,
    commissionRate: AFFILIATE_COMMISSION_RATE,
    minPayoutCents: AFFILIATE_MIN_PAYOUT_CENTS,
    balance,
    referralsCount: referralsCount ?? 0,
    recentCommissions: recentCommissions ?? [],
    recentPayouts: recentPayouts ?? [],
    connect,
  });
}
