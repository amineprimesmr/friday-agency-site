import type Stripe from "stripe";

import { createAdminClient } from "@/lib/supabase/admin";

function customerId(sess: Stripe.Checkout.Session): string {
  if (typeof sess.customer === "string") return sess.customer;
  if (
    typeof sess.customer === "object"
    && sess.customer
    && "id" in sess.customer
    && typeof (sess.customer as Stripe.Customer).id === "string"
  ) {
    return (sess.customer as Stripe.Customer).id;
  }
  return "";
}

function subscriptionId(sess: Stripe.Checkout.Session): string {
  if (typeof sess.subscription === "string") return sess.subscription;
  if (
    typeof sess.subscription === "object"
    && sess.subscription
    && typeof (sess.subscription as Stripe.Subscription).id === "string"
  ) {
    return (sess.subscription as Stripe.Subscription).id;
  }
  return "";
}

export async function persistTrackappPremium(opts: {
  userId: string;
  stripeCustomerId?: string | null;
  stripeSubscriptionId?: string | null;
}): Promise<boolean> {
  const admin = createAdminClient();
  if (!admin) return false;

  const unlockedAtIso = new Date().toISOString();
  await admin.from("trackapp_profiles").upsert({
    id: opts.userId,
    plan_unlocked_at: unlockedAtIso,
    stripe_customer_id: opts.stripeCustomerId ?? null,
    stripe_subscription_id: opts.stripeSubscriptionId ?? null,
    updated_at: unlockedAtIso,
  });

  return true;
}

export function billingIdsFromCheckoutSession(sess: Stripe.Checkout.Session): {
  customerId: string;
  subscriptionId: string;
} {
  return { customerId: customerId(sess), subscriptionId: subscriptionId(sess) };
}

export async function unlockTrackappFromCheckoutSession(sess: Stripe.Checkout.Session): Promise<boolean> {
  const userId =
    sess.metadata?.product === "trackapp_full_playbook" && sess.metadata.supabase_user_id ?
      sess.metadata.supabase_user_id.trim()
    : "";

  const paid =
    sess.payment_status === "paid"
    || sess.payment_status === "no_payment_required"
    || sess.status === "complete";

  if (!userId || !paid) return false;

  const billing = billingIdsFromCheckoutSession(sess);
  return persistTrackappPremium({
    userId,
    stripeCustomerId: billing.customerId,
    stripeSubscriptionId: billing.subscriptionId,
  });
}

export async function lockTrackappOnSubscriptionEnded(subscription: Stripe.Subscription): Promise<void> {
  const admin = createAdminClient();
  if (!admin) return;

  await admin
    .from("trackapp_profiles")
    .update({
      plan_unlocked_at: null,
      stripe_subscription_id: null,
      updated_at: new Date().toISOString(),
    })
    .eq("stripe_subscription_id", subscription.id);
}
