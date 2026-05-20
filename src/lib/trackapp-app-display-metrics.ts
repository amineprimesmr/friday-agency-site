import {
  estimateMonthlyDownloads,
  fetchAppDetail,
  fetchEnrichedTopFree,
  fetchIosAggregateAppMetrics,
  genreSliceRankInTop100Free,
  overallRankInTop100Free,
  type AppDetail,
  type CountryCode,
  type IosAggregateAppMetrics,
  type SearchResult,
} from "@/lib/apple-charts";
import {
  formatEstimatedMonthlyRevenuePreciseEur,
  formatTrackappAggregateRevenueEur,
} from "@/lib/trackapp-revenue-display";

/** Métriques mensuelles affichées sur cartes liste / sélection — même logique que la fiche app. */
export type TrackappAppDisplayMetrics = Readonly<{
  downloadsDisplay: string;
  revenueDisplay: string;
  metricSource: "agrégé monde / mois" | "estimation / mois" | "estimation indicative / mois" | "donnée indisponible";
}>;

type AppMetricInput = Readonly<{
  id: string;
  price: number;
  categoryId: string;
  primaryGenreId?: string;
}>;

type EnrichedTop = Awaited<ReturnType<typeof fetchEnrichedTopFree>>;

const EMPTY_METRICS: TrackappAppDisplayMetrics = {
  downloadsDisplay: "—",
  revenueDisplay: "—",
  metricSource: "donnée indisponible",
};

function chartRankForApp(appId: string, primaryGenreId: string | undefined, enrichedNationalTop: EnrichedTop): number | null {
  const overallRank = overallRankInTop100Free(appId, enrichedNationalTop);
  const genreSliceRank = genreSliceRankInTop100Free(appId, primaryGenreId ?? "", enrichedNationalTop);
  return overallRank ?? genreSliceRank;
}

/** Rang indicatif hors top 100 — même comportement que l’ancienne fiche apptracker. */
export const TRACKAPP_DETAIL_FALLBACK_ESTIMATE_RANK = 50;

/** Calcule téléchargements + revenus comme sur `/trackapp/apptracker/[id]`. */
export function computeTrackappAppDisplayMetrics(
  app: AppMetricInput,
  country: CountryCode,
  aggregateMetrics: IosAggregateAppMetrics | null,
  chartRank: number | null,
  fallbackEstimateRank: number | null = null,
): TrackappAppDisplayMetrics {
  const useAggregateMetrics = Boolean(
    aggregateMetrics && aggregateMetrics.downloadsString !== "—" && aggregateMetrics.revenueString !== "—",
  );

  if (useAggregateMetrics && aggregateMetrics) {
    return {
      downloadsDisplay: aggregateMetrics.downloadsString.toUpperCase(),
      revenueDisplay: formatTrackappAggregateRevenueEur(aggregateMetrics, app.id),
      metricSource: "agrégé monde / mois",
    };
  }

  const estimateRank = chartRank ?? fallbackEstimateRank;
  if (estimateRank !== null) {
    return {
      downloadsDisplay: estimateMonthlyDownloads(estimateRank, country),
      revenueDisplay: formatEstimatedMonthlyRevenuePreciseEur(
        estimateRank,
        app.price,
        app.primaryGenreId || app.categoryId,
        country,
        app.id,
      ),
      metricSource: chartRank !== null ? "estimation / mois" : "estimation indicative / mois",
    };
  }

  return EMPTY_METRICS;
}

export async function resolveTrackappAppDisplayMetrics(
  appId: string,
  country: CountryCode,
): Promise<TrackappAppDisplayMetrics | null> {
  const [app, aggregateMetrics, enrichedNationalTop] = await Promise.all([
    fetchAppDetail(appId, country),
    fetchIosAggregateAppMetrics(appId),
    fetchEnrichedTopFree(country, 100),
  ]);
  if (!app) return null;

  const chartRank = chartRankForApp(app.id, app.primaryGenreId, enrichedNationalTop);
  return computeTrackappAppDisplayMetrics(app, country, aggregateMetrics, chartRank);
}

/** Enrichit plusieurs apps en une passe (top 100 national chargé une seule fois). */
export async function resolveTrackappAppsDisplayMetricsBatch(
  appIds: readonly string[],
  country: CountryCode,
): Promise<Map<string, TrackappAppDisplayMetrics>> {
  const uniqueIds = [...new Set(appIds.filter(Boolean))];
  if (uniqueIds.length === 0) return new Map();

  const enrichedNationalTop = await fetchEnrichedTopFree(country, 100);

  const entries = await Promise.all(
    uniqueIds.map(async (appId) => {
      const [app, aggregateMetrics] = await Promise.all([
        fetchAppDetail(appId, country),
        fetchIosAggregateAppMetrics(appId),
      ]);
      if (!app) return null;
      const chartRank = chartRankForApp(app.id, app.primaryGenreId, enrichedNationalTop);
      return [appId, computeTrackappAppDisplayMetrics(app, country, aggregateMetrics, chartRank)] as const;
    }),
  );

  const map = new Map<string, TrackappAppDisplayMetrics>();
  for (const row of entries) {
    if (row) map.set(row[0], row[1]);
  }
  return map;
}

export function metricsFromAppDetail(
  detail: AppDetail,
  country: CountryCode,
  aggregateMetrics: IosAggregateAppMetrics | null,
  enrichedNationalTop: EnrichedTop,
  fallbackEstimateRank: number | null = null,
): TrackappAppDisplayMetrics {
  const chartRank = chartRankForApp(detail.id, detail.primaryGenreId, enrichedNationalTop);
  return computeTrackappAppDisplayMetrics(
    detail,
    country,
    aggregateMetrics,
    chartRank,
    fallbackEstimateRank,
  );
}

export type SearchResultWithTrackappMetrics = SearchResult & {
  trackappMetrics: TrackappAppDisplayMetrics;
};

export async function enrichSearchResultsWithTrackappMetrics(
  apps: readonly SearchResult[],
  country: CountryCode,
): Promise<SearchResultWithTrackappMetrics[]> {
  if (apps.length === 0) return [];

  // Search must stay instant. The detail page still resolves SensorTower/global metrics,
  // but the result list uses deterministic estimates from the iTunes Search payload.
  return apps.map((app) => ({
    ...app,
    trackappMetrics: computeTrackappAppDisplayMetrics(
      app,
      country,
      null,
      null,
      Math.max(1, Math.min(app.rank || TRACKAPP_DETAIL_FALLBACK_ESTIMATE_RANK, 100)),
    ),
  }));
}

/** Utilitaire fiche détail — évite de dupliquer la logique dans la page. */
export function metricsFromEmbedContext(
  app: AppMetricInput,
  country: CountryCode,
  aggregateMetrics: IosAggregateAppMetrics | null,
  overallRank: number | null,
  genreSliceRank: number | null,
): TrackappAppDisplayMetrics {
  const chartRank = overallRank ?? genreSliceRank;
  return computeTrackappAppDisplayMetrics(
    app,
    country,
    aggregateMetrics,
    chartRank,
    TRACKAPP_DETAIL_FALLBACK_ESTIMATE_RANK,
  );
}
