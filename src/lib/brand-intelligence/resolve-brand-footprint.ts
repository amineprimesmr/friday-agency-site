import { unstable_cache } from "next/cache";

import { fetchAdsArchive } from "@/lib/meta-ad-library";
import {
  facebookGraphIdentifierFromUrl,
  resolveFacebookPageNode,
  type ResolvedFacebookPage,
} from "@/lib/meta-page-resolve";
import { footprintToUrlList, inferBrandFootprintWithOpenAI, type OpenAiBrandFootprint } from "@/lib/tracker-brand-footprint-openai";
import { detectProfileFromUrl, mergeSocialProfiles, type DetectedSocialProfile } from "@/lib/social-presence";
import type {
  BrandResolutionSource,
  MetaAdPageResolutionEntry,
  RejectedMetaPageCandidate,
  TrackerMetaAdLibraryContext,
} from "@/lib/tracker-meta-ad-library-context";

type CandidateSource = "app_store" | "openai_web";

type FacebookCandidate = {
  url: string;
  source: CandidateSource;
  confidence: number;
};

function uniqByUrl(candidates: FacebookCandidate[]): FacebookCandidate[] {
  const out: FacebookCandidate[] = [];
  const seen = new Set<string>();
  for (const candidate of candidates) {
    const key = candidate.url.trim().replace(/\/+$/, "").toLowerCase();
    if (!key || seen.has(key)) continue;
    seen.add(key);
    out.push({ ...candidate, url: candidate.url.trim() });
  }
  return out;
}

function manualMetaSearchUrl(keyword: string): string {
  const q = encodeURIComponent(keyword.trim().slice(0, 100) || " ");
  return `https://www.facebook.com/ads/library/?active_status=active&ad_type=all&country=ALL&q=${q}&search_type=keyword_unordered&media_type=all`;
}

const cachedInferBrandFootprint = unstable_cache(
  async (args: {
    appName: string;
    developerName: string;
    genre: string;
    descriptionSnippet: string;
  }) => inferBrandFootprintWithOpenAI(args),
  ["brand-footprint-openai-web-v1"],
  { revalidate: 60 * 60 * 24 },
);

async function probeAdsCount(pageId: string, country: string): Promise<number | undefined> {
  const result = await fetchAdsArchive({
    searchPageIds: [pageId],
    countries: [country],
    limit: 3,
  });
  if (result.metaError) return undefined;
  return result.data.length;
}

async function resolveFacebookCandidate(args: {
  accessToken: string;
  candidate: FacebookCandidate;
  country: string;
}): Promise<{ entry?: MetaAdPageResolutionEntry; rejected?: RejectedMetaPageCandidate; source?: BrandResolutionSource }> {
  const idOrSlug = facebookGraphIdentifierFromUrl(args.candidate.url);
  if (!idOrSlug) {
    return {
      rejected: {
        url: args.candidate.url,
        source: args.candidate.source,
        reason: "URL Facebook non exploitable par Graph",
      },
    };
  }

  const node: ResolvedFacebookPage | null = await resolveFacebookPageNode(args.accessToken, idOrSlug);
  if (!node) {
    return {
      rejected: {
        url: args.candidate.url,
        source: args.candidate.source,
        reason: "Page Facebook non résolue par Graph",
      },
    };
  }

  const adsProbeCount = await probeAdsCount(node.id, args.country);
  return {
    entry: {
      pageId: node.id,
      pageName: node.name,
      sourceUrl: args.candidate.url,
      source: args.candidate.source,
      confidence: args.candidate.confidence,
      adsProbeCount,
    },
    source: {
      label: node.name ? `Page Meta: ${node.name}` : `Page Meta ${node.id}`,
      url: args.candidate.url,
      source: "meta_graph",
    },
  };
}

export async function resolveBrandFootprint(args: {
  appName: string;
  developerName: string;
  genre: string;
  description: string;
  releaseNotes: string;
  socialFromStore: DetectedSocialProfile[];
  country?: string;
}): Promise<TrackerMetaAdLibraryContext> {
  const token = process.env.META_AD_LIBRARY_ACCESS_TOKEN?.trim();
  const keywordFallback = (args.developerName.trim() || args.appName.trim()).slice(0, 100);
  const country = (args.country || "FR").trim().toUpperCase() || "FR";

  let socialProfiles = args.socialFromStore;
  let openAiEnriched = false;
  let footprint: OpenAiBrandFootprint | null = null;
  const sources: BrandResolutionSource[] = args.socialFromStore.map((profile) => ({
    label: `${profile.label} détecté dans l'App Store`,
    url: profile.url,
    source: "app_store",
  }));

  if (process.env.OPENAI_API_KEY?.trim()) {
    footprint = await cachedInferBrandFootprint({
      appName: args.appName,
      developerName: args.developerName,
      genre: args.genre,
      descriptionSnippet: [args.description, args.releaseNotes].filter(Boolean).join("\n"),
    });

    if (footprint) {
      const extras = footprintToUrlList(footprint)
        .map((url) => detectProfileFromUrl(url))
        .filter((profile): profile is DetectedSocialProfile => Boolean(profile));

      if (extras.length > 0) {
        openAiEnriched = true;
        socialProfiles = mergeSocialProfiles(socialProfiles, extras);
        sources.push(
          ...footprint.sources.map((url) => ({
            label: "Source web OpenAI",
            url,
            source: "openai_web" as const,
          })),
        );
      }
    }
  }

  const candidates = uniqByUrl([
    ...args.socialFromStore
      .filter((profile) => profile.id === "facebook")
      .map((profile): FacebookCandidate => ({ url: profile.url, source: "app_store", confidence: 0.82 })),
    ...(footprint?.facebook_url
      ? [{ url: footprint.facebook_url, source: "openai_web" as const, confidence: footprint.confidence }]
      : []),
  ]);

  const entries: MetaAdPageResolutionEntry[] = [];
  const rejectedCandidates: RejectedMetaPageCandidate[] = [];
  const seenPageIds = new Set<string>();

  if (token) {
    for (const candidate of candidates) {
      const resolved = await resolveFacebookCandidate({ accessToken: token, candidate, country });
      if (resolved.rejected) rejectedCandidates.push(resolved.rejected);
      if (resolved.source) sources.push(resolved.source);
      if (resolved.entry && !seenPageIds.has(resolved.entry.pageId)) {
        seenPageIds.add(resolved.entry.pageId);
        entries.push(resolved.entry);
      }
      if (entries.length >= 10) break;
    }
  } else {
    rejectedCandidates.push(
      ...candidates.map((candidate) => ({
        url: candidate.url,
        source: candidate.source,
        reason: "META_AD_LIBRARY_ACCESS_TOKEN non configuré",
      })),
    );
  }

  const searchPageIds = entries.map((entry) => entry.pageId).filter((id) => /^\d+$/.test(id));
  const confidence =
    searchPageIds.length > 0
      ? Math.max(...entries.map((entry) => entry.confidence ?? 0.7))
      : (footprint?.confidence ?? 0);

  return {
    searchPageIds,
    keywordFallback,
    entries,
    mode: searchPageIds.length > 0 ? "page" : "unresolved",
    socialProfiles,
    openAiEnriched,
    resolutionStatus: !token ? "unconfigured" : searchPageIds.length > 0 ? "resolved" : "not_found",
    confidence,
    sources,
    rejectedCandidates,
    officialWebsite: footprint?.official_website_url ?? null,
    primaryMetaPageId: searchPageIds[0] ?? null,
    allMetaPageIds: searchPageIds,
    manualSearchUrl: manualMetaSearchUrl(keywordFallback || args.appName),
  };
}
