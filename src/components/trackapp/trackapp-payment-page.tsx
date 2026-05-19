"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";

import { TrackappPlanBillingSwitcher } from "@/components/trackapp/trackapp-plan-billing-switcher";
import { TrackappPaiementOrderForm } from "@/components/trackapp/trackapp-paiement-order-form";
import { TrackerHeroSocialProofBadge } from "@/components/tracker/tracker-hero-social-proof-badge";
import { getTrackappPaiementPlan, setTrackappPaiementPlan } from "@/lib/trackapp-paiement-plan-storage";

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
  /** false sur la page landing : le hero marketing est au-dessus */
  showHeroBlock?: boolean;
}> = {}) {
  const switcherRef = useRef<HTMLFieldSetElement | null>(null);
  /** true = abonnement annuel (99 € / an) */
  const [yearly, setYearly] = useState(true);

  const syncYearlyFromStore = useCallback(() => {
    setYearly(getTrackappPaiementPlan() === "yearly");
  }, []);

  useEffect(() => {
    syncYearlyFromStore();
    window.addEventListener("trackapp-paiement-plan", syncYearlyFromStore);
    return () => window.removeEventListener("trackapp-paiement-plan", syncYearlyFromStore);
  }, [syncYearlyFromStore]);

  const setYearlyAndStore = (y: boolean) => {
    setYearly(y);
    setTrackappPaiementPlan(y ? "yearly" : "monthly");
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
                <strong>39&nbsp;€</strong> / mois ou <strong>99&nbsp;€</strong> / an — même produit, tu choisis ta
                cadence.
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
                Choisis ton offre ci-dessous — paiement sécurisé via Stripe (mensuel ou annuel).
              </p>
            </div>
          )}
        </header>

        <div className="saas-pay-billing saas-pay-billing--checkout">
          <div className="saas-pay-billing-liquid">
            <TrackappPlanBillingSwitcher
              switcherRef={switcherRef}
              yearly={yearly}
              onYearlyChange={setYearlyAndStore}
              radioName="trackappPlanCheckout"
            />
          </div>
        </div>

        <TrackappPaiementOrderForm plan={yearly ? "yearly" : "monthly"} country={country} onCountryChange={setCountry} />
      </main>
    </div>
  );
}
