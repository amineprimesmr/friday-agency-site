import type Stripe from "stripe";
import type { SupabaseClient } from "@supabase/supabase-js";

import { AFFILIATE_MIN_PAYOUT_CENTS } from "@/lib/trackapp/affiliate/config";
import { getAffiliateBalance, promotePendingCommissionsToAvailable } from "@/lib/trackapp/affiliate/commissions";
import { ensureAffiliateProfile } from "@/lib/trackapp/affiliate/referral";

export function stripeConnectConfigured(): boolean {
  return Boolean(process.env.STRIPE_SECRET_KEY?.trim());
}

export async function getOrCreateConnectAccount(
  stripe: Stripe,
  admin: SupabaseClient,
  userId: string,
  email: string,
): Promise<string | null> {
  const profile = await ensureAffiliateProfile(admin, userId);
  if (!profile) return null;

  if (profile.stripe_connect_account_id) return profile.stripe_connect_account_id;

  const account = await stripe.accounts.create({
    type: "express",
    country: "FR",
    email,
    capabilities: {
      transfers: { requested: true },
    },
    metadata: {
      supabase_user_id: userId,
      product: "trackapp_affiliate",
    },
  });

  await admin
    .from("trackapp_profiles")
    .update({
      stripe_connect_account_id: account.id,
      updated_at: new Date().toISOString(),
    })
    .eq("id", userId);

  return account.id;
}

export async function createConnectOnboardingLink(
  stripe: Stripe,
  accountId: string,
  origin: string,
): Promise<string> {
  const link = await stripe.accountLinks.create({
    account: accountId,
    refresh_url: `${origin}/trackapp/gagner-240?connect=refresh`,
    return_url: `${origin}/trackapp/gagner-240?connect=return`,
    type: "account_onboarding",
  });
  return link.url;
}

export async function getConnectAccountStatus(
  stripe: Stripe,
  accountId: string,
): Promise<{ payoutsEnabled: boolean; detailsSubmitted: boolean }> {
  const account = await stripe.accounts.retrieve(accountId);
  return {
    payoutsEnabled: Boolean(account.payouts_enabled),
    detailsSubmitted: Boolean(account.details_submitted),
  };
}

export async function requestAffiliatePayout(opts: {
  stripe: Stripe;
  admin: SupabaseClient;
  userId: string;
}): Promise<{ ok: true; transferId: string; amountCents: number } | { ok: false; error: string }> {
  await promotePendingCommissionsToAvailable(opts.admin);

  const { data: profile } = await opts.admin
    .from("trackapp_profiles")
    .select("stripe_connect_account_id")
    .eq("id", opts.userId)
    .maybeSingle();

  const accountId = profile?.stripe_connect_account_id;
  if (!accountId) {
    return { ok: false, error: "connect_required" };
  }

  const status = await getConnectAccountStatus(opts.stripe, accountId);
  if (!status.payoutsEnabled) {
    return { ok: false, error: "connect_not_ready" };
  }

  const balance = await getAffiliateBalance(opts.admin, opts.userId);
  if (balance.availableCents < AFFILIATE_MIN_PAYOUT_CENTS) {
    return { ok: false, error: "below_minimum" };
  }

  const amountCents = balance.availableCents;
  const now = new Date().toISOString();

  const { data: payout, error: payoutErr } = await opts.admin
    .from("trackapp_affiliate_payouts")
    .insert({
      affiliate_user_id: opts.userId,
      amount_cents: amountCents,
      currency: "eur",
      status: "processing",
      updated_at: now,
    })
    .select("id")
    .single();

  if (payoutErr || !payout?.id) {
    return { ok: false, error: "payout_record_failed" };
  }

  const { data: commissionRows } = await opts.admin
    .from("trackapp_affiliate_commissions")
    .select("id")
    .eq("affiliate_user_id", opts.userId)
    .eq("status", "available");

  const commissionIds = (commissionRows ?? []).map((r) => r.id);

  try {
    const transfer = await opts.stripe.transfers.create({
      amount: amountCents,
      currency: "eur",
      destination: accountId,
      metadata: {
        payout_id: payout.id,
        affiliate_user_id: opts.userId,
      },
    });

    await opts.admin
      .from("trackapp_affiliate_payouts")
      .update({
        status: "completed",
        stripe_transfer_id: transfer.id,
        updated_at: new Date().toISOString(),
      })
      .eq("id", payout.id);

    if (commissionIds.length > 0) {
      await opts.admin
        .from("trackapp_affiliate_commissions")
        .update({
          status: "paid",
          payout_id: payout.id,
          updated_at: new Date().toISOString(),
        })
        .in("id", commissionIds);
    }

    return { ok: true, transferId: transfer.id, amountCents };
  } catch (err) {
    const message = err instanceof Error ? err.message : "transfer_failed";
    await opts.admin
      .from("trackapp_affiliate_payouts")
      .update({
        status: "failed",
        failure_message: message,
        updated_at: new Date().toISOString(),
      })
      .eq("id", payout.id);

    return { ok: false, error: message };
  }
}
