import { OfficialPresenceHub, SimilarShopsCarousel } from "@/components/tracker/official-presence-hub";
import { buildOfficialBrandPresenceContext } from "@/lib/official-brand-presence";
import { isOfficialLinksOpenAiConfigured } from "@/lib/official-brand-links";
import type { AppDetail, AppEntry, CountryCode } from "@/lib/apple-charts";

type Props = {
  app: AppDetail;
  appId: string;
  country: CountryCode;
  sidebarApps: AppEntry[];
};

/** Résolution officielle site-first à l’onglet Présence officielle. */
export async function AppOfficialPresenceSection({ app, appId, country, sidebarApps }: Props) {
  const presence = await buildOfficialBrandPresenceContext(app);

  return (
    <div className="space-y-6">
      <OfficialPresenceHub
        appName={app.name}
        presence={presence}
        openAiConfigured={isOfficialLinksOpenAiConfigured()}
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
