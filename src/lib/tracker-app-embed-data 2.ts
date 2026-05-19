import {
  estimateMonthlyRevenueUsd,
  fetchAppDetail,
  fetchEnrichedTopFree,
  fetchGenrePeersFromItunesSearch,
  fetchIosAggregateAppMetrics,
  genreSliceRankInTop100Free,
  normalizeTrackerCountryParam,
  overallRankInTop100Free,
  peersFromEnrichedTopFree,
  type AppDetail,
  type AppEntry,
  type CountryCode,
  type IosAggregateAppMetrics,
} from "@/lib/apple-charts";

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
export async function loadTrackerAppEmbedContext(
  appId: string,
  country: CountryCode,
): Promise<TrackerAppEmbedContext | null> {
  const [app, enrichedNationalTop, aggregateMetrics] = await Promise.all([
    fetchAppDetail(appId, country),
    fetchEnrichedTopFree(country, 100),
    fetchIosAggregateAppMetrics(appId),
  ]);
  if (!app) return null;

  let categoryPeers = peersFromEnrichedTopFree(
    enrichedNationalTop,
    app.primaryGenreId,
    appId,
    28,
  );
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

  const sidebarApps = categoryPeers.slice(0, 12);

  const overallRank = overallRankInTop100Free(appId, enrichedNationalTop);
  const genreSliceRank = genreSliceRankInTop100Free(appId, app.primaryGenreId, enrichedNationalTop);
  const displayRank = overallRank ?? genreSliceRank;
  const rankHeroMode: "overall" | "genre" | "none" =
    overallRank !== null ? "overall" : genreSliceRank !== null ? "genre" : "none";

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

  const marketRowsRaw = mergedForMarket.map((peer) => {
    const gid = peer.categoryId || app.primaryGenreId;
    const price = peer.id === app.id ? app.price : 0;
    const revenueUsd = estimateMonthlyRevenueUsd(peer.rank, price, gid, country);
    return {
      id: peer.id,
      name: peer.name,
      artworkUrl: peer.artworkUrl,
      rank: peer.rank,
      revenueUsd,
      sharePct: 0,
    };
  });
  const totalMarketUsd = marketRowsRaw.reduce((s, r) => s + r.revenueUsd, 0);
  const marketRows = marketRowsRaw.map((r) => ({
    ...r,
    sharePct: totalMarketUsd > 0 ? (r.revenueUsd / totalMarketUsd) * 100 : 0,
  }));

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
