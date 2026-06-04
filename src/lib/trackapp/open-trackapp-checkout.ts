import type { TrackappBillingPlan } from "@/lib/trackapp/pricing";

type CheckoutApiResponse = {
  url?: string;
  clientSecret?: string;
  error?: string;
};

async function postTrackappCheckout(
  plan: TrackappBillingPlan,
  uiMode: "hosted" | "elements",
): Promise<CheckoutApiResponse & { ok: boolean }> {
  const res = await fetch("/api/trackapp/checkout", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ plan, uiMode }),
  });
  const data = (await res.json().catch(() => ({}))) as CheckoutApiResponse;
  return { ...data, ok: res.ok };
}

/** Client secret pour Checkout Sessions (ui_mode elements) — Apple Pay / carte in-page. */
export async function fetchTrackappCheckoutClientSecret(plan: TrackappBillingPlan): Promise<string> {
  const data = await postTrackappCheckout(plan, "elements");
  if (!data.ok || !data.clientSecret) {
    throw new Error(data.error || "Impossible de préparer le paiement.");
  }
  return data.clientSecret;
}

/** Ouvre Stripe Checkout hébergé (redirect) pour le plan choisi. */
export async function openTrackappCheckout(plan: TrackappBillingPlan): Promise<void> {
  const data = await postTrackappCheckout(plan, "hosted");
  if (!data.ok || !data.url) {
    throw new Error(data.error || "Impossible de préparer le paiement.");
  }
  window.location.href = data.url;
}
