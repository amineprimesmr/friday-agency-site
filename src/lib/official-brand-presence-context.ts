import type { OfficialBrandLinksReport } from "@/lib/official-brand-links";
import type { DetectedSocialProfile } from "@/lib/social-presence";

export type BrandResolutionSource = {
  label: string;
  url?: string;
  source: "app_store" | "official_site" | "openai_web" | "meta_graph";
};

/** Contexte sérialisable (Server → Client) pour la présence officielle d'une app. */
export type OfficialBrandPresenceContext = {
  socialProfiles: DetectedSocialProfile[];
  openAiEnriched: boolean;
  confidence: number;
  sources: BrandResolutionSource[];
  officialWebsite: string | null;
  officialLinks: OfficialBrandLinksReport;
  metaPageId: string | null;
  metaPageName: string | null;
};
