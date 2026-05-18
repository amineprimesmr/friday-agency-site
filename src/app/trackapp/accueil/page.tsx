import type { Metadata } from "next";

import { TrackappAccueilLanding } from "@/components/trackapp/trackapp-accueil-landing";
import { TrackappApptrackerSearchSection } from "@/components/trackapp/trackapp-apptracker-search-section";
import { TrackappCursorPromoBanner } from "@/components/trackapp/trackapp-cursor-promo-banner";
import { normalizeTrackerCountryParam } from "@/lib/apple-charts";
import { cachedTrackappApptrackerSearch } from "@/lib/trackapp-apptracker-search";

export const metadata: Metadata = {
  title: "Accueil — Trackapp",
};

export const revalidate = 300;

export default async function TrackappAccueilPage({
  searchParams,
}: Readonly<{
  searchParams: Promise<{ q?: string; country?: string }>;
}>) {
  const sp = await searchParams;
  const q = typeof sp.q === "string" ? sp.q.trim() : "";
  const country = normalizeTrackerCountryParam(sp.country);
  const results = q ? await cachedTrackappApptrackerSearch(q, country) : [];

  return (
    <div className="trackapp-accueil-page">
      <TrackappCursorPromoBanner />

      <div className="trackapp-accueil-page__body">
        <div className="w-full max-w-[720px]">
          <TrackappAccueilLanding />
        </div>
        <div className="dashboard-main mt-10 w-full max-w-[1100px] pb-16">
          <TrackappApptrackerSearchSection
            action="/trackapp/accueil"
            q={q}
            country={country}
            results={results}
          />
        </div>
      </div>
    </div>
  );
}
