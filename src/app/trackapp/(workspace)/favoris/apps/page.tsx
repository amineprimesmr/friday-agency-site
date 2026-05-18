import type { Metadata } from "next";

import { TrackappAppFavoriteRow } from "@/components/trackapp/trackapp-app-favorite-row";
import { TrackappApptrackerAppResultCard } from "@/components/trackapp/trackapp-apptracker-app-result-card";
import { fetchAppDetail, normalizeTrackerCountryParam } from "@/lib/apple-charts";
import { appDetailToSearchResultForFavorites } from "@/lib/trackapp-app-favorites-map";
import { getTrackappProfileFavorites } from "@/lib/trackapp-profile-favorites";

export const metadata: Metadata = {
  title: "Favoris — Apps",
  description: "Apps que tu as enregistrées en favori.",
};

export default async function TrackappFavoriteAppsPage({
  searchParams,
}: Readonly<{
  searchParams: Promise<{ country?: string }>;
}>) {
  const sp = await searchParams;
  const country = normalizeTrackerCountryParam(sp.country);
  const { loggedIn, appIds } = await getTrackappProfileFavorites();

  const rows = await Promise.all(
    appIds.map(async (id, rankIdx) => {
      const detail = await fetchAppDetail(id, country);
      if (!detail) return null;
      return { app: appDetailToSearchResultForFavorites(detail, rankIdx + 1), id };
    }),
  );
  const picks = rows.filter((x): x is NonNullable<typeof x> => x != null);

  return (
    <div className="relative z-[1] dashboard-main pb-16">
      <section className="dashboard-section">
        <p className="trackapp-workspace-hero-kicker">Favoris</p>
        <h1 className="trackapp-workspace-hero-title">Apps</h1>
        <p className="trackapp-workspace-hero-desc max-w-[68ch]">
          Raccourci vers les fiches App Store que tu as ajoutées en favori. Astuce : le cœur sur chaque carte ouvre cette liste.
        </p>
      </section>

      {!loggedIn ? (
        <p className="rounded-2xl border border-dashed border-slate-300 bg-white p-6 text-[0.92rem] text-[var(--dash-muted-light)]">
          Connecte-toi pour synchroniser tes favoris.
        </p>
      ) : picks.length === 0 ? (
        <p className="rounded-2xl border border-dashed border-slate-300 bg-white p-6 text-[0.92rem] text-[var(--dash-muted-light)]">
          Aucune app en favori pour l’instant. Ajoute-en depuis la recherche, les apps du mois ou une fiche détaillée.
        </p>
      ) : (
        <div className="grid gap-3">
          {picks.map(({ app }) => (
            <TrackappAppFavoriteRow
              key={app.id}
              appId={app.id}
              initialFavorite
              favoritesEnabled={loggedIn}
            >
              <TrackappApptrackerAppResultCard
                app={app}
                country={country}
                className={loggedIn ? "pr-12 md:pr-14" : undefined}
              />
            </TrackappAppFavoriteRow>
          ))}
        </div>
      )}
    </div>
  );
}
