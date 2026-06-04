import {
  fetchAppDetail,
  fetchEnrichedTopFree,
  fetchGenrePeersFromItunesSearch,
  fetchIosAggregateAppMetrics,
  fetchIosAggregateAppMetricsBatch,
  genreSliceRankInTop100Free,
  normalizeTrackerCountryParam,
  overallRankInTop100Free,
  peersFromEnrichedTopFree,
  type AppDetail,
  type AppEntry,
  type CountryCode,
  type IosAggregateAppMetrics,
} from "@/lib/apple-charts";
import { sensorTowerRevenueUsdOrNull } from "@/lib/trackapp-real-metrics-only";

export type TrackerAppMarketRow = {
  id: string;
  name: string;
  artworkUrl: string;
  rank: number;
  revenueUsd: number;
  sharePct: number;
};

export type TrackerAppEmbedContext = {
  app: AppDetail;
  country: CountryCode;
  categoryPeers: AppEntry[];
  sidebarApps: AppEntry[];
  marketRows: TrackerAppMarketRow[];
  totalMarketUsd: number;
  overallRank: number | null;
  genreSliceRank: number | null;
  displayRank: number | null;
  rankHeroMode: "overall" | "genre" | "none";
  /** Métriques monde (JSON public) quand disponibles. */
  aggregateMetrics: IosAggregateAppMetrics | null;
};

export function parseEmbedCountry(raw: string | undefined): CountryCode {
  return normalizeTrackerCountryParam(raw);
}

/** Données fiche app + embeds (concurrents, marché, classements) — une seule logique. */
const ST_AGGREGATE_TIMEOUT_MS = 12_000;

export async function loadTrackerAppEmbedContext(
  appId: string,
  country: CountryCode,
  options?: Readonly<{
    skipAggregate?: boolean;
    skipMarket?: boolean;
    skipPeers?: boolean;
    /** Top 100 pour les rangs, sans liste de concurrents ni recherche iTunes peers. */
    ranksOnly?: boolean;
  }>,
): Promise<TrackerAppEmbedContext | null> {
  const skipPeers = options?.skipPeers ?? false;
  const skipMarket = options?.skipMarket ?? false;
  const ranksOnly = options?.ranksOnly ?? false;
  const needEnrichedTop = !skipPeers || ranksOnly;
  const buildPeerList = !skipPeers && !ranksOnly;

  const [app, enrichedNationalTop, aggregateMetrics] = await Promise.all([
    fetchAppDetail(appId, country),
    needEnrichedTop ? fetchEnrichedTopFree(country, 100) : Promise.resolve([] as AppEntry[]),
    options?.skipAggregate
      ? Promise.resolve(null)
      : fetchIosAggregateAppMetrics(appId, { timeoutMs: ST_AGGREGATE_TIMEOUT_MS }),
  ]);
  if (!app) return null;

  let categoryPeers: AppEntry[] = [];
  if (buildPeerList) {
    categoryPeers = peersFromEnrichedTopFree(enrichedNationalTop, app.primaryGenreId, appId, 28);
    if (categoryPeers.length < 5) {
      categoryPeers = await fetchGenrePeersFromItunesSearch(
        app.primaryGenreName,
        app.primaryGenreId,
        appId,
        country,
        28,
      );
    }
    if (categoryPeers.length === 0) {
      categoryPeers = enrichedNationalTop.filter((a) => a.id !== appId).slice(0, 28);
    }
  }

  const sidebarApps = categoryPeers.slice(0, 12);

  const overallRank = needEnrichedTop ? overallRankInTop100Free(appId, enrichedNationalTop) : null;
  const genreSliceRank = needEnrichedTop
    ? genreSliceRankInTop100Free(appId, app.primaryGenreId, enrichedNationalTop)
    : null;
  const displayRank = overallRank ?? genreSliceRank;
  const rankHeroMode: "overall" | "genre" | "none" =
    overallRank !== null ? "overall" : genreSliceRank !== null ? "genre" : "none";

  let marketRows: TrackerAppMarketRow[] = [];
  let totalMarketUsd = 0;

  if (!skipMarket && buildPeerList) {
    let mergedForMarket = [...categoryPeers];
    const rankForMarketPeer = overallRank ?? genreSliceRank;
    if (rankForMarketPeer !== null && !mergedForMarket.some((p) => p.id === appId)) {
      mergedForMarket = [
        {
          id: app.id,
          name: app.name,
          artworkUrl: app.artworkUrl,
          artistName: app.artistName,
          category: app.primaryGenreName,
          categoryId: app.primaryGenreId,
          url: app.trackViewUrl,
          releaseDate: app.releaseDate,
          rank: rankForMarketPeer,
        },
        ...mergedForMarket,
      ];
    }

    const marketPeerIds = mergedForMarket.map((p) => p.id);
    const marketAggMap = await fetchIosAggregateAppMetricsBatch(marketPeerIds, {
      timeoutMs: ST_AGGREGATE_TIMEOUT_MS,
    });

    const marketRowsRaw = mergedForMarket
      .map((peer) => {
        const revenueUsd = sensorTowerRevenueUsdOrNull(marketAggMap.get(peer.id) ?? null);
        if (revenueUsd === null) return null;
        return {
          id: peer.id,
          name: peer.name,
          artworkUrl: peer.artworkUrl,
          rank: peer.rank,
          revenueUsd,
          sharePct: 0,
        };
      })
      .filter((r): r is TrackerAppMarketRow => r != null);

    totalMarketUsd = marketRowsRaw.reduce((s, r) => s + r.revenueUsd, 0);
    marketRows = marketRowsRaw.map((r) => ({
      ...r,
      sharePct: totalMarketUsd > 0 ? (r.revenueUsd / totalMarketUsd) * 100 : 0,
    }));
  }

  return {
    app,
    country,
    categoryPeers,
    sidebarApps,
    marketRows,
    totalMarketUsd,
    overallRank,
    genreSliceRank,
    displayRank,
    rankHeroMode,
    aggregateMetrics,
  };
}
