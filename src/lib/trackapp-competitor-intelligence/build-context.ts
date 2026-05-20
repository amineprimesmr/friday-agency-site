import type { AppDetail, CountryCode } from "@/lib/apple-charts";
import { getTrackappAppDisplayMetricsCached } from "@/lib/trackapp-app-display-metrics";
import { resolveOfficialSiteHomeUrl } from "@/lib/official-brand-site-home";
import { loadTrackerAppEmbedContext } from "@/lib/tracker-app-embed-data";

function officialSiteHintFromApp(sellerUrl?: string, supportUrl?: string): string | null {
  for (const raw of [sellerUrl, supportUrl]) {
    if (!raw?.trim()) continue;
    const home = resolveOfficialSiteHomeUrl(raw);
    if (home) return home;
  }
  return null;
}

export type CompetitorAnalysisContext = Readonly<{
  app: AppDetail;
  country: CountryCode;
  revenueDisplay: string;
  downloadsDisplay: string;
  metricSource: string;
  genrePeerNames: string[];
  officialSiteHint: string | null;
}>;

export async function buildCompetitorAnalysisContext(
  appId: string,
  country: CountryCode,
): Promise<CompetitorAnalysisContext | null> {
  const embed = await loadTrackerAppEmbedContext(appId, country);
  if (!embed) return null;

  const { app, categoryPeers } = embed;
  const metrics = await getTrackappAppDisplayMetricsCached(appId, country);

  const officialSiteHint = officialSiteHintFromApp(app.sellerUrl, app.supportUrl);

  return {
    app,
    country,
    revenueDisplay: metrics.revenueDisplay,
    downloadsDisplay: metrics.downloadsDisplay,
    metricSource: metrics.metricSource,
    genrePeerNames: categoryPeers.map((p) => p.name).filter((n) => n !== app.name),
    officialSiteHint,
  };
}
