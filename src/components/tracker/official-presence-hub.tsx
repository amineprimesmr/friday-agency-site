"use client";

import { useMemo } from "react";
import type { AppEntry, CountryCode } from "@/lib/apple-charts";
import type { OfficialBrandPresenceContext } from "@/lib/official-brand-presence-context";
import { TrackerAppArtwork } from "@/components/tracker/tracker-app-artwork";
import { TrackerNavLink } from "@/components/tracker/tracker-navigation";
import { SocialPresenceStrip } from "@/components/tracker/pixel-integrations-panel";

export function OfficialPresenceHub({
  appName,
  presence,
  openAiConfigured = true,
}: {
  appName: string;
  presence: OfficialBrandPresenceContext;
  openAiConfigured?: boolean;
}) {
  const effectivePresence = useMemo(() => presence, [presence]);

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-white/[0.08] bg-gradient-to-br from-white/[0.04] to-transparent p-5 sm:p-6">
        <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-white/35">Présence officielle</p>
        <h2 className="mt-1 text-lg font-semibold text-white">Liens validés</h2>
        <p className="mt-1 max-w-2xl text-sm text-white/45">
          Site officiel en source principale, réseaux sociaux validés par branding et cohérence produit. Meta Ads
          Library uniquement via la page Facebook officielle (view_all_page_id) — jamais de recherche mot-clé.
        </p>
      </div>

      <SocialPresenceStrip
        profiles={effectivePresence.socialProfiles}
        appName={appName}
        openAiEnriched={effectivePresence.openAiEnriched}
        openAiConfigured={openAiConfigured}
        officialWebsite={effectivePresence.officialWebsite}
        confidence={effectivePresence.confidence}
        sources={effectivePresence.sources}
        officialLinks={effectivePresence.officialLinks}
      />
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
          href={`/trackapp/apptracker?country=${country}`}
          className="text-xs font-semibold text-neutral-600 underline-offset-2 hover:underline"
        >
          Explorer ↗
        </TrackerNavLink>
      </div>

      {peers.length === 0 ? (
        <p className="text-center text-sm text-neutral-500">Pas assez de concurrents dans cette catégorie.</p>
      ) : (
        <div className="-mx-1 flex gap-3 overflow-x-auto px-1 pb-1 scrollbar-none">
          {peers.map((app) => (
            <TrackerNavLink
              key={app.id}
              href={`/trackapp/accueil/${app.id}?country=${country}`}
              className="flex w-[min(100vw-2rem,240px)] shrink-0 flex-col overflow-hidden rounded-2xl border border-neutral-200 bg-neutral-50/50 transition hover:border-neutral-300 hover:bg-white"
            >
              <div className="flex items-center gap-2 border-b border-neutral-100 px-3 py-2">
                <span className="relative h-9 w-9 shrink-0 overflow-hidden rounded-lg ring-1 ring-neutral-200">
                  <TrackerAppArtwork url={app.artworkUrl} name={app.name} sizes="36px" letterClassName="bg-neutral-200 text-xs text-neutral-600" />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[13px] font-semibold text-neutral-900">{app.name}</p>
                  <p className="text-[10px] text-neutral-400">#{app.rank}</p>
                </div>
                <span className="h-2 w-2 shrink-0 rounded-full bg-emerald-500" title="Suggéré" aria-hidden />
              </div>
              <div className="relative mx-2 mt-2 aspect-[16/10] overflow-hidden rounded-xl bg-neutral-200">
                <TrackerAppArtwork url={app.artworkUrl} name={app.name} sizes="220px" />
              </div>
              <div className="mt-auto flex flex-wrap gap-1.5 px-3 py-3">
                <span className="rounded-full bg-white px-2 py-0.5 text-[10px] font-medium text-neutral-600 ring-1 ring-neutral-200">
                  {app.category || "App"}
                </span>
              </div>
            </TrackerNavLink>
          ))}
        </div>
      )}
    </div>
  );
}
