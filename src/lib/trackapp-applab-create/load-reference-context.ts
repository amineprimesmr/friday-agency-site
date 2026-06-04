import { formatBytes, formatRatingCount } from "@/lib/apple-charts";
import type { CountryCode } from "@/lib/apple-charts";
import type { ApplabReferenceContext } from "@/lib/trackapp-applab-create/mvp-prompt-types";
import { metricsFromEmbedContext } from "@/lib/trackapp-app-display-metrics";
import {
  loadAppStoreWebScreenshotsCached,
  loadTrackerAppWorkspaceContextCached,
} from "@/lib/tracker-server-cache";

export async function loadApplabReferenceContext(
  appId: string,
  country: CountryCode = "fr",
): Promise<ApplabReferenceContext | null> {
  const context = await loadTrackerAppWorkspaceContextCached(appId, country);
  if (!context) return null;

  const { app, aggregateMetrics, overallRank, genreSliceRank } = context;
  const hasScreenshots = (app.screenshotUrls?.length ?? 0) > 0;

  const webScreenshots = hasScreenshots
    ? { iphone: app.screenshotUrls ?? [], ipad: app.ipadScreenshotUrls ?? [] }
    : await loadAppStoreWebScreenshotsCached(appId, country);

  const metrics = metricsFromEmbedContext(
    app,
    country,
    aggregateMetrics,
    overallRank,
    genreSliceRank,
  );

  const screenshotUrls =
    webScreenshots.iphone.length > 0 ? webScreenshots.iphone : (app.screenshotUrls ?? []);

  return {
    appId: app.id,
    name: app.name,
    artistName: app.artistName,
    category: app.primaryGenreName || app.category,
    description: app.description?.trim() ?? "",
    releaseNotes: app.releaseNotes?.trim() ?? "",
    screenshotUrls: screenshotUrls.slice(0, 12),
    downloadsDisplay: metrics.downloadsDisplay,
    revenueDisplay: metrics.revenueDisplay,
    trackViewUrl: app.trackViewUrl || app.url,
    averageRating:
      app.averageUserRating > 0 ?
        `${app.averageUserRating.toFixed(1)} (${app.userRatingCount > 0 ? formatRatingCount(app.userRatingCount) : "0"} avis)`
      : "—",
    fileSize: formatBytes(app.fileSizeBytes),
    minimumOsVersion: app.minimumOsVersion || "—",
  };
}
