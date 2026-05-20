import { unstable_cache } from "next/cache";

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

/** Métriques mensuelles — une seule résolution pour fiche, recherche, favoris, tri. */
export type TrackappAppDisplayMetrics = Readonly<{
  downloadsDisplay: string;
  revenueDisplay: string;
  metricSource: "agrégé monde / mois" | "estimation / mois" | "estimation indicative / mois" | "donnée indisponible";
  chartRank: number | null;
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

export const EMPTY_METRICS: TrackappAppDisplayMetrics = {
  downloadsDisplay: "—",
  revenueDisplay: "—",
  metricSource: "donnée indisponible",
  chartRank: null,
  sortRevenueUsd: 0,
  sortDownloads: 0,
};

/** Rang indicatif hors top 100 — identique fiche Apptracker. */
export const TRACKAPP_DETAIL_FALLBACK_ESTIMATE_RANK = 50;

const ST_RETRY_ATTEMPTS = 3;
const ST_RETRY_DELAY_MS = 400;
const BATCH_METRICS_CONCURRENCY = 3;

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

function hasUsableAggregate(aggregateMetrics: IosAggregateAppMetrics): boolean {
  const hasDl =
    aggregateMetrics.downloads > 0 ||
    (aggregateMetrics.downloadsString.trim() !== "" && aggregateMetrics.downloadsString !== "—");
  const hasRev =
    aggregateMetrics.revenue > 0 ||
    (aggregateMetrics.revenueString.trim() !== "" && aggregateMetrics.revenueString !== "—");
  return hasDl || hasRev;
}

function chartRankForApp(
  appId: string,
  primaryGenreId: string | undefined,
  enrichedNationalTop: EnrichedTop,
): number | null {
  const overallRank = overallRankInTop100Free(appId, enrichedNationalTop);
  const genreSliceRank = genreSliceRankInTop100Free(appId, primaryGenreId ?? "", enrichedNationalTop);
  return overallRank ?? genreSliceRank;
}

async function sleep(ms: number): Promise<void> {
  await new Promise((resolve) => setTimeout(resolve, ms));
}

async function fetchIosAggregateAppMetricsWithRetry(
  appId: string,
): Promise<IosAggregateAppMetrics | null> {
  for (let attempt = 0; attempt < ST_RETRY_ATTEMPTS; attempt += 1) {
    const metrics = await fetchIosAggregateAppMetrics(appId);
    if (metrics && hasUsableAggregate(metrics)) return metrics;
    if (attempt < ST_RETRY_ATTEMPTS - 1) {
      await sleep(ST_RETRY_DELAY_MS * (attempt + 1));
    }
  }
  return null;
}

const getIosAggregateAppMetricsCached = (appId: string) =>
  unstable_cache(
    () => fetchIosAggregateAppMetricsWithRetry(appId),
    ["trackapp-ios-aggregate-metrics-v2", appId],
    { revalidate: 3600 },
  );

/** Calcule téléchargements + revenus — toujours avec fallback #50 comme la fiche. */
export function computeTrackappAppDisplayMetrics(
  app: AppMetricInput,
  country: CountryCode,
  aggregateMetrics: IosAggregateAppMetrics | null,
  chartRank: number | null,
  fallbackEstimateRank: number | null = TRACKAPP_DETAIL_FALLBACK_ESTIMATE_RANK,
): TrackappAppDisplayMetrics {
  if (aggregateMetrics && hasUsableAggregate(aggregateMetrics)) {
    const downloadsDisplay =
      aggregateMetrics.downloadsString !== "—" && aggregateMetrics.downloadsString.trim()
        ? aggregateMetrics.downloadsString.toUpperCase()
        : aggregateMetrics.downloads > 0
          ? estimateMonthlyDownloads(
              chartRank ?? fallbackEstimateRank ?? TRACKAPP_DETAIL_FALLBACK_ESTIMATE_RANK,
              country,
            )
          : "—";

    const revenueDisplay = formatTrackappAggregateRevenueEur(aggregateMetrics, app.id);

    return {
      downloadsDisplay,
      revenueDisplay,
      metricSource: "agrégé monde / mois",
      chartRank,
      sortRevenueUsd: aggregateMetrics.revenue > 0 ? aggregateMetrics.revenue : 0,
      sortDownloads: parseDownloadsDisplayToSortValue(
        downloadsDisplay,
        aggregateMetrics.downloads,
      ),
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

async function resolveTrackappAppDisplayMetricsCanonical(
  appId: string,
  country: CountryCode,
): Promise<TrackappAppDisplayMetrics> {
  const [app, aggregateMetrics, enrichedNationalTop] = await Promise.all([
    fetchAppDetail(appId, country),
    getIosAggregateAppMetricsCached(appId)(),
    fetchEnrichedTopFree(country, 100),
  ]);

  if (!app) return EMPTY_METRICS;

  const chartRank = chartRankForApp(app.id, app.primaryGenreId, enrichedNationalTop);
  return computeTrackappAppDisplayMetrics(
    app,
    country,
    aggregateMetrics,
    chartRank,
    TRACKAPP_DETAIL_FALLBACK_ESTIMATE_RANK,
  );
}

/** Cache cross-requêtes : recherche et fiche lisent la même résolution. */
export function getTrackappAppDisplayMetricsCached(appId: string, country: CountryCode) {
  return unstable_cache(
    () => resolveTrackappAppDisplayMetricsCanonical(appId, country),
    ["trackapp-display-metrics-canonical-v3", appId, country],
    { revalidate: 3600 },
  )();
}

export async function resolveTrackappAppDisplayMetrics(
  appId: string,
  country: CountryCode,
): Promise<TrackappAppDisplayMetrics | null> {
  const metrics = await getTrackappAppDisplayMetricsCached(appId, country);
  return metrics.metricSource === "donnée indisponible" ? null : metrics;
}

async function mapPool<T, R>(
  items: readonly T[],
  concurrency: number,
  worker: (item: T, index: number) => Promise<R>,
): Promise<R[]> {
  const results = new Array<R>(items.length);
  let next = 0;

  async function runWorker(): Promise<void> {
    for (;;) {
      const index = next;
      next += 1;
      if (index >= items.length) return;
      results[index] = await worker(items[index]!, index);
    }
  }

  const workers = Math.min(Math.max(concurrency, 1), items.length);
  await Promise.all(Array.from({ length: workers }, () => runWorker()));
  return results;
}

/** Batch recherche : cache par app + file Sensor Tower (évite 429). */
export async function resolveTrackappAppsDisplayMetricsBatch(
  appIds: readonly string[],
  country: CountryCode,
): Promise<Map<string, TrackappAppDisplayMetrics>> {
  const uniqueIds = [...new Set(appIds.filter(Boolean))];
  if (uniqueIds.length === 0) return new Map();

  const rows = await mapPool(uniqueIds, BATCH_METRICS_CONCURRENCY, async (appId) => {
    const metrics = await getTrackappAppDisplayMetricsCached(appId, country);
    return [appId, metrics] as const;
  });

  return new Map(rows);
}

export function metricsFromAppDetail(
  detail: AppDetail,
  country: CountryCode,
  aggregateMetrics: IosAggregateAppMetrics | null,
  enrichedNationalTop: EnrichedTop,
  fallbackEstimateRank: number | null = TRACKAPP_DETAIL_FALLBACK_ESTIMATE_RANK,
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

  const metricsMap = await resolveTrackappAppsDisplayMetricsBatch(
    apps.map((app) => app.id),
    country,
  );

  return apps.map((app) => ({
    ...app,
    trackappMetrics: metricsMap.get(app.id) ?? EMPTY_METRICS,
  }));
}

/** Fiche détail — aligné sur le cache canonique (même chiffres que la recherche). */
export async function metricsForApptrackerDetailPage(
  appId: string,
  country: CountryCode,
): Promise<TrackappAppDisplayMetrics> {
  return getTrackappAppDisplayMetricsCached(appId, country);
}

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
