"use client";

import type { CSSProperties } from "react";
import { useCallback, useEffect, useState } from "react";

import { TrackappPaiementOrderForm } from "@/components/trackapp/trackapp-paiement-order-form";
import { getTrackappPaiementPlan, setTrackappPaiementPlan } from "@/lib/trackapp-paiement-plan-storage";

const UNLOCK_LIST = [
  "Classements & tops iOS en temps réel",
  "Pipeline idée → app → prompts",
  "Ressources + affiliation intégrées",
] as const;

function SimpleChevron({ toward }: Readonly<{ toward: "next" | "prev" }>) {
  /* next = vers la droite (carte suivante), prev = vers la gauche (retour) */
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d={toward === "next" ? "M9 18l6-6-6-6" : "M15 18l-6-6 6-6"}
        stroke="currentColor"
        strokeWidth="1.65"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/** Deux cartes offre (Annuel / Mensuel) + flèches, synchro avec le toggle et le checkout. */
export function TrackappPaiementPlanSpotlightCards() {
  /** 0 = annuel, 1 = mensuel */
  const [index, setIndex] = useState(0);

  const goAnnual = useCallback(() => {
    setIndex(0);
    setTrackappPaiementPlan("yearly");
  }, []);

  const goMonthly = useCallback(() => {
    setIndex(1);
    setTrackappPaiementPlan("monthly");
  }, []);

  const syncFromStore = useCallback(() => {
    setIndex(getTrackappPaiementPlan() === "yearly" ? 0 : 1);
  }, []);

  useEffect(() => {
    syncFromStore();
    window.addEventListener("trackapp-paiement-plan", syncFromStore);
    return () => window.removeEventListener("trackapp-paiement-plan", syncFromStore);
  }, [syncFromStore]);

  const [country, setCountry] = useState("FR");

  /* 0 = carte mensuelle (1re dans le DOM), 1 = carte annuelle (2e) — centrage du peek dans le CSS */
  const carouselIndex = index === 0 ? 1 : 0;

  return (
    <div
      id="paiement-checkout"
      className="tpl-spotlight-carousel"
      role="region"
      aria-roledescription="carousel"
      aria-label="Formules Trackapp"
    >
      <div className="tpl-spotlight-carousel__viewport">
        <div
          className="tpl-spotlight-carousel__track"
          style={{ "--carousel-index": carouselIndex } as CSSProperties}
        >
          <div className="tpl-spotlight-carousel__slide">
            <div className="tpl-spotlight tpl-spotlight--monthly">
              <span className="tpl-spotlight__glow-ring" aria-hidden />
              <span className="tpl-spotlight__vignette" aria-hidden />
              <div className="tpl-spotlight__content">
                <div className="tpl-spotlight__head">
                  <p className="tpl-spotlight__name">TRACKAPP</p>
                </div>
                <p className="tpl-spotlight__desc">
                  Sans engagement — tu résilies en un clic quand tu veux.
                </p>
                <div className="tpl-credit-box">
                  <p className="tpl-credit-box__title">
                    <span aria-hidden>✦</span> Ce qui est débloqué
                  </p>
                  <ul className="tpl-credit-box__list">
                    {UNLOCK_LIST.map((line) => (
                      <li key={line}>{line}</li>
                    ))}
                  </ul>
                </div>
                <TrackappPaiementOrderForm
                  plan="monthly"
                  country={country}
                  onCountryChange={setCountry}
                  className="tpl-spotlight__order"
                />
              </div>
            </div>
          </div>

          <div className="tpl-spotlight-carousel__slide">
            <div className="tpl-spotlight">
              <span className="tpl-spotlight__glow-ring" aria-hidden />
              <span className="tpl-spotlight__vignette" aria-hidden />
              <div className="tpl-spotlight__content">
                <div className="tpl-spotlight__head">
                  <p className="tpl-spotlight__name">TRACKAPP</p>
                  <span className="tpl-spotlight__chip tpl-spotlight__chip--reduction">
                    <span className="tpl-spotlight__chip-reduction-wrap">
                      <span className="tpl-spotlight__chip-reduction-inner">
                        <span className="tpl-spotlight__chip-reduction-lead">Réduction de </span>
                        <span className="tpl-spotlight__chip-reduction-pct">-79%</span>
                      </span>
                    </span>
                  </span>
                </div>
                <p className="tpl-spotlight__desc">
                  Une facture par an — le meilleur rapport pour rester à long terme.
                </p>
                <div className="tpl-credit-box">
                  <p className="tpl-credit-box__title">
                    <span aria-hidden>✦</span> Ce qui est débloqué
                  </p>
                  <ul className="tpl-credit-box__list">
                    {UNLOCK_LIST.map((line) => (
                      <li key={line}>{line}</li>
                    ))}
                  </ul>
                </div>
                <TrackappPaiementOrderForm
                  plan="yearly"
                  country={country}
                  onCountryChange={setCountry}
                  className="tpl-spotlight__order"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Annuel : aperçu mensuel à gauche → flèche à gauche ; Mensuel : aperçu annuel à droite → flèche à droite */}
      {index === 0 ? (
        <button
          type="button"
          className="tpl-spotlight-carousel__arrow tpl-spotlight-carousel__arrow--left"
          onClick={goMonthly}
          aria-label={"Voir l'offre mensuelle"}
        >
          <SimpleChevron toward="prev" />
        </button>
      ) : (
        <button
          type="button"
          className="tpl-spotlight-carousel__arrow tpl-spotlight-carousel__arrow--right"
          onClick={goAnnual}
          aria-label={"Voir l'offre annuelle"}
        >
          <SimpleChevron toward="next" />
        </button>
      )}
    </div>
  );
}
