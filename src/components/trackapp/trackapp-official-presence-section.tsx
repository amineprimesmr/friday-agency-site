import { TrackappOfficialPresencePanel } from "@/components/trackapp/trackapp-official-presence-panel";
import { buildOfficialBrandPresenceContext } from "@/lib/official-brand-presence";
import { fetchMetaAdsForPageCached } from "@/lib/meta-ads-library";
import type { AppDetail } from "@/lib/apple-charts";
import type { CountryCode } from "@/lib/apple-charts";

export async function TrackappOfficialPresenceSection({
  app,
  country,
  initialFavorite,
  favoritesEnabled,
  embedded = false,
}: {
  app: AppDetail;
  country: CountryCode;
  initialFavorite: boolean;
  favoritesEnabled: boolean;
  embedded?: boolean;
}) {
  const presence = await buildOfficialBrandPresenceContext(app);
  const instagramUrl = presence.officialLinks.instagram.validated ? presence.officialLinks.instagram.url : null;
  const tiktokUrl = presence.officialLinks.tiktok.validated ? presence.officialLinks.tiktok.url : null;
  const metaAds = presence.metaPageId ? await fetchMetaAdsForPageCached(presence.metaPageId, country) : null;

  return (
    <TrackappOfficialPresencePanel
      appId={app.id}
      appName={app.name}
      initialFavorite={initialFavorite}
      favoritesEnabled={favoritesEnabled}
      officialLinks={presence.officialLinks}
      profiles={presence.socialProfiles}
      sources={presence.sources}
      metaAds={metaAds}
      metaPageName={presence.metaPageName}
      instagramProfileUrl={instagramUrl}
      tiktokProfileUrl={tiktokUrl}
      embedded={embedded}
    />
  );
}
