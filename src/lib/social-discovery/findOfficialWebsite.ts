import {
  isLegalOrPolicySitePath,
  resolveOfficialSiteHomeUrl,
  scoreOfficialSiteCandidate,
} from "@/lib/official-brand-site-home";
import { verifyOutboundUrl } from "@/lib/official-brand-url-verify";
import {
  cleanUrl,
  hostWithoutWww,
  isHttpUrl,
  isLikelyMarketingSiteHost,
  parseUrl,
  urlsFromText,
} from "@/lib/social-discovery/normalizeUrls";
import type { AppDetail } from "@/lib/apple-charts";
import type { EvidenceKind, LinkCandidate } from "@/lib/social-discovery/types";

function isLikelyOfficialSiteCandidate(raw: string | undefined | null): URL | null {
  const url = raw ? parseUrl(raw) : null;
  if (!url || !isHttpUrl(url)) return null;
  if (!isLikelyMarketingSiteHost(hostWithoutWww(url))) return null;
  return url;
}

export function pickOfficialWebsiteFromAppStore(app: AppDetail): LinkCandidate | null {
  const candidates: URL[] = [];
  const seen = new Set<string>();

  const add = (raw: string | undefined | null) => {
    const candidate = isLikelyOfficialSiteCandidate(raw);
    if (!candidate) return;
    const key = `${hostWithoutWww(candidate)}${candidate.pathname}`;
    if (seen.has(key)) return;
    seen.add(key);
    candidates.push(candidate);
  };

  add(app.sellerUrl);
  add(app.supportUrl);
  for (const raw of urlsFromText(app.description ?? "")) add(raw);

  if (candidates.length === 0) return null;

  let best = candidates[0]!;
  let bestScore = scoreOfficialSiteCandidate(best);
  for (let i = 1; i < candidates.length; i += 1) {
    const c = candidates[i]!;
    const s = scoreOfficialSiteCandidate(c);
    if (s > bestScore) {
      best = c;
      bestScore = s;
    }
  }

  const home = resolveOfficialSiteHomeUrl(best);
  if (!home) return null;

  const legalNote = isLegalOrPolicySitePath(best.pathname)
    ? " (redirection depuis page légale App Store)"
    : "";

  return {
    url: cleanUrl(parseUrl(home)!),
    platform: "website",
    source: "app_store_metadata",
    evidence: ["app_store_developer_website"],
    note: `Site issu de la fiche App Store${legalNote}`,
  };
}

export type OpenAiWebDiscovery = Readonly<{
  site_url: string | null;
  instagram_url: string | null;
  tiktok_url: string | null;
  x_url: string | null;
  youtube_url: string | null;
  facebook_url: string | null;
  linkedin_url: string | null;
  threads_url: string | null;
  app_store_url: string | null;
  google_play_url: string | null;
  meta_page_id: string | null;
  sources: string[];
}>;

export function openAiCandidates(ai: OpenAiWebDiscovery | null): LinkCandidate[] {
  if (!ai) return [];
  const rows: Array<{ platform: LinkCandidate["platform"]; url: string | null }> = [
    { platform: "website", url: ai.site_url },
    { platform: "instagram", url: ai.instagram_url },
    { platform: "tiktok", url: ai.tiktok_url },
    { platform: "x", url: ai.x_url },
    { platform: "youtube", url: ai.youtube_url },
    { platform: "facebook", url: ai.facebook_url },
    { platform: "linkedin", url: ai.linkedin_url },
    { platform: "threads", url: ai.threads_url },
    { platform: "app_store", url: ai.app_store_url },
    { platform: "google_play", url: ai.google_play_url },
  ];

  return rows
    .filter((r): r is { platform: LinkCandidate["platform"]; url: string } => Boolean(r.url))
    .map((r) => ({
      url: r.url,
      platform: r.platform,
      source: "openai_web_search",
      evidence: ["openai_web_search", "openai_structured_output"],
      note: "URL structurée OpenAI (web_search + JSON)",
    }));
}

export async function validateWebsiteCandidate(
  app: AppDetail,
  candidate: LinkCandidate,
): Promise<LinkCandidate | null> {
  const home = resolveOfficialSiteHomeUrl(candidate.url);
  if (!home) return null;
  const verify = await verifyOutboundUrl(home, "site");
  const homeUrl = parseUrl(home);
  const sellerUrl = parseUrl(app.sellerUrl);
  const sellerHostMatch =
    Boolean(homeUrl && sellerUrl && hostWithoutWww(homeUrl) === hostWithoutWww(sellerUrl));

  if (!verify.ok && !sellerHostMatch) return null;

  const evidence = [...new Set([...candidate.evidence, "http_verified"])] as EvidenceKind[];
  return {
    ...candidate,
    url: cleanUrl(homeUrl!),
    evidence,
    note:
      candidate.note ??
      (verify.ok
        ? undefined
        : "Domaine concordant avec la fiche App Store (vérification HTTP bloquée)"),
  };
}
