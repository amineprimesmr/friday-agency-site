import type { AppDetail } from "@/lib/apple-charts";
import { verifyOutboundUrl } from "@/lib/official-brand-url-verify";
import { googlePlayUrlMatchesBundle } from "@/lib/social-discovery/normalizeUrls";
import type { EvidenceKind, LinkCandidate } from "@/lib/social-discovery/types";

export async function validateGooglePlayCandidate(
  app: AppDetail,
  candidate: LinkCandidate,
): Promise<LinkCandidate | null> {
  if (!app.bundleId || !googlePlayUrlMatchesBundle(app.bundleId, candidate.url)) return null;
  const verify = await verifyOutboundUrl(candidate.url);
  if (!verify.ok) return null;
  return {
    ...candidate,
    evidence: [
      ...new Set([...candidate.evidence, "google_play_listing", "http_verified"]),
    ] as EvidenceKind[],
    note: `Google Play · package ${app.bundleId}`,
  };
}
