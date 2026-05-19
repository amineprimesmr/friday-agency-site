"use client";

import { useMemo } from "react";
import { estimateMonthlyDownloads, type AppEntry, type CountryCode } from "@/lib/apple-charts";
import Image from "next/image";
import type { TrackerMetaAdLibraryContext } from "@/lib/tracker-meta-ad-library-context";
import { TrackerNavLink } from "@/components/tracker/tracker-navigation";
import { SocialPresenceStrip } from "@/components/tracker/pixel-integrations-panel";

export function AdIntelligenceHub({
  appName,
  metaLibraryContext,
}: {
  appName: string;
  metaLibraryContext: TrackerMetaAdLibraryContext;
}) {
  const effectiveContext = useMemo(() => metaLibraryContext, [metaLibraryContext]);

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-white/[0.08] bg-gradient-to-br from-white/[0.04] to-transparent p-5 sm:p-6">
        <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-white/35">Marketing tracker</p>
        <h2 className="mt-1 text-lg font-semibold text-white">Liens officiels & organique</h2>
        <p className="mt-1 max-w-2xl text-sm text-white/45">
          Meta Ads Library est désactivé pour le moment. On garde la partie fiable : site officiel, réseaux validés et
          base pour tracker les vidéos organiques récentes qui performent.
        </p>
      </div>

      <SocialPresenceStrip
        profiles={effectiveContext.socialProfiles}
        appName={appName}
        openAiEnriched={effectiveContext.openAiEnriched}
        officialWebsite={effectiveContext.officialWebsite}
        confidence={effectiveContext.confidence}
        sources={effectiveContext.sources}
        officialLinks={effectiveContext.officialLinks}
      />

      <div className="rounded-2xl border border-white/[0.07] bg-white/[0.02] p-5 sm:p-6">
        <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-white/40">Organic video tracker</p>
        <h3 className="mt-1 text-base font-semibold text-white">Prochaine brique recommandée</h3>
        <p className="mt-2 max-w-3xl text-sm leading-relaxed text-white/45">
          Oui, on peut créer un système qui part des comptes officiels validés, puis récupère les vidéos récentes et les
          classe par vues, likes, commentaires, partages et vitesse de croissance. Le plus fiable sera TikTok, YouTube
          Shorts et Instagram Reels quand les APIs/exports disponibles le permettent.
        </p>
        <div className="mt-4 grid gap-3 md:grid-cols-3">
          {[
            { title: "TikTok organique", text: "Dernières vidéos du compte officiel, vues, likes, commentaires, partages, lien direct." },
            { title: "YouTube Shorts", text: "Shorts récents, vues publiques, engagement, date de publication et top hooks." },
            { title: "Instagram Reels", text: "Lien des reels détectés, validation du compte officiel, scoring manuel/API selon accès." },
          ].map((item) => (
            <div key={item.title} className="rounded-xl border border-white/[0.07] bg-black/30 p-4">
              <p className="text-sm font-semibold text-white/85">{item.title}</p>
              <p className="mt-1 text-xs leading-relaxed text-white/40">{item.text}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export function SimilarShopsCarousel({
  apps,
  currentId,
  country,
  categoryLabel,
}: {
  apps: AppEntry[];
  currentId: string;
  country: CountryCode;
  categoryLabel: string;
}) {
  const peers = apps.filter((a) => a.id !== currentId).slice(0, 16);

  return (
    <div className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
        <div>
          <h3 className="text-[11px] font-bold uppercase tracking-[0.2em] text-neutral-400">Apps similaires</h3>
          <p className="mt-0.5 text-sm text-neutral-600">{categoryLabel}</p>
        </div>
        <TrackerNavLink
          href={`/tracker/top-charts?country=${country}`}
          className="text-xs font-semibold text-neutral-600 underline-offset-2 hover:underline"
        >
          Voir plus ↗
        </TrackerNavLink>
      </div>

      {peers.length === 0 ? (
        <p className="text-center text-sm text-neutral-500">Pas assez de concurrents dans cette catégorie.</p>
      ) : (
        <div className="-mx-1 flex gap-3 overflow-x-auto px-1 pb-1 scrollbar-none">
          {peers.map((app) => (
            <TrackerNavLink
              key={app.id}
              href={`/tracker/apps/${app.id}?country=${country}&tab=ads`}
              className="flex w-[min(100vw-2rem,240px)] shrink-0 flex-col overflow-hidden rounded-2xl border border-neutral-200 bg-neutral-50/50 transition hover:border-neutral-300 hover:bg-white"
            >
              <div className="flex items-center gap-2 border-b border-neutral-100 px-3 py-2">
                <span className="relative h-9 w-9 shrink-0 overflow-hidden rounded-lg ring-1 ring-neutral-200">
                  {app.artworkUrl ? (
                    <Image src={app.artworkUrl} alt="" fill className="object-cover" sizes="36px" />
                  ) : (
                    <span className="flex h-full w-full items-center justify-center bg-neutral-200 text-xs font-bold text-neutral-600">
                      {app.name.charAt(0)}
                    </span>
                  )}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[13px] font-semibold text-neutral-900">{app.name}</p>
                  <p className="text-[10px] text-neutral-400">#{app.rank}</p>
                </div>
                <span className="h-2 w-2 shrink-0 rounded-full bg-emerald-500" title="Suggéré" aria-hidden />
              </div>
              <div className="relative mx-2 mt-2 aspect-[16/10] overflow-hidden rounded-xl bg-neutral-200">
                {app.artworkUrl ? (
                  <Image src={app.artworkUrl} alt="" fill className="object-cover" sizes="220px" />
                ) : null}
              </div>
              <div className="mt-auto flex flex-wrap gap-1.5 px-3 py-3">
                <span className="rounded-full bg-white px-2 py-0.5 text-[10px] font-medium text-neutral-600 ring-1 ring-neutral-200">
                  ~{estimateMonthlyDownloads(app.rank, country)}/mois
                </span>
              </div>
            </TrackerNavLink>
          ))}
        </div>
      )}
    </div>
  );
}
