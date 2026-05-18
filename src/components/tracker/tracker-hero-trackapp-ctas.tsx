"use client";

import { TrackerTrackappPaymentCta } from "@/components/tracker/tracker-trackapp-payment-cta";

import "@/styles/tracker-hero-liquid-cta.css";

/** Bloc Client : la page Tracker est un Server Component ; pas d'onClick dedans. */
export function TrackerHeroTrackappCtas() {
  return (
    <div className="mt-10 flex flex-col items-center px-2 sm:mt-11">
      <TrackerTrackappPaymentCta className="tracker-hero-liquidglass">
        <span className="tracker-hero-liquidglass__label">Commencer maintenant</span>
      </TrackerTrackappPaymentCta>
    </div>
  );
}
