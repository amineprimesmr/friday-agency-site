import type {
  OfficialBrandLinksReport,
  OfficialLinkKey,
  OfficialLinkValidation,
} from "@/lib/official-brand-links";
import { detectProfileFromUrl } from "@/lib/social-presence";
import type { OfficialLinksDiscoveryResult } from "@/lib/social-discovery/types";

function emptyLink(label: string, reason = "pas de lien officiel validé"): OfficialLinkValidation {
  return { label, url: null, validated: false, reason, source: "not_found" };
}

function mapValidatedSource(
  source: "official_site" | "app_store" | "openai_web" | "meta_graph" | "manual",
): OfficialLinkValidation["source"] {
  if (source === "manual") return "profile_verify";
  return source;
}

function toValidation(
  label: string,
  link: {
    url: string;
    reason: string;
    source: "official_site" | "app_store" | "openai_web" | "meta_graph" | "manual";
    confidence: number;
    evidence: string[];
  } | null,
): OfficialLinkValidation {
  if (!link) return emptyLink(label);
  return {
    label,
    url: link.url,
    validated: true,
    reason: `${link.reason} (${link.confidence}% — ${link.evidence.join(", ")})`,
    source: mapValidatedSource(link.source),
  };
}

export function discoveryResultToOfficialBrandReport(
  discovery: OfficialLinksDiscoveryResult,
): OfficialBrandLinksReport {
  const report: OfficialBrandLinksReport = {
    site: toValidation("Site", discovery.website ? { ...discovery.website, source: discovery.website.source === "app_store" ? "app_store" : discovery.website.source === "openai_web" ? "openai_web" : "official_site" } : null),
    instagram: toValidation("Instagram", discovery.socials.instagram ?? null),
    tiktok: toValidation("TikTok", discovery.socials.tiktok ?? null),
    x: toValidation("X / Twitter", discovery.socials.x ?? null),
    youtube: toValidation("YouTube", discovery.socials.youtube ?? null),
    facebook: toValidation("Facebook", discovery.socials.facebook ?? null),
    linkedin: toValidation("LinkedIn", discovery.socials.linkedin ?? null),
    threads: toValidation("Threads", discovery.socials.threads ?? null),
    appStore: toValidation("App Store", discovery.app_store ?? null),
    googlePlay: toValidation("Google Play", discovery.google_play ?? null),
    metaAdsLibrary: discovery.meta_ads_library
      ? {
          label: "Meta Ads Library",
          url: discovery.meta_ads_library.url,
          validated: true,
          reason: `Page ID ${discovery.meta_ads_library.page_id} — ${discovery.meta_ads_library.evidence.join(", ")}`,
          source: "meta_graph",
        }
      : emptyLink("Meta Ads Library"),
    officialSiteOrigin: discovery.website?.url ? new URL(discovery.website.url).origin : null,
    scannedUrls: discovery.scanned_urls,
    evidenceUrls: discovery.evidence_urls,
    socialProfiles: [],
    metaPageId: discovery.meta_ads_library?.page_id ?? null,
    metaPageName: discovery.meta_page_name,
    confidence: 0,
  };

  if (report.site.validated && report.site.source === "app_store") {
    report.site = { ...report.site, source: "official_site" };
  }

  const profiles = [];
  const keys: OfficialLinkKey[] = ["instagram", "tiktok", "x", "youtube", "facebook", "linkedin", "threads"];
  for (const key of keys) {
    const link = report[key];
    if (!link.validated || !link.url) continue;
    const profile = detectProfileFromUrl(link.url);
    if (profile) profiles.push(profile);
  }
  report.socialProfiles = profiles;

  const validatedCount = keys.filter((k) => report[k].validated).length + (report.site.validated ? 1 : 0);
  report.confidence = Math.min(1, validatedCount / 7);

  return report;
}
