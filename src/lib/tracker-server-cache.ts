import { cache } from "react";
import { unstable_cache } from "next/cache";

import {
  applyStoreRatingsToCountryRankings,
  fetchAppDetail,
  fetchCountryRankings,
  fetchIosAggregateAppMetrics,
  fetchStoreRatingsByCountry,
  mergeCountryRankingsWithIosMeta,
  fetchTopCharts,
  COUNTRY_MAP,
  COUNTRIES,
  TRACKER_DEFAULT_COUNTRY,
  type CountryCode,
  type CountryRanking,
  type MultiCountryApp,
} from "@/lib/apple-charts";
import { fetchAppStoreInAppOffers } from "@/lib/apple-app-store-in-app-offers";
import { fetchAppStoreWebScreenshots } from "@/lib/apple-app-store-web-screenshots";
import { loadTrackerAppEmbedContext } from "@/lib/tracker-app-embed-data";
const REVALIDATE_TRACKER = 900;

/** Déduplique lookup iTunes dans la même requête (metadata + page). */
export const fetchAppDetailCached = cache((id: string, country: CountryCode = TRACKER_DEFAULT_COUNTRY) =>
  fetchAppDetail(id, country),
);

/** Cache cross-requêtes pour API routes et sidebar. */
export function fetchAppDetailCrossRequestCached(
  id: string,
  country: CountryCode = TRACKER_DEFAULT_COUNTRY,
) {
  return unstable_cache(
    () => fetchAppDetail(id, country),
    ["app-detail-cross-v1", id, country],
    { revalidate: REVALIDATE_TRACKER },
  )();
}

const workspaceAggregateCached = (appId: string) =>
  unstable_cache(
    async () => fetchIosAggregateAppMetrics(appId, { timeoutMs: 8_000 }),
    ["tracker-workspace-st-aggregate-v1", appId],
    { revalidate: 3600 },
  );

export async function getTrackerHeroApps(): Promise<MultiCountryApp[]> {
  return unstable_cache(
    async () => {
      const apps = await fetchTopCharts(TRACKER_DEFAULT_COUNTRY, "top-free", 3);
      return apps.map(
        (app): MultiCountryApp => ({
          ...app,
          country: TRACKER_DEFAULT_COUNTRY,
          flag: COUNTRY_MAP[TRACKER_DEFAULT_COUNTRY]?.flag ?? "🇫🇷",
        }),
      );
    },
    ["tracker-hero-apps-v1"],
    { revalidate: REVALIDATE_TRACKER },
  )();
}

/** Contexte fiche app : iTunes + peers en cache ; Sensor Tower **jamais** mis en cache (évite « Indisponible » figé). */
export async function loadTrackerAppEmbedContextCached(appId: string, country: CountryCode) {
  const base = await unstable_cache(
    () => loadTrackerAppEmbedContext(appId, country, { skipAggregate: true }),
    ["tracker-app-embed-base-v4", appId, country],
    { revalidate: REVALIDATE_TRACKER },
  )();
  if (!base) return null;
  const aggregateMetrics = await fetchIosAggregateAppMetrics(appId, { timeoutMs: 12_000 });
  return { ...base, aggregateMetrics };
}

/** Fiche workspace Accueil : rangs sans peers ni batch marché ST. */
export async function loadTrackerAppWorkspaceContextCached(appId: string, country: CountryCode) {
  const base = await unstable_cache(
    () =>
      loadTrackerAppEmbedContext(appId, country, {
        skipAggregate: true,
        skipMarket: true,
        ranksOnly: true,
      }),
    ["tracker-app-workspace-v2", appId, country],
    { revalidate: REVALIDATE_TRACKER },
  )();
  if (!base) return null;
  const aggregateMetrics = await workspaceAggregateCached(appId)();
  return { ...base, aggregateMetrics };
}

/** Screenshots fiche apps.apple.com (souvent plus récents que l’API iTunes). */
export function loadAppStoreWebScreenshotsCached(appId: string, country: CountryCode) {
  return unstable_cache(
    () => fetchAppStoreWebScreenshots(appId, country),
    ["app-store-web-screenshots-v2", appId, country],
    { revalidate: REVALIDATE_TRACKER },
  )();
}

/** Cache IAP — uniquement les fiches avec offres (évite de figer « vide » après timeout Vercel). */
export function loadAppStoreInAppOffersCached(appId: string, country: CountryCode) {
  return unstable_cache(
    async () => {
      const data = await fetchAppStoreInAppOffers(appId, country);
      if (data.source !== "app-store-web" || data.offers.length === 0) return null;
      return data;
    },
    ["app-store-in-app-offers-v5", appId, country],
    { revalidate: REVALIDATE_TRACKER },
  )();
}

/** Fiche app : cache si succès, sinon fetch direct (ne sert jamais un « vide » mis en cache). */
export async function loadAppStoreInAppOffersForPage(appId: string, country: CountryCode) {
  const cached = await loadAppStoreInAppOffersCached(appId, country);
  if (cached) return cached;
  return fetchAppStoreInAppOffers(appId, country);
}

/** 13 flux RSS en parallèle — coûteux sans cache cross-requête. */
export const fetchCountryRankingsCached = cache((appId: string) =>
  unstable_cache(
    () => fetchCountryRankings(appId),
    ["tracker-country-rankings-v2", appId],
    { revalidate: REVALIDATE_TRACKER },
  )(),
);

/** Classements + dispo ST + notes iTunes par pays (marchés suivis). */
export const fetchCountryRankingsEnrichedCached = cache((appId: string): Promise<CountryRanking[]> =>
  unstable_cache(
    async () => {
      const [rankings, agg, ratings] = await Promise.all([
        fetchCountryRankings(appId),
        fetchIosAggregateAppMetrics(appId, { timeoutMs: 4000 }),
        fetchStoreRatingsByCountry(appId, COUNTRIES.map((c) => c.code)),
      ]);
      let merged = mergeCountryRankingsWithIosMeta(rankings, agg);
      merged = applyStoreRatingsToCountryRankings(merged, ratings);
      return merged;
    },
    ["tracker-country-rankings-enriched-v2", appId],
    { revalidate: REVALIDATE_TRACKER },
  )(),
);
