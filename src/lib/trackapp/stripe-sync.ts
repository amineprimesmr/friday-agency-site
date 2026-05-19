import type Stripe from "stripe";

import {
  checkoutSessionCustomerEmail,
  emailsMatch,
  isTrackappCheckoutProduct,
  isTrackappCheckoutSessionPaid,
} from "@/lib/trackapp/checkout-session";
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
  const subId =
    opts.stripeSubscriptionId && opts.stripeSubscriptionId.trim().length ?
      opts.stripeSubscriptionId.trim()
    : null;

  await admin.from("trackapp_profiles").upsert({
    id: opts.userId,
    plan_unlocked_at: unlockedAtIso,
    stripe_customer_id:
      opts.stripeCustomerId && opts.stripeCustomerId.trim().length ? opts.stripeCustomerId.trim() : null,
    stripe_subscription_id: subId,
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

export async function linkCheckoutSessionToUser(opts: {
  session: Stripe.Checkout.Session;
  userId: string;
  userEmail: string;
}): Promise<{ ok: true } | { ok: false; error: string }> {
  const { session, userId, userEmail } = opts;

  if (!isTrackappCheckoutProduct(session)) {
    return { ok: false, error: "Session Trackapp invalide." };
  }

  if (!isTrackappCheckoutSessionPaid(session)) {
    return { ok: false, error: "Paiement non finalisé." };
  }

  const metadataUser =
    typeof session.metadata?.supabase_user_id === "string" ? session.metadata.supabase_user_id.trim() : "";
  if (metadataUser && metadataUser !== userId) {
    return { ok: false, error: "Cette session est déjà liée à un autre compte." };
  }

  const stripeEmail = checkoutSessionCustomerEmail(session);
  if (stripeEmail && !emailsMatch(stripeEmail, userEmail)) {
    return {
      ok: false,
      error: `Utilise la même adresse e-mail que lors du paiement (${stripeEmail}).`,
    };
  }

  const billing = billingIdsFromCheckoutSession(session);
  const persisted = await persistTrackappPremium({
    userId,
    stripeCustomerId: billing.customerId,
    stripeSubscriptionId: billing.subscriptionId,
  });

  if (!persisted) {
    return { ok: false, error: "Impossible d'activer l'abonnement (service role Supabase)." };
  }

  return { ok: true };
}

export async function unlockTrackappFromCheckoutSession(sess: Stripe.Checkout.Session): Promise<boolean> {
  const userId =
    sess.metadata?.product === "trackapp_full_access" && sess.metadata.supabase_user_id ?
      sess.metadata.supabase_user_id.trim()
    : "";

  if (!userId) return false;

  const paid = isTrackappCheckoutSessionPaid(sess);
  if (!paid) return false;

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
