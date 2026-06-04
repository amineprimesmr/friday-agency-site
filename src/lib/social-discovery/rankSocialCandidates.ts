import type { EvidenceKind, LinkCandidate, ValidatedLink } from "@/lib/social-discovery/types";

/** Plus le score est bas, plus la source est fiable (site officiel en tête). */
export function candidateSourcePriority(evidence: readonly EvidenceKind[]): number {
  if (evidence.includes("official_website_link")) return 1;
  if (evidence.includes("openai_structured_output")) return 3;
  if (evidence.includes("openai_web_search")) return 4;
  if (evidence.includes("manual_whitelist")) return 5;
  if (evidence.includes("brand_slug_heuristic")) return 6;
  if (evidence.includes("app_store_listing")) return 6;
  if (evidence.includes("app_store_developer_website")) return 7;
  return 9;
}

export function sortCandidatesBySourcePriority(candidates: readonly LinkCandidate[]): LinkCandidate[] {
  return [...candidates].sort(
    (a, b) => candidateSourcePriority(a.evidence) - candidateSourcePriority(b.evidence),
  );
}

export type RankedSocialOutcome = Readonly<{
  candidate: LinkCandidate;
  validated: ValidatedLink;
  rankScore: number;
  bioAffirmed: boolean;
  followers: number | null;
  verified: boolean | null;
}>;

export function computeFinalRankScore(
  validated: ValidatedLink,
  candidate: LinkCandidate,
  opts: Readonly<{
    bioAffirmed?: boolean;
    followers?: number | null;
    verified?: boolean | null;
    handleStrictMatch?: boolean;
    crossNetworkMatch?: boolean;
  }>,
): number {
  let score = validated.confidence;
  score += (10 - candidateSourcePriority(candidate.evidence)) * 6;
  if (opts.bioAffirmed) score += 28;
  if (opts.handleStrictMatch) score += 18;
  if (opts.crossNetworkMatch) score += 12;
  if (opts.verified) score += 22;
  const followers = opts.followers;
  if (followers != null) {
    if (followers >= 10_000) score += 18;
    else if (followers >= 1_000) score += 12;
    else if (followers >= 100) score += 6;
    else if (followers < 25) score -= 35;
    else if (followers < 100) score -= 12;
  }
  return score;
}

export function pickBestRankedOutcome(outcomes: readonly RankedSocialOutcome[]): RankedSocialOutcome | null {
  if (outcomes.length === 0) return null;
  return [...outcomes].sort((a, b) => b.rankScore - a.rankScore)[0] ?? null;
}
