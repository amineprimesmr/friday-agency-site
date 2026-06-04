import type { AppDetail, CountryCode } from "@/lib/apple-charts";
import { countryRankSummary, sortCountryRankings } from "@/lib/country-rankings-display";
import type { AppStoreInAppOffers } from "@/lib/apple-app-store-in-app-offers";
import { buildOfficialBrandPresenceContext } from "@/lib/official-brand-presence";
import { metricsFromEmbedContext } from "@/lib/trackapp-app-display-metrics";
import {
  fetchCountryRankingsEnrichedCached,
  loadAppStoreInAppOffersForPage,
  loadTrackerAppWorkspaceContextCached,
} from "@/lib/tracker-server-cache";

export type AppLabContext = Readonly<{
  app: AppDetail;
  country: CountryCode;
  metrics: Readonly<{
    downloads: string;
    revenue: string;
    source: string;
    globalRating: number;
    globalRatingCount: number;
    overallRank: number | null;
    genreRank: number | null;
  }>;
  inAppOffers: AppStoreInAppOffers;
  countryRankings: Readonly<{
    rankedCount: number;
    bestCountries: readonly Readonly<{ name: string; flag: string; rank: number }>[];
    topMarkets: readonly string[];
  }>;
  officialPresence: Readonly<{
    website: string | null;
    socials: readonly string[];
    metaAds: string | null;
  }>;
  genrePeers: readonly string[];
  descriptionExcerpt: string;
  releaseNotesExcerpt: string;
}>;

function excerpt(text: string | undefined, max = 1200): string {
  if (!text?.trim()) return "";
  const t = text.trim();
  return t.length <= max ? t : `${t.slice(0, max)}…`;
}

export async function buildAppLabContext(appId: string, country: CountryCode): Promise<AppLabContext | null> {
  const [workspace, inAppOffers, countryRankings] = await Promise.all([
    loadTrackerAppWorkspaceContextCached(appId, country),
    loadAppStoreInAppOffersForPage(appId, country),
    fetchCountryRankingsEnrichedCached(appId),
  ]);

  if (!workspace) return null;

  const { app, aggregateMetrics, overallRank, genreSliceRank, categoryPeers } = workspace;
  const listMetrics = metricsFromEmbedContext(
    app,
    country,
    aggregateMetrics,
    overallRank,
    genreSliceRank,
  );

  const presence = await buildOfficialBrandPresenceContext(app);
  const socials: string[] = [];
  for (const key of ["instagram", "tiktok", "x", "youtube", "facebook", "linkedin", "threads"] as const) {
    const link = presence.officialLinks[key];
    if (link.validated && link.url) socials.push(`${key}: ${link.url}`);
  }

  const sorted = sortCountryRankings(countryRankings);
  const summary = countryRankSummary(countryRankings);
  const bestCountries = sorted
    .filter((r): r is typeof r & { rank: number } => r.rank !== null)
    .slice(0, 8)
    .map((r) => ({ name: r.name, flag: r.flag, rank: r.rank }));

  const globalRating =
    aggregateMetrics?.rating && aggregateMetrics.rating > 0
      ? aggregateMetrics.rating
      : app.averageUserRating;
  const globalRatingCount =
    aggregateMetrics?.globalRatingCount && aggregateMetrics.globalRatingCount > 0
      ? aggregateMetrics.globalRatingCount
      : app.userRatingCount;

  return {
    app,
    country,
    metrics: {
      downloads: listMetrics.downloadsDisplay,
      revenue: listMetrics.revenueDisplay,
      source: listMetrics.metricSource,
      globalRating,
      globalRatingCount,
      overallRank: overallRank ?? null,
      genreRank: genreSliceRank ?? null,
    },
    inAppOffers,
    countryRankings: {
      rankedCount: summary.rankedCount,
      bestCountries,
      topMarkets: bestCountries.slice(0, 5).map((c) => `${c.name} #${c.rank}`),
    },
    officialPresence: {
      website: presence.officialWebsite,
      socials,
      metaAds: presence.metaPageId ? `Page Meta ${presence.metaPageName ?? presence.metaPageId}` : null,
    },
    genrePeers: categoryPeers
      .map((p) => p.name)
      .filter((n) => n !== app.name)
      .slice(0, 8),
    descriptionExcerpt: excerpt(app.description, 1200),
    releaseNotesExcerpt: excerpt(app.releaseNotes, 800),
  };
}

export function appLabContextToPromptJson(ctx: AppLabContext): string {
  const { app, metrics, inAppOffers, countryRankings, officialPresence, genrePeers } = ctx;
  const offers =
    inAppOffers.source === "app-store-web"
      ? inAppOffers.offers.map((o) => `${o.name} — ${o.priceLabel} (${o.kind})`)
      : [];

  return JSON.stringify(
    {
      app: {
        id: app.id,
        name: app.name,
        artist: app.artistName,
        category: app.primaryGenreName || app.category,
        price: app.formattedPrice,
        bundle_id: app.bundleId,
        content_rating: app.trackContentRating,
        min_ios: app.minimumOsVersion,
        file_size: app.fileSizeBytes,
        release_date: app.releaseDate,
        last_update: app.currentVersionReleaseDate,
        version: app.version,
        app_store_url: app.trackViewUrl || app.url,
      },
      description: ctx.descriptionExcerpt,
      release_notes: ctx.releaseNotesExcerpt,
      trackapp_metrics: metrics,
      in_app_offers: offers,
      country_rankings: countryRankings,
      official_presence: officialPresence,
      genre_chart_peers_not_semantic_competitors: genrePeers,
    },
    null,
    2,
  );
}
