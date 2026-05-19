export type TrackappBillingPlan = "monthly" | "yearly";

/** Liens Stripe Payment Link statiques (optionnels — à renseigner plus tard). */
export function staticStripePaymentLink(plan: TrackappBillingPlan): string | null {
  const url =
    plan === "yearly" ?
      process.env.NEXT_PUBLIC_STRIPE_PAYMENT_LINK_YEARLY?.trim()
    : process.env.NEXT_PUBLIC_STRIPE_PAYMENT_LINK_MONTHLY?.trim();
  return url && url.startsWith("http") ? url : null;
}

/** Ouvre le checkout Stripe pour le plan (lien statique ou session API). */
export async function openTrackappStripeCheckout(plan: TrackappBillingPlan): Promise<void> {
  const staticUrl = staticStripePaymentLink(plan);
  if (staticUrl) {
    window.location.href = staticUrl;
    return;
  }

  const res = await fetch("/api/trackapp/checkout", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ plan }),
  });
  const data = (await res.json().catch(() => ({}))) as { url?: string; error?: string };
  if (!res.ok || !data.url) {
    throw new Error(data.error || "Impossible d'ouvrir le paiement Stripe.");
  }
  window.location.href = data.url;
}
