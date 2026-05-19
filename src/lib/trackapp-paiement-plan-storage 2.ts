const KEY = "trackapp-paiement-billing";

export type TrackappPaiementBillingPlan = "monthly" | "yearly";

export function getTrackappPaiementPlan(): TrackappPaiementBillingPlan {
  if (typeof window === "undefined") return "yearly";
  return sessionStorage.getItem(KEY) === "monthly" ? "monthly" : "yearly";
}

export function setTrackappPaiementPlan(plan: TrackappPaiementBillingPlan): void {
  if (typeof window === "undefined") return;
  sessionStorage.setItem(KEY, plan);
  window.dispatchEvent(new Event("trackapp-paiement-plan"));
}
