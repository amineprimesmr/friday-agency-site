import type { DetectedSocialProfile } from "@/lib/social-presence";

export type MetaAdPageResolutionEntry = {
  pageId: string;
  pageName?: string;
  sourceUrl: string;
  source: "app_store" | "official_site" | "openai" | "openai_web" | "instagram_slug_infer" | "manual_local";
  confidence?: number;
  adsProbeCount?: number;
};

export type BrandResolutionStatus = "resolved" | "unconfigured" | "not_found" | "error";

export type BrandResolutionSource = {
  label: string;
  url?: string;
  source: "app_store" | "official_site" | "openai_web" | "meta_graph" | "meta_ads";
};

export type RejectedMetaPageCandidate = {
  url: string;
  reason: string;
  source: "app_store" | "official_site" | "openai_web" | "instagram_slug_infer";
};

/** Contexte sérialisable (Server → Client) pour Ad Library Meta. */
export type TrackerMetaAdLibraryContext = {
  searchPageIds: string[];
  keywordFallback: string;
  entries: MetaAdPageResolutionEntry[];
  mode: "page" | "unresolved";
  socialProfiles: DetectedSocialProfile[];
  openAiEnriched: boolean;
  resolutionStatus: BrandResolutionStatus;
  confidence: number;
  sources: BrandResolutionSource[];
  rejectedCandidates: RejectedMetaPageCandidate[];
  officialWebsite: string | null;
  officialLinks?: import("@/lib/official-brand-links").OfficialBrandLinksReport;
  primaryMetaPageId: string | null;
  allMetaPageIds: string[];
  manualSearchUrl: string;
};
