import { AdIntelligenceHub, SimilarShopsCarousel } from "@/components/tracker/ad-intelligence-hub";
import { buildTrackerMetaAdLibraryContext } from "@/lib/tracker-meta-ad-resolution";
import { extractSocialProfiles } from "@/lib/social-presence";
import type { AdIntelPlatform } from "@/components/tracker/app-ads";
import type { AppDetail, AppEntry, CountryCode } from "@/lib/apple-charts";

const AD_INTEL_PLATFORMS: AdIntelPlatform[] = ["meta", "tiktok"];

type Props = {
  app: AppDetail;
  appId: string;
  country: CountryCode;
  sidebarApps: AppEntry[];
};

/** Résolution Meta / OpenAI uniquement à l’onglet Publicités (évite plusieurs secondes sur l’aperçu). */
export async function AppAdIntelligenceSection({ app, appId, country, sidebarApps }: Props) {
  const socialFromStore = extractSocialProfiles(app.description, app.releaseNotes ?? "");
  const metaLibraryContext = await buildTrackerMetaAdLibraryContext({
    appName: app.name,
    developerName: app.sellerName || app.artistName,
    genre: app.primaryGenreName,
    description: app.description ?? "",
    releaseNotes: app.releaseNotes ?? "",
    socialFromStore,
    country,
  });

  return (
    <div className="space-y-6">
      <AdIntelligenceHub
        appName={app.name}
        developerName={app.sellerName || app.artistName}
        bundleId={app.bundleId}
        countryCode={country}
        trackerAppleAppId={appId}
        metaLibraryContext={metaLibraryContext}
        enabledPlatforms={AD_INTEL_PLATFORMS}
      />
      <SimilarShopsCarousel
        apps={sidebarApps}
        currentId={appId}
        country={country}
        categoryLabel={`${app.primaryGenreName} · même classement`}
      />
    </div>
  );
}
