import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Organique — Trackapp",
  description: "Acquisition organique Trackapp, bientôt disponible.",
};

const UPCOMING = [
  "Scripts TikTok / Reels prêts à tourner",
  "Plan de contenu 7 jours par niche",
  "Checklist ASO App Store",
  "Angles communautaires Reddit, Discord et groupes Facebook",
] as const;

export default function TrackappOrganiquePage() {
  return (
    <div className="relative z-[1] dashboard-main pb-16">
      <section className="dashboard-section">
        <div className="flex flex-wrap items-center gap-3">
          <p className="trackapp-workspace-hero-kicker m-0">Acquisition organique</p>
          <span className="rounded-full border border-slate-300 bg-slate-100 px-3 py-1 text-[0.65rem] font-black uppercase tracking-[0.14em] text-slate-500">
            Soon
          </span>
        </div>
        <h1 className="trackapp-workspace-hero-title text-slate-500">Organique</h1>
        <p className="trackapp-workspace-hero-desc max-w-[68ch] text-slate-500">
          Cette page arrive bientôt. Elle regroupera les plans de contenu, hooks, scripts vidéo et routines ASO pour lancer ton app sans budget pub.
        </p>
      </section>

      <section className="overflow-hidden rounded-[30px] border border-slate-200 bg-slate-100 p-6 text-slate-500 shadow-[var(--dash-shadow)] grayscale">
        <div className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
          <div>
            <span className="inline-flex rounded-full border border-slate-300 bg-white/70 px-3 py-1 text-[0.68rem] font-black uppercase tracking-[0.14em] text-slate-500">
              Bientôt disponible
            </span>
            <h2 className="mt-4 text-[1.65rem] font-bold tracking-tight text-slate-600">Le module organique est en préparation</h2>
            <p className="mt-3 text-[0.95rem] leading-relaxed">
              L&apos;objectif : te donner quoi poster, où poster, comment mesurer, et quand transformer un signal organique en campagne Ads.
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            {UPCOMING.map((item) => (
              <div key={item} className="rounded-2xl border border-slate-300 bg-white/65 px-4 py-4 text-[0.9rem] font-semibold leading-relaxed text-slate-500">
                {item}
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
