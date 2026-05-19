"use client";

import { useEffect, useState } from "react";

import {
  PROMO_SLIDES,
  PromoPanel,
  TrackappLimeLogo,
} from "@/components/trackapp/auth/trackapp-auth-shared";
import { TrackappPaiementPlanSpotlightCards } from "@/components/trackapp/trackapp-paiement-plan-spotlight-cards";
import { TrackerHeroSocialProofBadge } from "@/components/tracker/tracker-hero-social-proof-badge";

import "@/styles/trackapp-auth-modal.css";
import "@/styles/trackapp-paiement-landing.css";
import "@/styles/trackapp-payment-modal.css";

/** Modale paiement bureau — même coque que la connexion, cartes identiques au mobile. */
export function TrackappPaymentFlow({ onClose }: Readonly<{ onClose: () => void }>) {
  const [slide, setSlide] = useState(0);

  useEffect(() => {
    const t = setInterval(() => setSlide((s) => (s + 1) % PROMO_SLIDES.length), 4200);
    return () => clearInterval(t);
  }, []);

  return (
    <div className="ta-auth-root ta-auth-root--embedded ta-font">
      <div className="ta-auth-modal relative">
        <button type="button" className="ta-auth-close" onClick={onClose} aria-label="Fermer">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" aria-hidden>
            <path strokeWidth="2" strokeLinecap="round" d="M6 6l12 12M18 6L6 18" />
          </svg>
        </button>

        <div className="ta-auth-pane ta-auth-pane--payment-modal">
          <TrackappLimeLogo />
          <h1 id="trackapp-payment-dialog-title" className="ta-auth-headline">
            Choisissez votre plan
          </h1>
          <p className="ta-auth-lead ta-auth-lead--payment-modal">
            Trouvez les apps qui scalent en ce moment.
          </p>

          <div className="ta-pay-modal-badge">
            <TrackerHeroSocialProofBadge />
          </div>

          <TrackappPaiementPlanSpotlightCards mode="modal" />
        </div>

        <PromoPanel active={slide} />
      </div>
    </div>
  );
}
