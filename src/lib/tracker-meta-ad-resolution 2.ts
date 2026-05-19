import type { AppDetail } from "@/lib/apple-charts";
import { resolveOfficialBrandLinksCached } from "@/lib/official-brand-links";
import type { TrackerMetaAdLibraryContext } from "@/lib/tracker-meta-ad-library-context";

/**
 * Resolution stricte site-first:
 * - site officiel issu de la fiche App Store d'abord
 * - reseaux uniquement s'ils sortent du site officiel
 * - Meta Ads uniquement via Page ID officiel, jamais via keyword search.
 */
export async function buildTrackerMetaAdLibraryContext(args: {
  app: AppDetail;
  country?: string;
}): Promise<TrackerMetaAdLibraryContext> {
  const report = await resolveOfficialBrandLinksCached(args.app);
  const pageId = report.metaPageId;
  const keywordFallback = (args.app.sellerName || args.app.artistName || args.app.name).trim().slice(0, 100);
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

  return {
    searchPageIds: pageId ? [pageId] : [],
    keywordFallback,
    entries:
      pageId && report.facebook.url
        ? [
            {
              pageId,
              pageName: report.metaPageName ?? undefined,
              sourceUrl: report.facebook.url,
              source: report.facebook.source === "openai_web" ? "openai_web" : "official_site",
              confidence: report.confidence,
            },
          ]
        : [],
    mode: pageId ? "page" : "unresolved",
    socialProfiles: report.socialProfiles,
    openAiEnriched,
    resolutionStatus: pageId ? "resolved" : "not_found",
    confidence: report.confidence,
    sources: [
      ...(report.site.url
        ? [{ label: "Site officiel App Store", url: report.site.url, source: "app_store" as const }]
        : []),
      ...report.socialProfiles.map((profile) => ({
        label: `${profile.label} validé officiellement`,
        url: profile.url,
        source: "official_site" as const,
      })),
      ...(pageId
        ? [
            {
              label: report.metaPageName ? `Page Meta: ${report.metaPageName}` : `Page Meta ${pageId}`,
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
    ],
    rejectedCandidates:
      !pageId && report.facebook.url
        ? [
            {
              url: report.facebook.url,
              reason: "Page Facebook officielle trouvee, mais Page ID Meta non valide par Graph",
              source: "official_site",
            },
          ]
        : [],
    officialWebsite: report.site.url,
    officialLinks: report,
    primaryMetaPageId: pageId,
    allMetaPageIds: pageId ? [pageId] : [],
    manualSearchUrl: "https://www.facebook.com/ads/library/?active_status=active&ad_type=all&country=ALL&media_type=all",
  };
}
