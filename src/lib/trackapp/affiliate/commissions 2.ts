import type Stripe from "stripe";
import type { SupabaseClient } from "@supabase/supabase-js";

import { AFFILIATE_HOLDING_DAYS } from "@/lib/trackapp/affiliate/config";
import {
  affiliateCommissionRateForGross,
  commissionCentsFromGross,
  getReferrerForUser,
} from "@/lib/trackapp/affiliate/referral";

function holdingAvailableAt(): string {
  const d = new Date();
  d.setUTCDate(d.getUTCDate() + AFFILIATE_HOLDING_DAYS);
  return d.toISOString();
}

export async function promotePendingCommissionsToAvailable(admin: SupabaseClient): Promise<void> {
  const now = new Date().toISOString();
  await admin
    .from("trackapp_affiliate_commissions")
    .update({ status: "available", updated_at: now })
    .eq("status", "pending")
    .lte("available_at", now);
}

export async function recordCommission(opts: {
  admin: SupabaseClient;
  affiliateUserId: string;
  referredUserId: string;
  grossAmountCents: number;
  currency: string;
  stripeEventId: string;
  eventType: "initial" | "renewal";
  stripeCheckoutSessionId?: string | null;
  stripeInvoiceId?: string | null;
  stripeSubscriptionId?: string | null;
  description?: string;
}): Promise<boolean> {
  if (opts.grossAmountCents <= 0) return false;

  const commissionCents = commissionCentsFromGross(opts.grossAmountCents);
  if (commissionCents <= 0) return false;

  const now = new Date().toISOString();

  const { error } = await opts.admin.from("trackapp_affiliate_commissions").insert({
    affiliate_user_id: opts.affiliateUserId,
    referred_user_id: opts.referredUserId,
    gross_amount_cents: opts.grossAmountCents,
    commission_cents: commissionCents,
    commission_rate: affiliateCommissionRateForGross(opts.grossAmountCents),
    currency: opts.currency.toLowerCase(),
    stripe_event_id: opts.stripeEventId,
    stripe_checkout_session_id: opts.stripeCheckoutSessionId ?? null,
    stripe_invoice_id: opts.stripeInvoiceId ?? null,
    stripe_subscription_id: opts.stripeSubscriptionId ?? null,
    event_type: opts.eventType,
    status: "pending",
    available_at: holdingAvailableAt(),
    description: opts.description ?? null,
    updated_at: now,
  });

  if (error?.code === "23505") return false;
  if (error) {
    console.warn("[affiliate-commission]", error.message);
    return false;
  }
  return true;
}

export async function recordCommissionForReferredUser(opts: {
  admin: SupabaseClient;
  referredUserId: string;
  grossAmountCents: number;
  currency: string;
  stripeEventId: string;
  eventType: "initial" | "renewal";
  stripeCheckoutSessionId?: string | null;
  stripeInvoiceId?: string | null;
  stripeSubscriptionId?: string | null;
  description?: string;
}): Promise<boolean> {
  const referrer = await getReferrerForUser(opts.admin, opts.referredUserId);
  if (!referrer) return false;

  return recordCommission({
    admin: opts.admin,
    affiliateUserId: referrer.id,
    referredUserId: opts.referredUserId,
    grossAmountCents: opts.grossAmountCents,
    currency: opts.currency,
    stripeEventId: opts.stripeEventId,
    eventType: opts.eventType,
    stripeCheckoutSessionId: opts.stripeCheckoutSessionId,
    stripeInvoiceId: opts.stripeInvoiceId,
    stripeSubscriptionId: opts.stripeSubscriptionId,
    description: opts.description,
  });
}

export async function reverseCommissionByStripeEvent(
  admin: SupabaseClient,
  stripeEventIdPrefix: string,
): Promise<void> {
  const now = new Date().toISOString();
  await admin
    .from("trackapp_affiliate_commissions")
    .update({ status: "reversed", updated_at: now })
    .like("stripe_event_id", `${stripeEventIdPrefix}%`)
    .in("status", ["pending", "available"]);
}

export async function processCheckoutSessionCommission(
  admin: SupabaseClient,
  sess: Stripe.Checkout.Session,
): Promise<void> {
  const userId = sess.metadata?.supabase_user_id?.trim();
  if (!userId) return;

  const paid =
    sess.payment_status === "paid"
    || sess.payment_status === "no_payment_required"
    || sess.status === "complete";
  if (!paid) return;

  const gross = sess.amount_total ?? 0;
  if (gross <= 0) return;

  const referrerId = sess.metadata?.referrer_user_id?.trim();
  if (referrerId && referrerId !== userId) {
    await recordCommission({
      admin,
      affiliateUserId: referrerId,
      referredUserId: userId,
      grossAmountCents: gross,
      currency: sess.currency ?? "eur",
      stripeEventId: `checkout:${sess.id}`,
      eventType: "initial",
      stripeCheckoutSessionId: sess.id,
      stripeSubscriptionId:
        typeof sess.subscription === "string" ? sess.subscription : sess.subscription?.id ?? null,
      description: "Premier abonnement (checkout)",
    });
    return;
  }

  await recordCommissionForReferredUser({
    admin,
    referredUserId: userId,
    grossAmountCents: gross,
    currency: sess.currency ?? "eur",
    stripeEventId: `checkout:${sess.id}`,
    eventType: "initial",
    stripeCheckoutSessionId: sess.id,
    stripeSubscriptionId:
      typeof sess.subscription === "string" ? sess.subscription : sess.subscription?.id ?? null,
    description: "Premier abonnement (checkout)",
  });
}

export async function processInvoiceCommission(
  admin: SupabaseClient,
  invoice: Stripe.Invoice,
): Promise<void> {
  if (invoice.status !== "paid" || invoice.billing_reason === "manual") return;

  if (invoice.billing_reason === "subscription_create") return;

  const gross = invoice.amount_paid ?? 0;
  if (gross <= 0) return;

  const customerId = typeof invoice.customer === "string" ? invoice.customer : invoice.customer?.id;
  if (!customerId) return;

  const { data: profile } = await admin
    .from("trackapp_profiles")
    .select("id")
    .eq("stripe_customer_id", customerId)
    .maybeSingle();

  if (!profile?.id) return;

  const subRef =
    invoice.parent?.subscription_details?.subscription
    ?? invoice.lines?.data?.[0]?.subscription;
  const subscriptionId =
    typeof subRef === "string" ? subRef
    : subRef && typeof subRef === "object" && "id" in subRef && typeof subRef.id === "string" ?
      subRef.id
    : null;

  const stripeEventId = `invoice:${invoice.id}`;

  await recordCommissionForReferredUser({
    admin,
    referredUserId: profile.id,
    grossAmountCents: gross,
    currency: invoice.currency ?? "eur",
    stripeEventId,
    eventType: "renewal",
    stripeInvoiceId: invoice.id,
    stripeSubscriptionId: subscriptionId,
    description: "Renouvellement abonnement",
  });
}

export type AffiliateBalance = {
  pendingCents: number;
  availableCents: number;
  paidCents: number;
  totalEarnedCents: number;
};

export async function getAffiliateBalance(
  admin: SupabaseClient,
  affiliateUserId: string,
): Promise<AffiliateBalance> {
  await promotePendingCommissionsToAvailable(admin);

  const { data: rows } = await admin
    .from("trackapp_affiliate_commissions")
    .select("status, commission_cents")
    .eq("affiliate_user_id", affiliateUserId);

  const balance: AffiliateBalance = {
    pendingCents: 0,
    availableCents: 0,
    paidCents: 0,
    totalEarnedCents: 0,
  };

  for (const row of rows ?? []) {
    const cents = row.commission_cents ?? 0;
    if (row.status === "pending") balance.pendingCents += cents;
    else if (row.status === "available") balance.availableCents += cents;
    else if (row.status === "paid") balance.paidCents += cents;
  }

  balance.totalEarnedCents =
    balance.pendingCents + balance.availableCents + balance.paidCents;

  return balance;
}
