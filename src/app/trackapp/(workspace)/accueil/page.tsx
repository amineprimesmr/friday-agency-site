import type { Metadata } from "next";
import { Suspense } from "react";

import { TrackappAccueilLanding } from "@/components/trackapp/trackapp-accueil-landing";
import { TrackappApptrackerSearchSection } from "@/components/trackapp/trackapp-apptracker-search-section";
import { TrackappCursorPromoBanner } from "@/components/trackapp/trackapp-cursor-promo-banner";
import { StripeReturnHandler } from "@/components/trackapp/stripe-return-handler";
import { normalizeTrackerCountryParam } from "@/lib/apple-charts";
import { TRACKAPP_ACCUEIL_BASE } from "@/lib/trackapp-apptracker-paths";
import { cachedTrackappApptrackerSearch } from "@/lib/trackapp-apptracker-search";
import { getTrackappProfileFavorites } from "@/lib/trackapp-profile-favorites";

export const metadata: Metadata = {
  title: "Accueil — Trackapp",
  description: "Recherche App Store et analyse d’apps dans l’espace Trackapp.",
};

export const revalidate = 300;

export default async function TrackappAccueilPage({
  searchParams,
}: Readonly<{
  searchParams: Promise<{ country?: string; q?: string }>;
}>) {
  const sp = await searchParams;
  const q = typeof sp.q === "string" ? sp.q.trim() : "";
  const country = normalizeTrackerCountryParam(sp.country);
  const [results, { loggedIn, appIds }] = await Promise.all([
    q.length >= 2 ? cachedTrackappApptrackerSearch(q, country) : Promise.resolve([]),
    getTrackappProfileFavorites(),
  ]);

  return (
    <div className="trackapp-accueil-page">
      <TrackappCursorPromoBanner />

      <div className="trackapp-accueil-page__body">
        <div className="w-full max-w-[720px]">
          <Suspense fallback={null}>
            <StripeReturnHandler />
          </Suspense>
        </div>
        <div className="w-full max-w-[720px]">
          <TrackappAccueilLanding />
        </div>
        <div className="dashboard-main mt-10 w-full max-w-[1100px] pb-16">
          <TrackappApptrackerSearchSection
            q={q}
            country={country}
            results={results}
            favoritesEnabled={loggedIn}
            favoriteAppIds={appIds}
            syncUrlPath={TRACKAPP_ACCUEIL_BASE}
          />
        </div>
      </div>
    </div>
  );
}
