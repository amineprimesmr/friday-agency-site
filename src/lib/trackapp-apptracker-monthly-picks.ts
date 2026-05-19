import { unstable_cache } from "next/cache";

import {
  fetchAppDetail,
  fetchEnrichedTopFree,
  fetchIosAggregateAppMetrics,
  type CountryCode,
  type SearchResult,
} from "@/lib/apple-charts";
import { appDetailToSearchResultForFavorites } from "@/lib/trackapp-app-favorites-map";
import {
  metricsFromAppDetail,
  TRACKAPP_DETAIL_FALLBACK_ESTIMATE_RANK,
  type TrackappAppDisplayMetrics,
} from "@/lib/trackapp-app-display-metrics";

/** Libellé affiché en tête de page — à mettre à jour chaque mois. */
export const TRACKAPP_APPTRACKER_PICKS_MONTH_LABEL = "Mai 2026";

export type TrackappMonthlyPickDefinition = Readonly<{
  id: string;
  blurb: string;
}>;

/**
 * Références App Store (trackId) + angle éditorial « quoi recopier de A à Z ».
 * Mettre à jour la liste régulièrement selon l’actualité produit.
 */
export const TRACKAPP_APPTRACKER_MONTHLY_PICKS: readonly TrackappMonthlyPickDefinition[] = [
  {
    id: "6739003582",
    blurb:
      "Hooks viraux, génération IA et paywall rapide : référence pour une app créateur orientée TikTok/Reels avec forte intention d’achat.",
  },
  {
    id: "6478868302",
    blurb:
      "Texte → vidéo, templates et crédits : modèle clair pour monétiser une app IA visuelle sans onboarding lourd.",
  },
  {
    id: "6746838126",
    blurb:
      "Avant/après, scan facial et promesse esthétique : blueprint utilitaire bien-être avec preuve visuelle et abonnement premium.",
  },
  {
    id: "6498938838",
    blurb:
      "Suivi sommeil, routines santé et rétention quotidienne : à étudier pour les dashboards, notifications et habitude long terme.",
  },
  {
    id: "1551099110",
    blurb:
      "Programmes guidés, exercices courts et niche wellness : exemple solide d’app niche avec contenu récurrent et upsell abonnement.",
  },
  {
    id: "6478942469",
    blurb:
      "Challenge 66 jours, streaks et reset de vie : structure idéale pour gamifier les habitudes avec un arc temporel fort.",
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

    /** Sensor Tower rate-limit (429) si trop d’appels parallèles — séquentiel comme sur la fiche. */
    const aggregateMetricsList: Awaited<ReturnType<typeof fetchIosAggregateAppMetrics>>[] = [];
    for (const def of TRACKAPP_APPTRACKER_MONTHLY_PICKS) {
      aggregateMetricsList.push(await fetchIosAggregateAppMetrics(def.id));
    }

    const rows = TRACKAPP_APPTRACKER_MONTHLY_PICKS.map((def, i) => {
      const detail = details[i];
      if (!detail) return null;
      const metrics = metricsFromAppDetail(
        detail,
        country,
        aggregateMetricsList[i] ?? null,
        enrichedNationalTop,
        TRACKAPP_DETAIL_FALLBACK_ESTIMATE_RANK,
      );
      return {
        app: appDetailToSearchResultForFavorites(detail, i + 1),
        blurb: def.blurb,
        metrics,
      } satisfies TrackappMonthlyPickResolved;
    });
    return rows.filter((x): x is TrackappMonthlyPickResolved => x != null);
  },
  ["trackapp-apptracker-monthly-picks-v4"],
  { revalidate: 3600 },
);
