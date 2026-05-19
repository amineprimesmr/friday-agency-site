"use client";

import type { CSSProperties } from "react";
import { useCallback, useEffect, useState } from "react";

import { TrackappPaiementOrderForm } from "@/components/trackapp/trackapp-paiement-order-form";
import { openTrackappStripeCheckout } from "@/lib/trackapp/stripe-payment-links";
import { TRACKAPP_PAIEMENT_UNLOCK_ITEMS } from "@/lib/trackapp-paiement-unlock-items";
import { getTrackappPaiementPlan, setTrackappPaiementPlan } from "@/lib/trackapp-paiement-plan-storage";

function UnlockCreditBox({
  priceAmount,
  priceNote = "sans engagement",
}: Readonly<{ priceAmount: string; priceNote?: string }>) {
  return (
    <div className="tpl-credit-box">
      <div className="tpl-credit-box__price">
        <p className="tpl-credit-box__price-value">
          {priceAmount}
          <span className="tpl-credit-box__price-period"> /mois</span>
        </p>
        <p className="tpl-credit-box__price-note">{priceNote}</p>
      </div>
      <p className="tpl-credit-box__title">Ce que tu débloques après achat :</p>
      <ul className="tpl-credit-box__list">
        {TRACKAPP_PAIEMENT_UNLOCK_ITEMS.map((line) => (
          <li key={line} className="tpl-credit-box__list-item">
            <span className="tpl-credit-box__check" aria-hidden>
              ✓
            </span>
            <span>{line}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

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

function SpotlightOfferCheckout({
  plan,
  priceAmount,
  priceNote,
  checkoutReveal,
  checkoutRevealed,
  onRevealCheckout,
  directStripeLink = false,
  country,
  onCountryChange,
}: Readonly<{
  plan: "monthly" | "yearly";
  priceAmount: string;
  priceNote?: string;
  checkoutReveal: boolean;
  checkoutRevealed: boolean;
  onRevealCheckout: () => void;
  directStripeLink?: boolean;
  country: string;
  onCountryChange: (code: string) => void;
}>) {
  const [stripeBusy, setStripeBusy] = useState(false);

  const goStripe = useCallback(async () => {
    if (stripeBusy) return;
    setStripeBusy(true);
    try {
      await openTrackappStripeCheckout(plan);
    } catch {
      setStripeBusy(false);
    }
  }, [plan, stripeBusy]);

  if (directStripeLink) {
    return (
      <div className="tpl-spotlight__checkout-intro">
        <UnlockCreditBox priceAmount={priceAmount} priceNote={priceNote} />
        <button type="button" className="tpl-spotlight__join" onClick={goStripe} disabled={stripeBusy}>
          {stripeBusy ? "Redirection…" : "Rejoindre"}
        </button>
      </div>
    );
  }

  if (checkoutReveal && !checkoutRevealed) {
    return (
      <div className="tpl-spotlight__checkout-intro">
        <UnlockCreditBox priceAmount={priceAmount} priceNote={priceNote} />
        <button type="button" className="tpl-spotlight__join" onClick={onRevealCheckout}>
          Rejoindre
        </button>
      </div>
    );
  }

  if (checkoutReveal && checkoutRevealed) {
    return (
      <TrackappPaiementOrderForm
        plan={plan}
        country={country}
        onCountryChange={onCountryChange}
        className="tpl-spotlight__order tpl-spotlight__order--revealed"
        hideWalletHero
      />
    );
  }

  return (
    <>
      <UnlockCreditBox priceAmount={priceAmount} priceNote={priceNote} />
      <TrackappPaiementOrderForm
        plan={plan}
        country={country}
        onCountryChange={onCountryChange}
        className="tpl-spotlight__order"
      />
    </>
  );
}

/** Deux cartes offre (Annuel / Mensuel) + flèches, synchro avec le toggle et le checkout. */
export function TrackappPaiementPlanSpotlightCards({
  className,
  mode = "page",
  checkoutReveal = false,
  checkoutRevealed: checkoutRevealedProp,
  onCheckoutRevealedChange,
}: Readonly<{
  className?: string;
  /** Modale bureau : 2 cartes côte à côte, clic Rejoindre → Payment Link Stripe. */
  mode?: "page" | "modal";
  checkoutReveal?: boolean;
  checkoutRevealed?: boolean;
  onCheckoutRevealedChange?: (revealed: boolean) => void;
}>) {
  if (mode === "modal") {
    return <ModalSpotlightGrid className={className} />;
  }

  return (
    <PageSpotlightCarousel
      className={className}
      checkoutReveal={checkoutReveal}
      checkoutRevealedProp={checkoutRevealedProp}
      onCheckoutRevealedChange={onCheckoutRevealedChange}
    />
  );
}

function PageSpotlightCarousel({
  className,
  checkoutReveal,
  checkoutRevealedProp,
  onCheckoutRevealedChange,
}: Readonly<{
  className?: string;
  checkoutReveal: boolean;
  checkoutRevealed?: boolean;
  onCheckoutRevealedChange?: (revealed: boolean) => void;
}>) {
  /** 0 = annuel, 1 = mensuel */
  const [index, setIndex] = useState(0);
  const [internalCheckoutRevealed, setInternalCheckoutRevealed] = useState(false);
  const isCheckoutControlled = checkoutRevealedProp !== undefined && onCheckoutRevealedChange !== undefined;
  const checkoutRevealed = isCheckoutControlled ? checkoutRevealedProp : internalCheckoutRevealed;

  const revealCheckout = useCallback(() => {
    if (isCheckoutControlled) onCheckoutRevealedChange(true);
    else setInternalCheckoutRevealed(true);
  }, [isCheckoutControlled, onCheckoutRevealedChange]);

  const resetCheckout = useCallback(() => {
    if (isCheckoutControlled) onCheckoutRevealedChange(false);
    else setInternalCheckoutRevealed(false);
  }, [isCheckoutControlled, onCheckoutRevealedChange]);

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

  useEffect(() => {
    resetCheckout();
  }, [index, resetCheckout]);

  const [country, setCountry] = useState("FR");

  /* 0 = carte mensuelle (1re dans le DOM), 1 = carte annuelle (2e) — centrage du peek dans le CSS */
  const carouselIndex = index === 0 ? 1 : 0;
  const showMonthlySlide = !checkoutReveal || !checkoutRevealed || index === 1;
  const showAnnualSlide = !checkoutReveal || !checkoutRevealed || index === 0;

  return (
    <div
      id="paiement-checkout"
      className={[
        "tpl-spotlight-carousel",
        className,
        checkoutReveal ? "tpl-spotlight-carousel--checkout-reveal" : "",
        checkoutReveal && checkoutRevealed ? "tpl-spotlight-carousel--checkout-open" : "",
      ]
        .filter(Boolean)
        .join(" ")}
      role="region"
      aria-roledescription="carousel"
      aria-label="Formules Trackapp"
    >
      <div className="tpl-spotlight-carousel__viewport">
        <div
          className="tpl-spotlight-carousel__track"
          style={{ "--carousel-index": checkoutRevealed ? 0 : carouselIndex } as CSSProperties}
        >
          {showMonthlySlide ? (
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
                  <SpotlightOfferCheckout
                    plan="monthly"
                    priceAmount="39€"
                    checkoutReveal={checkoutReveal}
                    checkoutRevealed={checkoutRevealed && index === 1}
                    onRevealCheckout={revealCheckout}
                    country={country}
                    onCountryChange={setCountry}
                  />
                </div>
              </div>
            </div>
          ) : null}

          {showAnnualSlide ? (
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
                    Le meilleur rapport pour rester à long terme.
                  </p>
                  <SpotlightOfferCheckout
                    plan="yearly"
                    priceAmount="8,25€"
                    priceNote="sans engagement - facturé annuellement"
                    checkoutReveal={checkoutReveal}
                    checkoutRevealed={checkoutRevealed && index === 0}
                    onRevealCheckout={revealCheckout}
                    country={country}
                    onCountryChange={setCountry}
                  />
                </div>
              </div>
            </div>
          ) : null}
        </div>
      </div>

      {!checkoutRevealed && index === 0 ? (
        <button
          type="button"
          className="tpl-spotlight-carousel__arrow tpl-spotlight-carousel__arrow--left"
          onClick={goMonthly}
          aria-label={"Voir l'offre mensuelle"}
        >
          <SimpleChevron toward="prev" />
        </button>
      ) : null}

      {!checkoutRevealed && index === 1 ? (
        <button
          type="button"
          className="tpl-spotlight-carousel__arrow tpl-spotlight-carousel__arrow--right"
          onClick={goAnnual}
          aria-label={"Voir l'offre annuelle"}
        >
          <SimpleChevron toward="next" />
        </button>
      ) : null}
    </div>
  );
}

function ModalSpotlightGrid({ className }: Readonly<{ className?: string }>) {
  return (
    <div
      className={[
        "tpl-spotlight-carousel",
        "tpl-spotlight-carousel--modal-grid",
        "tpl-spotlight-carousel--checkout-reveal",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
      role="group"
      aria-label="Formules Trackapp"
    >
      <div className="tpl-spotlight-carousel__viewport">
        <div className="tpl-spotlight-carousel__track">
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
                <p className="tpl-spotlight__desc">Le meilleur rapport pour rester à long terme.</p>
                <SpotlightOfferCheckout
                  plan="yearly"
                  priceAmount="8,25€"
                  priceNote="sans engagement - facturé annuellement"
                  checkoutReveal
                  checkoutRevealed={false}
                  onRevealCheckout={() => {}}
                  directStripeLink
                  country="FR"
                  onCountryChange={() => {}}
                />
              </div>
            </div>
          </div>

          <div className="tpl-spotlight-carousel__slide">
            <div className="tpl-spotlight tpl-spotlight--monthly">
              <span className="tpl-spotlight__glow-ring" aria-hidden />
              <span className="tpl-spotlight__vignette" aria-hidden />
              <div className="tpl-spotlight__content">
                <div className="tpl-spotlight__head">
                  <p className="tpl-spotlight__name">TRACKAPP</p>
                </div>
                <p className="tpl-spotlight__desc">Sans engagement — tu résilies en un clic quand tu veux.</p>
                <SpotlightOfferCheckout
                  plan="monthly"
                  priceAmount="39€"
                  checkoutReveal
                  checkoutRevealed={false}
                  onRevealCheckout={() => {}}
                  directStripeLink
                  country="FR"
                  onCountryChange={() => {}}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
