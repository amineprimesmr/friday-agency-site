import type { Metadata } from "next";

import { TRACKAPP_ADS_CHANNELS } from "@/lib/trackapp-ads-channels";
import { getTrackappProfileFavorites } from "@/lib/trackapp-profile-favorites";

import { TrackappAdsChannelCards } from "@/components/trackapp/trackapp-ads-channel-cards";

export const metadata: Metadata = {
  title: "Favoris — Ads",
  description: "Canaux d’acquisition que tu as mis en favori.",
};

export default async function TrackappFavoriteAdsPage() {
  const { loggedIn, adsKeys } = await getTrackappProfileFavorites();
  const channels = TRACKAPP_ADS_CHANNELS.filter((c) => adsKeys.includes(c.id));

  return (
    <div className="relative z-[1] dashboard-main pb-16">
      <section className="dashboard-section">
        <p className="trackapp-workspace-hero-kicker">Favoris</p>
        <h1 className="trackapp-workspace-hero-title">Ads</h1>
        <p className="trackapp-workspace-hero-desc max-w-[68ch]">
          Les fiches canal que tu as épinglées depuis la page Ads. Retrouve-les ici en un clic.
        </p>
      </section>

      {!loggedIn ? (
        <p className="rounded-2xl border border-dashed border-slate-300 bg-white p-6 text-[0.92rem] text-[var(--dash-muted-light)]">
          Connecte-toi pour synchroniser tes favoris.
        </p>
      ) : channels.length === 0 ? (
        <p className="rounded-2xl border border-dashed border-slate-300 bg-white p-6 text-[0.92rem] text-[var(--dash-muted-light)]">
          Aucun canal Ads en favori. Ouvre la page Ads et ajoute un cœur sur une carte.
        </p>
      ) : (
        <TrackappAdsChannelCards channels={channels} loggedIn={loggedIn} favoriteKeys={adsKeys} />
      )}
    </div>
  );
}
