import { unstable_cache } from "next/cache";

import {
  fetchAppDetail,
  fetchEnrichedTopFree,
  fetchIosAggregateAppMetricsBatch,
  type CountryCode,
  type SearchResult,
} from "@/lib/apple-charts";
import { appDetailToSearchResultForFavorites } from "@/lib/trackapp-app-favorites-map";
import { metricsFromAppDetail, type TrackappAppDisplayMetrics } from "@/lib/trackapp-app-display-metrics";

/** Libellé affiché en tête de page — à mettre à jour chaque mois. */
export const TRACKAPP_APPTRACKER_PICKS_MONTH_LABEL = "Mai 2026";

export type TrackappMonthlyPickDefinition = Readonly<{
  id: string;
  blurb: string;
}>;

/**
 * Sélection éditoriale Mai 2026 — anciennes apps du carrousel vidéo.
 */
export const TRACKAPP_APPTRACKER_MONTHLY_PICKS: readonly TrackappMonthlyPickDefinition[] = [
  {
    id: "6745237476",
    blurb:
      "Micro-learning et habitudes courtes : modèle efficace pour une app éducative avec streaks, notifications et abonnement mensuel.",
  },
  {
    id: "6746164787",
    blurb:
      "Social léger et preuve entre amis : blueprint pour une app virale avec onboarding rapide et monétisation par abonnement.",
  },
  {
    id: "1600525061",
    blurb:
      "Widget photo, partage intime et rétention émotionnelle : référence pour une app relationnelle avec forte viralité organique.",
  },
  {
    id: "1491340863",
    blurb:
      "Sommeil, routines du soir et contenu apaisant : niche wellness avec abonnement premium et habitude quotidienne.",
  },
  {
    id: "1286609883",
    blurb:
      "Cours de langue gamifiés, leçons courtes et paywall progressif : structure à copier pour une app éducative à fort LTV.",
  },
  {
    id: "6446290569",
    blurb:
      "Utilitaire Apple Watch, données santé et UI minimaliste : exemple solide pour une app accessoire avec abonnement récurrent.",
  },
];

export type TrackappMonthlyPickResolved = Readonly<{
  app: SearchResult;
  blurb: string;
  metrics: TrackappAppDisplayMetrics;
}>;

export const getTrackappApptrackerMonthlyPicks = unstable_cache(
  async (country: CountryCode) => {
    const enrichedNationalTop = await fetchEnrichedTopFree(country, 100);

    const details = await Promise.all(
      TRACKAPP_APPTRACKER_MONTHLY_PICKS.map((def) => fetchAppDetail(def.id, country)),
    );

    const aggMap = await fetchIosAggregateAppMetricsBatch(
      TRACKAPP_APPTRACKER_MONTHLY_PICKS.map((def) => def.id),
      { timeoutMs: 8_000 },
    );

    const rows = TRACKAPP_APPTRACKER_MONTHLY_PICKS.map((def, i) => {
      const detail = details[i];
      if (!detail) return null;
      const metrics = metricsFromAppDetail(
        detail,
        country,
        aggMap.get(def.id) ?? null,
        enrichedNationalTop,
      );
      return {
        app: appDetailToSearchResultForFavorites(detail, i + 1),
        blurb: def.blurb,
        metrics,
      } satisfies TrackappMonthlyPickResolved;
    });
    return rows.filter((x): x is TrackappMonthlyPickResolved => x != null);
  },
  ["trackapp-apptracker-monthly-picks-v5"],
  { revalidate: 3600 },
);
