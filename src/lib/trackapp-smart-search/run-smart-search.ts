import { unstable_cache } from "next/cache";

import { normalizeTrackerCountryParam, searchApps, type CountryCode, type SearchResult } from "@/lib/apple-charts";
import {
  enrichSearchResultsWithTrackappMetrics,
  type SearchResultWithTrackappMetrics,
} from "@/lib/trackapp-app-display-metrics";
import { expandSearchQueries, isGenericDiscoveryQuery } from "@/lib/trackapp-smart-search/keyword-expansion";
import { sortSearchResults, type TrackappSearchSort } from "@/lib/trackapp-smart-search/rank-results";

export type SmartSearchResult = Readonly<{
  apps: SearchResultWithTrackappMetrics[];
  queriesUsed: string[];
  sort: TrackappSearchSort;
  expanded: boolean;
}>;

async function runSmartSearchUncached(
  q: string,
  country: CountryCode,
  limit: number,
  sort: TrackappSearchSort,
): Promise<SmartSearchResult> {
  const trimmed = q.trim();
  if (!trimmed) {
    return { apps: [], queriesUsed: [], sort, expanded: false };
  }

  const expanded = isGenericDiscoveryQuery(trimmed);
  const queries = expanded ? expandSearchQueries(trimmed) : [trimmed];
  const perQueryLimit = Math.min(Math.max(Math.ceil(limit / queries.length) + 4, 8), 25);

  const buckets = await Promise.all(
    queries.map((term) => searchApps(term, country, perQueryLimit).catch(() => [] as SearchResult[])),
  );

  const byId = new Map<string, SearchResult>();
  for (const bucket of buckets) {
    for (const app of bucket) {
      if (!byId.has(app.id)) byId.set(app.id, app);
    }
  }

  const merged = [...byId.values()].slice(0, limit * 2);
  const enriched = await enrichSearchResultsWithTrackappMetrics(merged, country);
  const sorted = sortSearchResults(enriched, sort, trimmed, country);

  return {
    apps: sorted.slice(0, limit),
    queriesUsed: queries,
    sort,
    expanded,
  };
}

const cachedSmartSearch = unstable_cache(
  async (q: string, country: CountryCode, limit: number, sort: TrackappSearchSort) =>
    runSmartSearchUncached(q, country, limit, sort),
  ["trackapp-smart-search-v3-canonical-metrics"],
  { revalidate: 300 },
);

export async function runTrackappSmartSearch(
  q: string,
  options?: { country?: string; limit?: number; sort?: TrackappSearchSort },
): Promise<SmartSearchResult> {
  const country = normalizeTrackerCountryParam(options?.country) as CountryCode;
  const limit = Math.min(Math.max(options?.limit ?? 24, 1), 40);
  const sort = options?.sort ?? (isGenericDiscoveryQuery(q) ? "revenue" : "relevance");
  return cachedSmartSearch(q.trim(), country, limit, sort);
}
