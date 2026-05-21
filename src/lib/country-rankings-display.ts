import type { CountryRanking } from "@/lib/apple-charts";
import { rankPresencePercent } from "@/lib/apple-charts";

export function sortCountryRankings(rankings: readonly CountryRanking[]): CountryRanking[] {
  return [...rankings].sort((a, b) => {
    if (a.rank === null && b.rank === null) return a.name.localeCompare(b.name, "fr");
    if (a.rank === null) return 1;
    if (b.rank === null) return -1;
    if (a.rank !== b.rank) return a.rank - b.rank;
    return a.name.localeCompare(b.name, "fr");
  });
}

export function countryRankTier(rank: number | null): "top" | "strong" | "mid" | "none" {
  if (rank === null) return "none";
  if (rank <= 10) return "top";
  if (rank <= 50) return "strong";
  if (rank <= 100) return "mid";
  return "none";
}

export function countryRankSummary(rankings: readonly CountryRanking[]): Readonly<{
  rankedCount: number;
  total: number;
  best: CountryRanking | null;
}> {
  const ranked = rankings.filter((r): r is CountryRanking & { rank: number } => r.rank !== null);
  const best =
    ranked.length > 0
      ? ranked.reduce((a, b) => (a.rank <= b.rank ? a : b))
      : null;
  return { rankedCount: ranked.length, total: rankings.length, best };
}

export { rankPresencePercent };
