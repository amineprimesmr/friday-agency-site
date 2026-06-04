import type { EvidenceKind } from "@/lib/social-discovery/types";

const EVIDENCE_WEIGHT: Partial<Record<EvidenceKind, number>> = {
  official_website_link: 85,
  app_store_developer_website: 45,
  app_store_listing: 40,
  google_play_listing: 40,
  meta_graph_page: 45,
  http_verified: 25,
  openai_web_search: 20,
  openai_structured_output: 55,
  manual_whitelist: 35,
  bio_profile_affirmed: 45,
  brand_slug_heuristic: 32,
};

export function scoreFromEvidence(evidence: readonly EvidenceKind[]): number {
  let score = 0;
  const seen = new Set<EvidenceKind>();
  for (const e of evidence) {
    if (seen.has(e)) continue;
    seen.add(e);
    score += EVIDENCE_WEIGHT[e] ?? 10;
  }
  return Math.min(100, score);
}

export function meetsValidationThreshold(evidence: readonly EvidenceKind[], score: number): boolean {
  if (evidence.includes("official_website_link") && evidence.includes("http_verified")) {
    return score >= 80;
  }
  if (evidence.includes("app_store_listing") && evidence.includes("http_verified")) {
    return true;
  }
  if (evidence.includes("app_store_developer_website") && evidence.includes("http_verified")) {
    return score >= 70;
  }
  if (evidence.includes("manual_whitelist") && evidence.includes("http_verified")) {
    return true;
  }
  if (evidence.includes("bio_profile_affirmed") && evidence.includes("http_verified")) {
    return score >= 70;
  }
  if (evidence.includes("openai_structured_output")) {
    return evidence.includes("openai_web_search") && score >= 75;
  }
  if (evidence.includes("brand_slug_heuristic")) {
    return score >= 32;
  }
  return evidence.length >= 2 && score >= 80;
}
