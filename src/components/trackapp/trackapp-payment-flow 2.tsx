"use client";

import { useState } from "react";

import {
  TrackappLimeLogo,
} from "@/components/trackapp/auth/trackapp-auth-shared";
import { TrackappPaiementMarketingPlanSwitcher } from "@/components/trackapp/trackapp-paiement-marketing-plan-switcher";
import { TrackappPaiementPlanSpotlightCards } from "@/components/trackapp/trackapp-paiement-plan-spotlight-cards";
import { TrackappPaymentReviewsPane } from "@/components/trackapp/trackapp-payment-reviews-pane";
import { TrackerHeroSocialProofBadge } from "@/components/tracker/tracker-hero-social-proof-badge";

import "@/styles/trackapp-auth-modal.css";
import "@/styles/trackapp-paiement-landing.css";
import "@/styles/trackapp-payment-modal.css";
import "@/styles/trackapp-saas-pro-payment-page.css";

/** Modale paiement bureau — même coque que la connexion (panneau promo + formulaire). */
export function TrackappPaymentFlow({ onClose }: Readonly<{ onClose: () => void }>) {
  const [checkoutRevealed, setCheckoutRevealed] = useState(false);

  return (
    <div className="ta-auth-root ta-auth-root--embedded ta-font">
      <div className="ta-auth-modal relative">
        <button type="button" className="ta-auth-close" onClick={onClose} aria-label="Fermer">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" aria-hidden>
            <path strokeWidth="2" strokeLinecap="round" d="M6 6l12 12M18 6L6 18" />
          </svg>
        </button>

        <div className="ta-auth-pane ta-auth-pane--payment">
          <TrackappLimeLogo />
          <div className="ta-pay-pick-head">
            <h1 id="trackapp-payment-dialog-title" className="tpl-pick__title">
              Choisissez votre plan
            </h1>
            <p className="tpl-pick__sub">Trouvez les apps qui scalent en ce moment.</p>
          </div>

          <div className="tpl-pick__badge-wrap">
            <TrackerHeroSocialProofBadge />
          </div>

          <div className={`ta-pay-spotlight-stack${checkoutRevealed ? " ta-pay-spotlight-stack--checkout-open" : ""}`}>
            {!checkoutRevealed ? <TrackappPaiementMarketingPlanSwitcher /> : null}
            <TrackappPaiementPlanSpotlightCards
              className="tpl-spotlight-carousel--payment-modal"
              checkoutReveal
              checkoutRevealed={checkoutRevealed}
              onCheckoutRevealedChange={setCheckoutRevealed}
            />
          </div>
        </div>

        <TrackappPaymentReviewsPane />
      </div>
    </div>
  );
}
