import type { AppDetail } from "@/lib/apple-charts";

export type SocialPlatform =
  | "website"
  | "app_store"
  | "google_play"
  | "instagram"
  | "tiktok"
  | "x"
  | "youtube"
  | "facebook"
  | "linkedin"
  | "threads"
  | "meta_ads_library";

export type EvidenceKind =
  | "official_website_link"
  | "app_store_developer_website"
  | "app_store_listing"
  | "google_play_listing"
  | "openai_web_search"
  | "openai_structured_output"
  | "http_verified"
  | "meta_graph_page"
  | "manual_whitelist"
  | "bio_profile_affirmed"
  | "brand_slug_heuristic";

export type LinkValidationStatus = "validated" | "rejected" | "uncertain";

export type LinkCandidate = Readonly<{
  url: string;
  platform: SocialPlatform;
  source: string;
  evidence: EvidenceKind[];
  note?: string;
}>;

export type ValidatedLink = Readonly<{
  url: string;
  platform: SocialPlatform;
  confidence: number;
  evidence: string[];
  reason: string;
  source: "official_site" | "app_store" | "openai_web" | "meta_graph" | "manual";
}>;

export type RejectedCandidate = Readonly<{
  url: string;
  platform: SocialPlatform;
  reason: string;
}>;

export type OfficialLinksDiscoveryResult = Readonly<{
  app: string;
  appId: string;
  website: ValidatedLink | null;
  socials: Partial<Record<Exclude<SocialPlatform, "website" | "app_store" | "google_play" | "meta_ads_library">, ValidatedLink>>;
  app_store: ValidatedLink | null;
  google_play: ValidatedLink | null;
  meta_ads_library: Readonly<{
    url: string;
    page_id: string;
    confidence: number;
    evidence: string[];
  }> | null;
  not_found: string[];
  rejected_candidates: RejectedCandidate[];
  scanned_urls: string[];
  evidence_urls: string[];
  meta_page_name: string | null;
}>;

export type DiscoveryContext = Readonly<{
  app: AppDetail;
}>;
