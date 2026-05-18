"use client";

import { useEffect, useMemo, useState, useCallback } from "react";
import { estimateMonthlyDownloads, type AppEntry, type CountryCode } from "@/lib/apple-charts";
import Image from "next/image";
import type { TrackerMetaAdLibraryContext } from "@/lib/tracker-meta-ad-library-context";
import { TrackerNavLink } from "@/components/tracker/tracker-navigation";
import {
  PixelIntegrationsPanel,
  SocialPresenceStrip,
  useMetaLibraryConfigured,
} from "@/components/tracker/pixel-integrations-panel";
import { MetaLatestAdsCarousel } from "@/components/tracker/meta-latest-ads-carousel";
import type { AdIntelPlatform } from "@/components/tracker/app-ads";
import { AppAds } from "@/components/tracker/app-ads";
import { useMetaAdLibrary } from "@/components/tracker/use-meta-ad-library";
import { mergeManualMetaPageIds } from "@/lib/tracker-merge-manual-meta";
import {
  loadStoredManualMetaPageIds,
  TrackerManualMetaPagesPanel,
} from "@/components/tracker/tracker-manual-meta-pages";

export function AdIntelligenceHub({
  appName,
  developerName,
  bundleId,
  countryCode,
  trackerAppleAppId,
  metaLibraryContext,
  enabledPlatforms,
}: {
  appName: string;
  developerName: string;
  bundleId: string;
  countryCode: string;
  /** ID App Store (chiffres) — clé localStorage pour pages Meta manuelles. */
  trackerAppleAppId: string;
  metaLibraryContext: TrackerMetaAdLibraryContext;
  enabledPlatforms: AdIntelPlatform[];
}) {
  const metaOk = useMetaLibraryConfigured();
  const metaCc = (countryCode || "FR").trim() || "FR";

  const [manualPageIds, setManualPageIds] = useState<string[]>([]);
  useEffect(() => {
    setManualPageIds(loadStoredManualMetaPageIds(trackerAppleAppId));
  }, [trackerAppleAppId]);

  const onManualPageIdsChange = useCallback((ids: string[]) => {
    setManualPageIds(ids);
  }, []);

  const effectiveContext = useMemo(
    () => mergeManualMetaPageIds(metaLibraryContext, manualPageIds),
    [metaLibraryContext, manualPageIds],
  );

  const hasResolvedMetaPage = effectiveContext.searchPageIds.length > 0;
  const metaLib = useMetaAdLibrary({
    searchTerms: effectiveContext.keywordFallback,
    searchPageIds: effectiveContext.searchPageIds,
    countryCode: metaCc,
    pageSize: 12,
    enabled: hasResolvedMetaPage,
  });

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-white/[0.08] bg-gradient-to-br from-white/[0.04] to-transparent p-5 sm:p-6">
        <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-white/35">Style TrendTrack</p>
        <h2 className="mt-1 text-lg font-semibold text-white">Intelligence marque & pubs</h2>
        <p className="mt-1 max-w-2xl text-sm text-white/45">
          Réseaux officiels (App Store + recherche web IA), puis Ad Library Meta en mode strict : les créas sont chargées
          uniquement quand une <strong className="font-semibold text-white/70">Page Facebook</strong> officielle est
          résolue et filtrée avec <code className="rounded bg-white/[0.06] px-1 text-[10px]">search_page_ids</code>.
          Aucun résultat mot-clé n’est mélangé à la marque.
        </p>
      </div>

      <SocialPresenceStrip
        profiles={effectiveContext.socialProfiles}
        appName={appName}
        enrichedByAi={effectiveContext.openAiEnriched}
        officialWebsite={effectiveContext.officialWebsite}
        confidence={effectiveContext.confidence}
        sources={effectiveContext.sources}
      />

      <PixelIntegrationsPanel metaLibraryConfigured={metaOk} />

      <TrackerManualMetaPagesPanel
        trackerAppleAppId={trackerAppleAppId}
        manualPageIds={manualPageIds}
        onManualPageIdsChange={onManualPageIdsChange}
        configured={metaOk}
      />

      <MetaLatestAdsCarousel
        appName={appName}
        countryCode={countryCode}
        metaLibraryContext={effectiveContext}
        library={metaLib}
      />

      <div className="rounded-2xl border border-white/[0.07] bg-white/[0.02] p-5">
        <h3 className="text-[11px] font-bold uppercase tracking-[0.22em] text-white/40">Vue détaillée API</h3>
        <p className="mt-1 text-xs text-white/35">Grille classique, pagination et onglets selon ta configuration.</p>
        <div className="mt-5">
          <AppAds
            appName={appName}
            developerName={developerName}
            bundleId={bundleId}
            countryCode={countryCode}
            enabledPlatforms={enabledPlatforms}
            metaLibraryContext={effectiveContext}
            metaAdLibrary={metaLib}
          />
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
