import Link from "next/link";
import type { Metadata } from "next";

import { TrackappAdsChannelCards } from "@/components/trackapp/trackapp-ads-channel-cards";
import { TRACKAPP_ADS_CHANNELS } from "@/lib/trackapp-ads-channels";
import { getTrackappProfileFavorites } from "@/lib/trackapp-profile-favorites";

export const metadata: Metadata = {
  title: "Ads — Trackapp",
  description: "Plan d'acquisition payante pour lancer et tester une app iOS.",
};

const CHECKLIST = [
  "Installer le tracking avant la première campagne.",
  "Créer une fiche App Store propre avec screenshots cohérents.",
  "Séparer les campagnes test des campagnes scale.",
  "Décider d'un seuil : coût par install, activation, trial ou achat.",
];

export default async function TrackappAdsPage() {
  const { loggedIn, adsKeys } = await getTrackappProfileFavorites();

  return (
    <div className="relative z-[1] dashboard-main pb-16">
      <section className="dashboard-section">
        <p className="trackapp-workspace-hero-kicker">Acquisition payante</p>
        <h1 className="trackapp-workspace-hero-title">Ads</h1>
        <p className="trackapp-workspace-hero-desc max-w-[68ch]">
          Une page simple pour cadrer tes tests paid : choisir le bon canal, lancer proprement, puis lire les signaux sans brûler ton budget.
        </p>
      </section>

      <TrackappAdsChannelCards channels={TRACKAPP_ADS_CHANNELS} loggedIn={loggedIn} favoriteKeys={adsKeys} />

      <section className="mt-6 grid gap-4 lg:grid-cols-[1.05fr_0.95fr]">
        <article className="rounded-[26px] border border-[var(--dash-border)] bg-white p-6 shadow-[var(--dash-shadow-lg)]">
          <p className="trackapp-workspace-hero-kicker">Checklist avant lancement</p>
          <h2 className="mt-2 text-[1.45rem] font-bold tracking-tight text-[var(--dash-text)]">Ne lance pas une campagne sans ça</h2>
          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            {CHECKLIST.map((item) => (
              <div key={item} className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-[0.88rem] font-semibold leading-relaxed text-slate-700">
                {item}
              </div>
            ))}
          </div>
        </article>

        <article className="rounded-[26px] border border-slate-900 bg-slate-950 p-6 text-white shadow-[0_20px_55px_rgba(15,23,42,0.18)]">
          <p className="text-[0.72rem] font-black uppercase tracking-[0.18em] text-lime-300">Point de départ conseillé</p>
          <h2 className="mt-3 text-[1.45rem] font-bold tracking-tight">Commence par Apple Ads</h2>
          <p className="mt-3 text-[0.92rem] leading-relaxed text-white/68">
            Pour une app iOS, Apple Search Ads donne souvent le feedback le plus direct : mots-clés, intention, fiche App Store et conversion.
          </p>
          <Link
            href="/trackapp/apptracker"
            className="mt-5 inline-flex rounded-full bg-white px-4 py-2 text-[0.84rem] font-bold text-slate-950 no-underline transition hover:bg-lime-200"
          >
            Trouver des apps à analyser
          </Link>
        </article>
      </section>
    </div>
  );
}
