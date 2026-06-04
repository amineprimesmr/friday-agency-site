import { loadStripe, type Stripe } from "@stripe/stripe-js";

let stripePromise: Promise<Stripe | null> | null = null;

export function getStripePublishableKey(): string {
  return process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY?.trim() ?? "";
}

export function stripePublishableKeyConfigured(): boolean {
  return getStripePublishableKey().length > 0;
}

export function getStripePromise(): Promise<Stripe | null> | null {
  const key = getStripePublishableKey();
  if (!key) return null;
  stripePromise ??= loadStripe(key);
  return stripePromise;
}
