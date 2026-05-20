import {
  estimateMonthlyDownloads,
  estimateMonthlyRevenueUsd,
  type CountryCode,
  type SearchResult,
} from "@/lib/apple-charts";
import type { SearchResultWithTrackappMetrics } from "@/lib/trackapp-app-display-metrics";

export type TrackappSearchSort = "relevance" | "revenue" | "downloads" | "rating";

function revenueUsdForSort(app: SearchResult, country: CountryCode): number {
  const rank = Math.max(1, Math.min(app.rank || 50, 100));
  return estimateMonthlyRevenueUsd(
    rank,
    app.price,
    app.categoryId,
    country,
  );
}

function parseDownloadsForSort(app: SearchResult, country: CountryCode): number {
  const rank = Math.max(1, Math.min(app.rank || 50, 100));
  const s = estimateMonthlyDownloads(rank, country).toUpperCase();
  const m = s.match(/([\d.]+)\s*(K|M)?/);
  if (!m) return 0;
  let n = Number(m[1]);
  if (!Number.isFinite(n)) return 0;
  const unit = m[2];
  if (unit === "K") n *= 1000;
  if (unit === "M") n *= 1_000_000;
  return n;
}

function relevanceScore(query: string, app: SearchResult): number {
  const q = query.trim().toLowerCase();
  if (!q) return 0;
  const name = app.name.toLowerCase();
  const desc = (app.description ?? "").toLowerCase();
  const cat = (app.category ?? "").toLowerCase();
  let score = 0;
  if (name === q) score += 120;
  if (name.startsWith(q)) score += 80;
  if (name.includes(q)) score += 50;
  if (desc.includes(q)) score += 25;
  if (cat.includes(q)) score += 15;
  const words = q.split(/\s+/).filter((w) => w.length >= 3);
  for (const w of words) {
    if (name.includes(w)) score += 20;
    if (desc.includes(w)) score += 8;
  }
  score += Math.min(app.averageUserRating * 4, 20);
  score += Math.min(Math.log10(Math.max(app.userRatingCount, 1)) * 3, 15);
  return score;
}

export function sortSearchResults(
  apps: readonly SearchResultWithTrackappMetrics[],
  sort: TrackappSearchSort,
  query: string,
  country: CountryCode,
): SearchResultWithTrackappMetrics[] {
  const list = [...apps];
  switch (sort) {
    case "revenue":
      list.sort((a, b) => revenueUsdForSort(b, country) - revenueUsdForSort(a, country));
      break;
    case "downloads":
      list.sort(
        (a, b) => parseDownloadsForSort(b, country) - parseDownloadsForSort(a, country),
      );
      break;
    case "rating":
      list.sort((a, b) => {
        const dr = b.averageUserRating - a.averageUserRating;
        if (dr !== 0) return dr;
        return b.userRatingCount - a.userRatingCount;
      });
      break;
    default:
      list.sort((a, b) => relevanceScore(query, b) - relevanceScore(query, a));
  }
  return list;
}
