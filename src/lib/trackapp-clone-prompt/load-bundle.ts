import { unstable_cache } from "next/cache";

import type { CountryCode } from "@/lib/apple-charts";
import { canonicalSiteOrigin } from "@/lib/embed-url";
import { buildOfficialBrandPresenceContext } from "@/lib/official-brand-presence";
import { trackappApplabAppHref } from "@/lib/trackapp-applab-paths";
import { trackappApptrackerAppHref } from "@/lib/trackapp-apptracker-paths";
import { assembleTrackappClonePromptBundle } from "@/lib/trackapp-clone-prompt/build-prompt";
import type { TrackappCloneAngle, TrackappCloneStack } from "@/lib/trackapp-clone-prompt/types";
import { metricsFromEmbedContext } from "@/lib/trackapp-app-display-metrics";
import {
  loadAppStoreWebScreenshotsCached,
  loadTrackerAppWorkspaceContextCached,
} from "@/lib/tracker-server-cache";

export type LoadCloneBundleOptions = Readonly<{
  stack?: TrackappCloneStack;
  angle?: TrackappCloneAngle;
}>;

async function loadTrackappClonePromptBundleUncached(
  appId: string,
  country: CountryCode,
  options: LoadCloneBundleOptions = {},
) {
  const stack = options.stack ?? "swiftui";
  const angle = options.angle ?? "inspire";

  const context = await loadTrackerAppWorkspaceContextCached(appId, country);
  if (!context) return null;

  const { app, aggregateMetrics, overallRank, genreSliceRank } = context;
  const hasScreenshots = (app.screenshotUrls?.length ?? 0) > 0;

  const [webScreenshots, presence] = await Promise.all([
    hasScreenshots
      ? Promise.resolve({ iphone: app.screenshotUrls ?? [], ipad: app.ipadScreenshotUrls ?? [] })
      : loadAppStoreWebScreenshotsCached(appId, country),
    buildOfficialBrandPresenceContext(app),
  ]);
  const metrics = metricsFromEmbedContext(
    app,
    country,
    aggregateMetrics,
    overallRank,
    genreSliceRank,
  );
  const screenshotUrls =
    webScreenshots.iphone.length > 0 ? webScreenshots.iphone : (app.screenshotUrls ?? []);

  const origin = canonicalSiteOrigin();
  const trackappAppUrl = `${origin}${trackappApptrackerAppHref(app.id, country)}`;
  const trackappSpecUrl = `${origin}${trackappApplabAppHref(app.id, country, { tab: "export", stack, angle })}`;

  return assembleTrackappClonePromptBundle({
    app,
    country,
    metrics,
    screenshotUrls,
    presence,
    stack,
    angle,
    trackappSpecUrl,
    trackappAppUrl,
    overallRank,
    genreRank: genreSliceRank,
  });
}

const cachedCloneBundle = unstable_cache(
  async (
    appId: string,
    country: CountryCode,
    stack: TrackappCloneStack,
    angle: TrackappCloneAngle,
  ) => loadTrackappClonePromptBundleUncached(appId, country, { stack, angle }),
  ["trackapp-clone-prompt-bundle-v1"],
  { revalidate: 900 },
);

export async function loadTrackappClonePromptBundle(
  appId: string,
  country: CountryCode,
  options: LoadCloneBundleOptions = {},
) {
  const stack = options.stack ?? "swiftui";
  const angle = options.angle ?? "inspire";
  return cachedCloneBundle(appId, country, stack, angle);
}
