import { AdIntelligenceHub, SimilarShopsCarousel } from "@/components/tracker/ad-intelligence-hub";
import { buildTrackerMetaAdLibraryContext } from "@/lib/tracker-meta-ad-resolution";
import type { AppDetail, AppEntry, CountryCode } from "@/lib/apple-charts";

type Props = {
  app: AppDetail;
  appId: string;
  country: CountryCode;
  sidebarApps: AppEntry[];
};

/** Résolution officielle site-first uniquement à l’onglet Publicités (évite plusieurs secondes sur l’aperçu). */
export async function AppAdIntelligenceSection({ app, appId, country, sidebarApps }: Props) {
  const metaLibraryContext = await buildTrackerMetaAdLibraryContext({
    app,
    country,
  });

  return (
    <div className="space-y-6">
      <AdIntelligenceHub
        appName={app.name}
        metaLibraryContext={metaLibraryContext}
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
