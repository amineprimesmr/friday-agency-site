"use client";

import { useCallback, useState } from "react";

import { openTrackappStripeCheckout, type TrackappBillingPlan } from "@/lib/trackapp/stripe-payment-links";

const PLANS = [
  {
    plan: "yearly" as const,
    price: "8,25€",
    priceSuffix: " / mois",
    priceNote: "Facturé 99 € / an",
    badge: "Réduction -79%",
    desc: "Le meilleur rapport pour rester à long terme.",
    variant: "annual" as const,
  },
  {
    plan: "monthly" as const,
    price: "39€",
    priceSuffix: " / mois",
    priceNote: "Sans engagement",
    badge: null,
    desc: "Tu résilies en un clic quand tu veux.",
    variant: "monthly" as const,
  },
] as const;

/** Deux cartes cliquables — bureau : clic → Stripe. */
export function TrackappPaymentModalCards() {
  const [busyPlan, setBusyPlan] = useState<TrackappBillingPlan | null>(null);
  const [error, setError] = useState<string | null>(null);

  const onPick = useCallback(async (plan: TrackappBillingPlan) => {
    if (busyPlan) return;
    setBusyPlan(plan);
    setError(null);
    try {
      await openTrackappStripeCheckout(plan);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Paiement indisponible.");
      setBusyPlan(null);
    }
  }, [busyPlan]);

  return (
    <div className="ta-pay-modal-cards" role="list" aria-label="Formules Trackapp">
      {PLANS.map((item) => (
        <button
          key={item.plan}
          type="button"
          role="listitem"
          className={`ta-pay-modal-card ta-pay-modal-card--${item.variant}${busyPlan === item.plan ? " is-busy" : ""}${busyPlan && busyPlan !== item.plan ? " is-dimmed" : ""}`}
          disabled={Boolean(busyPlan)}
          onClick={() => onPick(item.plan)}
          aria-busy={busyPlan === item.plan}
        >
          <span className="ta-pay-modal-card__glow" aria-hidden />
          <span className="ta-pay-modal-card__inner">
            <span className="ta-pay-modal-card__brand">TRACKAPP</span>
            {item.badge ?
              <span className="ta-pay-modal-card__badge">{item.badge}</span>
            : null}
            <span className="ta-pay-modal-card__price">
              {item.price}
              <span className="ta-pay-modal-card__price-suffix">{item.priceSuffix}</span>
            </span>
            <span className="ta-pay-modal-card__note">{item.priceNote}</span>
            <span className="ta-pay-modal-card__desc">{item.desc}</span>
            <span className="ta-pay-modal-card__cta">
              {busyPlan === item.plan ? "Redirection…" : "Choisir"}
            </span>
          </span>
        </button>
      ))}
      {error ? <p className="ta-pay-modal-cards__error">{error}</p> : null}
    </div>
  );
}
