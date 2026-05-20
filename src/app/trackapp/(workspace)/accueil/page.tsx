import type { Metadata } from "next";
import { Suspense } from "react";

import { TrackappAccueilSearch } from "@/components/trackapp/trackapp-accueil-search";
import { TrackappCursorPromoBanner } from "@/components/trackapp/trackapp-cursor-promo-banner";
import { StripeReturnHandler } from "@/components/trackapp/stripe-return-handler";
import { normalizeTrackerCountryParam, type CountryCode } from "@/lib/apple-charts";

export const metadata: Metadata = {
  title: "Accueil — Trackapp",
  description: "Recherche App Store — même moteur que la landing Trackapp, fiches détaillées avec métriques Sensor Tower.",
};

export default async function TrackappAccueilPage({
  searchParams,
}: Readonly<{
  searchParams: Promise<{ country?: string; q?: string }>;
}>) {
  const sp = await searchParams;
  const q = typeof sp.q === "string" ? sp.q.trim() : "";
  const country = normalizeTrackerCountryParam(sp.country) as CountryCode;

  return (
    <div className="trackapp-accueil-page">
      <TrackappCursorPromoBanner />

      <div className="trackapp-accueil-page__body">
        <div className="w-full max-w-[42rem]">
          <Suspense fallback={null}>
            <StripeReturnHandler />
          </Suspense>
        </div>

        <div className="flex w-full max-w-[42rem] flex-col items-center text-center">
          <h1 className="text-balance text-[2rem] font-bold leading-[1.15] tracking-tight text-[var(--dash-text,#1a202c)] sm:text-[2.35rem] md:text-[2.75rem]">
            Recherchez n&apos;importe quel app, obtenez des insights instantanés
          </h1>
          <p className="mt-5 max-w-[540px] text-pretty text-[1.05rem] leading-relaxed text-[var(--dash-muted-light,#64748b)] italic">
            Explorez les classements et signaux publics de l&apos;App&nbsp;Store.
          </p>
        </div>

        <div className="trackapp-accueil-search-host mt-8 w-full max-w-[42rem] px-2" data-search-surface="light">
          <TrackappAccueilSearch country={country} initialQuery={q} />
        </div>
      </div>
    </div>
  );
}
