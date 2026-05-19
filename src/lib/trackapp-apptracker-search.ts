import { unstable_cache } from "next/cache";

import { searchApps, type CountryCode } from "@/lib/apple-charts";
import { enrichSearchResultsWithTrackappMetrics, type SearchResultWithTrackappMetrics } from "@/lib/trackapp-app-display-metrics";

export const TRACKAPP_APPTRACKER_SEARCH_EXAMPLES = [
  "TikTok",
  "Duolingo",
  "Cal AI",
  "BeReal",
  "ChatGPT",
  "Yuka",
] as const;

const cachedRawSearch = unstable_cache(
  async (q: string, country: CountryCode) => searchApps(q, country, 24),
  ["trackapp-apptracker-search-raw-v1"],
  { revalidate: 300 },
);

export async function cachedTrackappApptrackerSearch(
  q: string,
  country: CountryCode,
): Promise<SearchResultWithTrackappMetrics[]> {
  const apps = await cachedRawSearch(q, country);
  return enrichSearchResultsWithTrackappMetrics(apps, country);
}
