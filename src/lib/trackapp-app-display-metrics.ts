import {
  estimateMonthlyDownloads,
  estimateMonthlyRevenueUsd,
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
  /** Classement top 100 national (ou slice genre) — pas le rang dans les résultats iTunes Search. */
  chartRank: number | null;
  /** Clés internes pour trier les listes sans réutiliser le faux rang Search. */
  sortRevenueUsd: number;
  sortDownloads: number;
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
  chartRank: null,
  sortRevenueUsd: 0,
  sortDownloads: 0,
};

function parseDownloadsDisplayToSortValue(label: string, aggregateDownloads: number): number {
  if (aggregateDownloads > 0) return aggregateDownloads;
  const s = label.trim().toUpperCase();
  if (!s || s === "—") return 0;
  const m = s.match(/([\d.]+)\s*([KMB])?/);
  if (!m) return 0;
  let n = Number(m[1]);
  if (!Number.isFinite(n)) return 0;
  const unit = m[2];
  if (unit === "K") n *= 1000;
  else if (unit === "M") n *= 1_000_000;
  else if (unit === "B") n *= 1_000_000_000;
  return n;
}

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
    const downloadsDisplay = aggregateMetrics.downloadsString.toUpperCase();
    return {
      downloadsDisplay,
      revenueDisplay: formatTrackappAggregateRevenueEur(aggregateMetrics, app.id),
      metricSource: "agrégé monde / mois",
      chartRank,
      sortRevenueUsd: aggregateMetrics.revenue > 0 ? aggregateMetrics.revenue : 0,
      sortDownloads: parseDownloadsDisplayToSortValue(downloadsDisplay, aggregateMetrics.downloads),
    };
  }

  const estimateRank = chartRank ?? fallbackEstimateRank;
  if (estimateRank !== null) {
    const downloadsDisplay = estimateMonthlyDownloads(estimateRank, country);
    const categoryId = app.primaryGenreId || app.categoryId;
    return {
      downloadsDisplay,
      revenueDisplay: formatEstimatedMonthlyRevenuePreciseEur(
        estimateRank,
        app.price,
        categoryId,
        country,
        app.id,
      ),
      metricSource: chartRank !== null ? "estimation / mois" : "estimation indicative / mois",
      chartRank,
      sortRevenueUsd: estimateMonthlyRevenueUsd(estimateRank, app.price, categoryId, country),
      sortDownloads: parseDownloadsDisplayToSortValue(downloadsDisplay, 0),
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

  /** Sensor Tower limite en rafale (429) — séquentiel comme sur la fiche / notre sélection. */
  const entries: Array<readonly [string, TrackappAppDisplayMetrics] | null> = [];
  for (const appId of uniqueIds) {
    const app = await fetchAppDetail(appId, country);
    if (!app) {
      entries.push(null);
      continue;
    }
    const aggregateMetrics = await fetchIosAggregateAppMetrics(appId);
    const chartRank = chartRankForApp(app.id, app.primaryGenreId, enrichedNationalTop);
    entries.push([
      appId,
      computeTrackappAppDisplayMetrics(app, country, aggregateMetrics, chartRank),
    ] as const);
  }

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

/**
 * Même source de vérité que `/trackapp/apptracker/[id]` :
 * agrégat Sensor Tower si dispo, sinon estimation via top 100 (jamais le rang #1/#2 de la recherche iTunes).
 */
export async function enrichSearchResultsWithTrackappMetrics(
  apps: readonly SearchResult[],
  country: CountryCode,
): Promise<SearchResultWithTrackappMetrics[]> {
  if (apps.length === 0) return [];

  const metricsMap = await resolveTrackappAppsDisplayMetricsBatch(
    apps.map((app) => app.id),
    country,
  );

  return apps.map((app) => ({
    ...app,
    trackappMetrics: metricsMap.get(app.id) ?? EMPTY_METRICS,
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
