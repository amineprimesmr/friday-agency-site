import type { TrackappBillingPlan } from "@/lib/trackapp/pricing";

/** Payment Links Stripe (publics) — à recréer dans le dashboard pour 29 € / mois et 59 € à vie. */
export const TRACKAPP_STRIPE_PAYMENT_LINK_MONTHLY =
  "https://buy.stripe.com/9B64gt8zkfmz94ibccbMQ02";

export const TRACKAPP_STRIPE_PAYMENT_LINK_LIFETIME =
  "https://buy.stripe.com/cNi4gt7vg3DR4O2eoobMQ03";

export function staticStripePaymentLink(plan: TrackappBillingPlan): string {
  const fromEnv =
    plan === "lifetime" ?
      (
        process.env.NEXT_PUBLIC_STRIPE_PAYMENT_LINK_LIFETIME?.trim()
        ?? process.env.NEXT_PUBLIC_STRIPE_PAYMENT_LINK_YEARLY?.trim()
      )
    : process.env.NEXT_PUBLIC_STRIPE_PAYMENT_LINK_MONTHLY?.trim();

  if (fromEnv?.startsWith("http")) return fromEnv;

  return plan === "lifetime" ? TRACKAPP_STRIPE_PAYMENT_LINK_LIFETIME : TRACKAPP_STRIPE_PAYMENT_LINK_MONTHLY;
}

/** Ouvre le Payment Link Stripe pour le plan. */
export async function openTrackappStripeCheckout(plan: TrackappBillingPlan): Promise<void> {
  window.location.href = staticStripePaymentLink(plan);
}
