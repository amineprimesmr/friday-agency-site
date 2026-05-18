"use client";

import type { MetaArchivedAd } from "@/lib/meta-ad-library";
import { metaAdLibraryWebUrl } from "@/lib/meta-ad-library";
import { excerptMetaBodies, formatMetaDate, labelMetaPlatform } from "@/lib/meta-ad-display";
import type { TrackerMetaAdLibraryContext } from "@/lib/tracker-meta-ad-library-context";
import type { MetaAdLibraryState } from "@/components/tracker/use-meta-ad-library";

function activeDays(startIso?: string): number | null {
  if (!startIso) return null;
  const t = new Date(startIso).getTime();
  if (Number.isNaN(t)) return null;
  const d = Math.floor((Date.now() - t) / (86400 * 1000));
  return d >= 0 ? Math.max(1, d) : null;
}

function AdTrendCard({ ad }: { ad: MetaArchivedAd }) {
  const platforms = (ad.publisher_platforms ?? []).slice(0, 3);
  const days = activeDays(ad.ad_delivery_start_time);
  const copy =
    excerptMetaBodies(ad.ad_creative_bodies, 140) ||
    excerptMetaBodies(ad.ad_creative_link_titles, 80) ||
    "Créative Meta (voir snapshot)";

  return (
    <article className="flex w-[min(100vw-2rem,280px)] shrink-0 flex-col overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-[0_8px_30px_-12px_rgba(0,0,0,.12)]">
      <div className="flex flex-wrap items-center gap-2 border-b border-neutral-100 px-3 py-2 text-[10px] font-semibold text-neutral-500">
        <span className="flex flex-wrap gap-1">
          {platforms.map((p) => (
            <span key={p} className="rounded-md bg-neutral-100 px-1.5 py-0.5 text-neutral-700">
              {labelMetaPlatform(p)}
            </span>
          ))}
        </span>
        {days !== null ? (
          <span className="ml-auto inline-flex items-center gap-1 tabular-nums text-emerald-700">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" aria-hidden />
            {days}j actif
          </span>
        ) : null}
      </div>

      <div className="flex items-center gap-2 border-b border-neutral-100 px-3 py-2.5">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-violet-500 to-fuchsia-500 text-xs font-bold text-white">
          {(ad.page_name ?? "?").slice(0, 1).toUpperCase()}
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate text-[13px] font-semibold text-neutral-900">{ad.page_name ?? "Page"}</p>
          <p className="text-[10px] text-neutral-400">Meta Ad Library</p>
        </div>
      </div>

      <div
        className="relative aspect-[9/14] w-full bg-gradient-to-b from-neutral-100 to-neutral-200"
        aria-hidden
      >
        <div className="absolute inset-0 flex flex-col justify-end bg-gradient-to-t from-black/55 via-black/10 to-transparent p-3">
          {ad.ad_snapshot_url ? (
            <span className="pointer-events-none mx-auto mb-6 flex h-12 w-12 items-center justify-center rounded-full bg-white/95 text-neutral-900 shadow-lg">
              ▶
            </span>
          ) : null}
        </div>
      </div>

      <div className="space-y-2 px-3 pb-2 pt-2">
        <p className="line-clamp-3 text-[12px] leading-snug text-neutral-700">{copy}</p>
        <p className="text-[10px] text-neutral-400">
          Diffusion · {formatMetaDate(ad.ad_delivery_start_time)}
          {ad.ad_delivery_stop_time ? ` → ${formatMetaDate(ad.ad_delivery_stop_time)}` : ""}
        </p>
      </div>

      <div className="mt-auto border-t border-neutral-100 px-3 py-2.5">
        {ad.ad_snapshot_url ? (
          <a
            href={ad.ad_snapshot_url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex w-full items-center justify-center rounded-xl bg-neutral-900 py-2 text-center text-[12px] font-semibold text-white transition hover:bg-neutral-800"
          >
            Voir la créa ↗
          </a>
        ) : (
          <span className="block text-center text-[11px] text-neutral-400">Snapshot indisponible</span>
        )}
      </div>
    </article>
  );
}

export function MetaLatestAdsCarousel({
  appName,
  countryCode,
  metaLibraryContext,
  library,
}: {
  appName: string;
  countryCode: string;
  metaLibraryContext: TrackerMetaAdLibraryContext;
  library: MetaAdLibraryState;
}) {
  const fb = metaLibraryContext.keywordFallback || appName;
  const hasResolvedMetaPage = metaLibraryContext.searchPageIds.length > 0;
  const metaLibraryWebUrl = metaAdLibraryWebUrl({
    searchPageIds: metaLibraryContext.searchPageIds,
    keywordFallback: fb,
  });

  const { loading, loadingMore, configured, apiError, ads, nextAfter, loadMore, searchMode } = library;

  const pageLabel =
    metaLibraryContext.entries[0]?.pageName ||
    (metaLibraryContext.entries[0] ? `ID ${metaLibraryContext.entries[0].pageId}` : null);

  return (
    <div className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm">
      <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
        <div>
          <h3 className="text-[11px] font-bold uppercase tracking-[0.2em] text-neutral-400">Dernières ads</h3>
          <p className="mt-1 text-sm text-neutral-600">
            Facebook & Instagram ·{" "}
            {searchMode === "page" && hasResolvedMetaPage ? (
              <>
                page <span className="font-semibold text-neutral-900">{pageLabel ?? "Meta"}</span>
              </>
            ) : (
              <>
                Page Meta officielle non résolue
              </>
            )}
            {countryCode ? (
              <span className="text-neutral-400"> · pays {countryCode.toUpperCase()}</span>
            ) : null}
          </p>
        </div>
        <a
          href={metaLibraryWebUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="shrink-0 rounded-xl border border-neutral-200 bg-neutral-50 px-4 py-2 text-xs font-semibold text-neutral-800 transition hover:bg-white"
        >
          Bibliothèque Meta ↗
        </a>
      </div>

      {!hasResolvedMetaPage ? (
        <div className="mb-4 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-[13px] text-amber-950">
          <p className="font-semibold">Dernières ads indisponibles</p>
          <p className="mt-1 text-[12px] text-amber-900/85">
            Aucune Page Meta fiable n’a été résolue. On n’affiche pas de résultats mot-clé pour éviter les faux positifs.
          </p>
          <a
            href={metaLibraryContext.manualSearchUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-3 inline-flex rounded-lg border border-amber-200 bg-white/70 px-3 py-2 text-xs font-semibold text-amber-950 hover:bg-white"
          >
            Recherche manuelle Meta ↗
          </a>
        </div>
      ) : null}

      {!configured && hasResolvedMetaPage && (
        <div className="mb-4 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-[13px] text-amber-950">
          <p className="font-semibold">Configurer Meta</p>
          <p className="mt-1 text-[12px] text-amber-900/85">
            Ajoute <code className="rounded bg-white/80 px-1">META_AD_LIBRARY_ACCESS_TOKEN</code> dans{" "}
            <code className="rounded bg-white/80 px-1">.env</code> après avoir créé ton app sur{" "}
            <a href="https://developers.facebook.com/apps/" target="_blank" rel="noopener noreferrer" className="underline">
              developers.facebook.com
            </a>{" "}
            et obtenu l’accès{" "}
            <a href="https://www.facebook.com/ads/library/api/" target="_blank" rel="noopener noreferrer" className="underline">
              Ad Library API
            </a>
            .
          </p>
        </div>
      )}

      {apiError && configured && hasResolvedMetaPage && (
        <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-[12px] text-red-900">
          <span className="font-semibold">Meta</span> — {apiError}
        </div>
      )}

      {!hasResolvedMetaPage ? (
        <p className="rounded-xl bg-neutral-50 py-10 text-center text-sm text-neutral-500">
          Résolution page-only requise avant de charger les créatives.
        </p>
      ) : loading ? (
        <div className="flex gap-3 overflow-hidden pb-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-[420px] w-[260px] shrink-0 animate-pulse rounded-2xl bg-neutral-100" />
          ))}
        </div>
      ) : ads.length === 0 ? (
        <p className="rounded-xl bg-neutral-50 py-10 text-center text-sm text-neutral-500">
          Aucune annonce active trouvée pour cette Page Meta dans ce marché.
        </p>
      ) : (
        <>
          <div className="-mx-1 flex gap-3 overflow-x-auto px-1 pb-2 scrollbar-none">
            {ads.map((ad) => (
              <AdTrendCard key={ad.id} ad={ad} />
            ))}
          </div>
          {nextAfter ? (
            <div className="mt-3 flex justify-center">
              <button
                type="button"
                onClick={() => void loadMore()}
                disabled={loadingMore}
                className="rounded-xl border border-neutral-200 bg-neutral-50 px-5 py-2 text-xs font-semibold text-neutral-800 transition hover:bg-white disabled:opacity-50"
              >
                {loadingMore ? "Chargement…" : "Charger plus"}
              </button>
            </div>
          ) : null}
        </>
      )}

      <p className="mt-4 border-t border-neutral-100 pt-3 text-[10px] text-neutral-400">
        Les métriques type dépenses ou impressions ne sont pas exposées par l’API publique Ad Library — uniquement les créatives et
        métadonnées de diffusion.
      </p>
    </div>
  );
}
