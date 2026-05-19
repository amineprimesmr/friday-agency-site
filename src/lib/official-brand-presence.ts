import type { AppDetail } from "@/lib/apple-charts";
import { resolveOfficialBrandLinksCached } from "@/lib/official-brand-links";
import type { OfficialBrandPresenceContext } from "@/lib/official-brand-presence-context";

/**
 * Résolution stricte site-first (méthode Yuka) :
 * - site officiel issu de la fiche App Store d'abord
 * - réseaux uniquement s'ils sortent du site officiel ou validation OpenAI
 * - Meta Ads Library uniquement via view_all_page_id (page Facebook officielle), jamais keyword search
 */
export async function buildOfficialBrandPresenceContext(app: AppDetail): Promise<OfficialBrandPresenceContext> {
  const report = await resolveOfficialBrandLinksCached(app);
  const evidenceUrls = Array.isArray(report.evidenceUrls) ? report.evidenceUrls : [];
  const openAiEnriched = [
    report.site,
    report.instagram,
    report.tiktok,
    report.x,
    report.youtube,
    report.facebook,
    report.linkedin,
    report.appStore,
    report.googlePlay,
    report.metaAdsLibrary,
  ].some((link) => link.source === "openai_web");

  const sources: OfficialBrandPresenceContext["sources"] = [
    ...(report.site.url
      ? [{ label: "Site officiel", url: report.site.url, source: "app_store" as const }]
      : []),
    ...report.socialProfiles.map((profile) => ({
      label: `${profile.label} validé officiellement`,
      url: profile.url,
      source: "official_site" as const,
    })),
    ...(report.metaPageId
      ? [
          {
            label: report.metaPageName ? `Page Meta: ${report.metaPageName}` : `Page Meta ${report.metaPageId}`,
            url: report.facebook.url ?? undefined,
            source: "meta_graph" as const,
          },
        ]
      : []),
    ...evidenceUrls.slice(0, 6).map((url) => ({
      label: "Source OpenAI web search",
      url,
      source: "openai_web" as const,
    })),
  ];

  return {
    socialProfiles: report.socialProfiles,
    openAiEnriched,
    confidence: report.confidence,
    sources,
    officialWebsite: report.site.url,
    officialLinks: report,
    metaPageId: report.metaPageId,
    metaPageName: report.metaPageName,
  };
}
