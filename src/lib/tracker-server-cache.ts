import { cache } from "react";
import { unstable_cache } from "next/cache";

import {
  fetchAppDetail,
  fetchCountryRankings,
  fetchTopCharts,
  COUNTRY_MAP,
  TRACKER_DEFAULT_COUNTRY,
  type CountryCode,
  type MultiCountryApp,
} from "@/lib/apple-charts";
import { fetchAppStoreInAppOffers } from "@/lib/apple-app-store-in-app-offers";
import { fetchAppStoreWebScreenshots } from "@/lib/apple-app-store-web-screenshots";
import { loadTrackerAppEmbedContext } from "@/lib/tracker-app-embed-data";
import { getTrackerCuratedPotentialApps } from "@/lib/tracker-curated-potential-apps";

const REVALIDATE_TRACKER = 900;

/** Déduplique lookup iTunes dans la même requête (metadata + page). */
export const fetchAppDetailCached = cache((id: string, country: CountryCode = TRACKER_DEFAULT_COUNTRY) =>
  fetchAppDetail(id, country),
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

export async function getTrackerCuratedPotentialAppsCached() {
  return unstable_cache(getTrackerCuratedPotentialApps, ["tracker-curated-potential-v3"], {
    revalidate: REVALIDATE_TRACKER,
  })();
}

export function loadTrackerAppEmbedContextCached(appId: string, country: CountryCode) {
  return unstable_cache(
    () => loadTrackerAppEmbedContext(appId, country),
    ["tracker-app-embed-v3", appId, country],
    { revalidate: REVALIDATE_TRACKER },
  )();
}

/** Screenshots fiche apps.apple.com (souvent plus récents que l’API iTunes). */
export function loadAppStoreWebScreenshotsCached(appId: string, country: CountryCode) {
  return unstable_cache(
    () => fetchAppStoreWebScreenshots(appId, country),
    ["app-store-web-screenshots-v2", appId, country],
    { revalidate: REVALIDATE_TRACKER },
  )();
}

/** Abonnements & achats intégrés listés sur apps.apple.com (section « Achats intégrés »). */
export function loadAppStoreInAppOffersCached(appId: string, country: CountryCode) {
  return unstable_cache(
    () => fetchAppStoreInAppOffers(appId, country),
    ["app-store-in-app-offers-v2", appId, country],
    { revalidate: REVALIDATE_TRACKER },
  )();
}

/** 13 flux RSS en parallèle — coûteux sans cache cross-requête. */
export function fetchCountryRankingsCached(appId: string) {
  return unstable_cache(
    () => fetchCountryRankings(appId),
    ["tracker-country-rankings-v1", appId],
    { revalidate: REVALIDATE_TRACKER },
  )();
}
