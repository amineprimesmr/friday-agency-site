const KEY = "trackapp-paiement-billing";

export type TrackappPaiementBillingPlan = "monthly" | "yearly";

export function getTrackappPaiementPlan(): TrackappPaiementBillingPlan {
  if (typeof window === "undefined") return "monthly";
  return sessionStorage.getItem(KEY) === "yearly" ? "yearly" : "monthly";
}

export function setTrackappPaiementPlan(plan: TrackappPaiementBillingPlan): void {
  if (typeof window === "undefined") return;
  sessionStorage.setItem(KEY, plan);
  window.dispatchEvent(new Event("trackapp-paiement-plan"));
}
