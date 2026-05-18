"use client";

import Link from "next/link";

import "@/styles/tracker-hero-liquid-cta.css";

/** Bloc Client : la page Tracker est un Server Component ; pas d'onClick dedans. */
export function TrackerHeroTrackappCtas() {
  return (
    <div className="mt-10 flex flex-col items-center px-2 sm:mt-11">
      <Link href="/trackapp/paiement" className="tracker-hero-liquidglass">
        <span className="tracker-hero-liquidglass__label">Commencer maintenant</span>
      </Link>
    </div>
  );
}
