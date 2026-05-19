"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";

import { TrackappPlanBillingSwitcher } from "@/components/trackapp/trackapp-plan-billing-switcher";
import { TrackappPaiementOrderForm } from "@/components/trackapp/trackapp-paiement-order-form";
import { TrackerHeroSocialProofBadge } from "@/components/tracker/tracker-hero-social-proof-badge";
import { getTrackappPaiementPlan, setTrackappPaiementPlan } from "@/lib/trackapp-paiement-plan-storage";
import { trackappPricingSummary } from "@/lib/trackapp/pricing";

function CheckoutBackIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" aria-hidden>
      <path d="m15 18-6-6 6-6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function TrackappPaymentPage({
  embedded = false,
  onRequestClose,
  showHeroBlock = true,
}: Readonly<{
  embedded?: boolean;
  onRequestClose?: () => void;
  showHeroBlock?: boolean;
}>) {
  const switcherRef = useRef<HTMLFieldSetElement | null>(null);
  const [lifetime, setLifetime] = useState(true);

  const syncFromStore = useCallback(() => {
    setLifetime(getTrackappPaiementPlan() === "lifetime");
  }, []);

  useEffect(() => {
    syncFromStore();
    window.addEventListener("trackapp-paiement-plan", syncFromStore);
    return () => window.removeEventListener("trackapp-paiement-plan", syncFromStore);
  }, [syncFromStore]);

  const setLifetimeAndStore = (value: boolean) => {
    setLifetime(value);
    setTrackappPaiementPlan(value ? "lifetime" : "monthly");
  };
  const [country, setCountry] = useState("FR");

  return (
    <div
      className={`saas-pay saas-pay-checkout${embedded ? " saas-pay-checkout--embedded" : ""}${showHeroBlock ? "" : " saas-pay-checkout--landing-form"}`}
    >
      <main className="saas-pay-checkout-main">
        <header className="saas-pay-checkout-head">
          {onRequestClose ? (
            <button type="button" className="saas-pay-checkout-back" onClick={onRequestClose}>
              <CheckoutBackIcon />
              Fermer
            </button>
          ) : (
            <Link className="saas-pay-checkout-back" href="/trackapp/accueil">
              <CheckoutBackIcon />
              Retour
            </Link>
          )}
          {showHeroBlock ? (
            <>
              <h1 id={embedded ? "trackapp-payment-dialog-title" : undefined}>CHOISISSEZ VOTRE ACCÈS</h1>
              <p className="saas-pay-checkout-trust-lead">
                <strong>{trackappPricingSummary()}</strong> — même produit, tu choisis ta formule.
              </p>
              <div className="tpl-pick__badge-wrap">
                <TrackerHeroSocialProofBadge />
              </div>
            </>
          ) : (
            <div className="tpl-paiement-form-intro">
              <h1 id={embedded ? undefined : "paiement-checkout-title"} className="tpl-paiement-form-intro__title">
                Finaliser sur Stripe
              </h1>
              <p className="tpl-paiement-form-intro__lead">
                Choisis ton offre ci-dessous — paiement sécurisé via Stripe (mensuel ou à vie).
              </p>
            </div>
          )}
        </header>

        <div className="saas-pay-billing saas-pay-billing--checkout">
          <div className="saas-pay-billing-liquid">
            <TrackappPlanBillingSwitcher
              switcherRef={switcherRef}
              lifetime={lifetime}
              onLifetimeChange={setLifetimeAndStore}
              radioName="trackappPlanCheckout"
            />
          </div>
        </div>

        <TrackappPaiementOrderForm
          plan={lifetime ? "lifetime" : "monthly"}
          country={country}
          onCountryChange={setCountry}
        />
      </main>
    </div>
  );
}
