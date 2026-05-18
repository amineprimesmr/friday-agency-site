import type { Metadata } from "next";

import { TrackappApptrackerMonthlySection } from "@/components/trackapp/trackapp-apptracker-monthly-section";
import { getTrackappApptrackerMonthlyPicks } from "@/lib/trackapp-apptracker-monthly-picks";
import { normalizeTrackerCountryParam } from "@/lib/apple-charts";
import { getTrackappProfileFavorites } from "@/lib/trackapp-profile-favorites";

export const metadata: Metadata = {
  title: "Apps du mois — Apptracker",
  description:
    "Sélection Trackapp des meilleures apps à analyser et à copier de A à Z : fiches complètes et métriques.",
};

export const revalidate = 3600;

export default async function TrackappApptrackerPage({
  searchParams,
}: Readonly<{
  searchParams: Promise<{ country?: string }>;
}>) {
  const sp = await searchParams;
  const country = normalizeTrackerCountryParam(sp.country);
  const picks = await getTrackappApptrackerMonthlyPicks(country);
  const { loggedIn, appIds } = await getTrackappProfileFavorites();

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
