import { TrackappOfficialPresencePanel } from "@/components/trackapp/trackapp-official-presence-panel";
import { buildOfficialBrandPresenceContext } from "@/lib/official-brand-presence";
import { fetchMetaAdsForPageCached } from "@/lib/meta-ads-library";
import type { AppDetail } from "@/lib/apple-charts";
import type { CountryCode } from "@/lib/apple-charts";

export async function TrackappOfficialPresenceSection({
  app,
  country,
}: {
  app: AppDetail;
  country: CountryCode;
}) {
  const presence = await buildOfficialBrandPresenceContext(app);
  const instagramUrl = presence.officialLinks.instagram.validated ? presence.officialLinks.instagram.url : null;
  const tiktokUrl = presence.officialLinks.tiktok.validated ? presence.officialLinks.tiktok.url : null;
  const metaAds = presence.metaPageId ? await fetchMetaAdsForPageCached(presence.metaPageId, country) : null;

  return (
    <section className="mt-5">
      <TrackappOfficialPresencePanel
        appId={app.id}
        appName={app.name}
        officialLinks={presence.officialLinks}
        profiles={presence.socialProfiles}
        sources={presence.sources}
        metaAds={metaAds}
        metaPageName={presence.metaPageName}
        instagramProfileUrl={instagramUrl}
        tiktokProfileUrl={tiktokUrl}
      />
    </section>
  );
}
