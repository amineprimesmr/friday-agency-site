import { normalizeBillingPlan, type TrackappBillingPlan } from "@/lib/trackapp/pricing";

const KEY = "trackapp-paiement-billing";

export type TrackappPaiementBillingPlan = TrackappBillingPlan;

export function getTrackappPaiementPlan(): TrackappPaiementBillingPlan {
  if (typeof window === "undefined") return "lifetime";
  return normalizeBillingPlan(sessionStorage.getItem(KEY));
}

export function setTrackappPaiementPlan(plan: TrackappPaiementBillingPlan): void {
  if (typeof window === "undefined") return;
  sessionStorage.setItem(KEY, plan);
  window.dispatchEvent(new Event("trackapp-paiement-plan"));
}

export function isTrackappLifetimePlanSelected(): boolean {
  return getTrackappPaiementPlan() === "lifetime";
}
