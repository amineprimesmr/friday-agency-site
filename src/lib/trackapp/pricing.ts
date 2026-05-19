/** Plans Trackapp — source unique pour tarifs et libellés. */
export type TrackappBillingPlan = "monthly" | "lifetime";

export const TRACKAPP_PRICING = {
  monthly: {
    amount: 29,
    display: "29€",
    period: "/mois",
    note: "sans engagement",
    shortLabel: "Mensuel",
    cardDesc: "Sans engagement — tu résilies en un clic quand tu veux.",
  },
  lifetime: {
    amount: 59,
    display: "59€",
    period: " à vie",
    note: "paiement unique — pas d'abonnement",
    shortLabel: "À vie",
    cardDesc: "Un seul paiement, accès illimité pour toujours.",
  },
} as const;

export function normalizeBillingPlan(raw: string | null | undefined): TrackappBillingPlan {
  if (raw === "monthly") return "monthly";
  return "lifetime";
}

export function trackappPlanStripeMetadata(plan: TrackappBillingPlan): string {
  return plan === "monthly" ? "subscription_monthly" : "payment_lifetime";
}

export function trackappPlanFromStripeMetadata(meta: string | null | undefined): TrackappBillingPlan {
  if (meta === "subscription_monthly") return "monthly";
  if (meta === "payment_lifetime" || meta === "subscription_yearly") return "lifetime";
  return "lifetime";
}

export function trackappPlanDisplayLabel(plan: TrackappBillingPlan): string {
  return plan === "monthly" ? "Abonnement mensuel" : "Accès à vie";
}

export function trackappPricingSummary(): string {
  return `${TRACKAPP_PRICING.monthly.display}${TRACKAPP_PRICING.monthly.period} ou ${TRACKAPP_PRICING.lifetime.display}${TRACKAPP_PRICING.lifetime.period.trim()}`;
}
