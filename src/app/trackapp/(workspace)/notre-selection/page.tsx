import type { Metadata } from "next";

import { TrackappApptrackerMonthlySection } from "@/components/trackapp/trackapp-apptracker-monthly-section";
import { normalizeTrackerCountryParam } from "@/lib/apple-charts";
import { getTrackappApptrackerMonthlyPicks } from "@/lib/trackapp-apptracker-monthly-picks";
import { getTrackappProfileFavorites } from "@/lib/trackapp-profile-favorites";

export const metadata: Metadata = {
  title: "Notre sélection — Trackapp",
  description: "Apps du mois sélectionnées par l’équipe Trackapp à analyser et copier de A à Z.",
};

export const revalidate = 3600;

export default async function TrackappNotreSelectionPage({
  searchParams,
}: Readonly<{
  searchParams: Promise<{ country?: string }>;
}>) {
  const sp = await searchParams;
  const country = normalizeTrackerCountryParam(sp.country);
  const [picks, { loggedIn, appIds }] = await Promise.all([
    getTrackappApptrackerMonthlyPicks(country),
    getTrackappProfileFavorites(),
  ]);

  return (
    <div className="relative z-[1] dashboard-main pb-16">
      <TrackappApptrackerMonthlySection
        country={country}
        picks={picks}
        favoritesEnabled={loggedIn}
        favoriteAppIds={appIds}
      />
    </div>
  );
}
