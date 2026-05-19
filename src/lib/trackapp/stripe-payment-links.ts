export type TrackappBillingPlan = "monthly" | "yearly";

/** Payment Links Stripe (publics) — surchargeables via .env / Vercel. */
export const TRACKAPP_STRIPE_PAYMENT_LINK_MONTHLY =
  "https://buy.stripe.com/00w4gteXI6Q31BQfssbMQ00";

export const TRACKAPP_STRIPE_PAYMENT_LINK_YEARLY =
  "https://buy.stripe.com/fZufZbeXI0rF94i2FGbMQ01";

export function staticStripePaymentLink(plan: TrackappBillingPlan): string {
  const fromEnv =
    plan === "yearly" ?
      process.env.NEXT_PUBLIC_STRIPE_PAYMENT_LINK_YEARLY?.trim()
    : process.env.NEXT_PUBLIC_STRIPE_PAYMENT_LINK_MONTHLY?.trim();

  if (fromEnv?.startsWith("http")) return fromEnv;

  return plan === "yearly" ? TRACKAPP_STRIPE_PAYMENT_LINK_YEARLY : TRACKAPP_STRIPE_PAYMENT_LINK_MONTHLY;
}

/** Ouvre le Payment Link Stripe pour le plan. */
export async function openTrackappStripeCheckout(plan: TrackappBillingPlan): Promise<void> {
  window.location.href = staticStripePaymentLink(plan);
}
