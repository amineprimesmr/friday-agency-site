"use client";

import { useCallback, useEffect, useState } from "react";
import type { MetaArchivedAd } from "@/lib/meta-ad-library";

type Platform = "meta" | "tiktok" | "google";

const PLATFORMS: { id: Platform; label: string; icon: string; color: string }[] = [
  { id: "meta", label: "Meta Ads", icon: "🟦", color: "text-white/70" },
  { id: "tiktok", label: "TikTok Ads", icon: "⬛", color: "text-white" },
  { id: "google", label: "Google UAC", icon: "🔴", color: "text-red-400" },
];

function formatMetaDate(iso?: string) {
  if (!iso) return "—";
  try {
    return new Date(iso).toLocaleDateString("fr-FR", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  } catch {
    return "—";
  }
}

function labelPlatform(p: string) {
  const x = p.toLowerCase();
  if (x === "facebook") return "Facebook";
  if (x === "instagram") return "Instagram";
  if (x === "messenger") return "Messenger";
  if (x === "audience_network") return "Audience Network";
  if (x === "threads") return "Threads";
  return p;
}

function excerptBodies(bodies?: string[], max = 220) {
  if (!bodies?.length) return "";
  const t = bodies.filter(Boolean).join(" · ");
  if (t.length <= max) return t;
  return `${t.slice(0, max)}…`;
}

type AdLibraryApiResponse = {
  configured: boolean;
  searchQuery: string;
  countries: string[];
  ads: MetaArchivedAd[];
  paging: { cursors?: { before?: string; after?: string } } | null;
  error: string | null;
  errorCode: number | null;
};

function MetaAdsPanel({
  developerName,
  appName,
  countryCode,
}: {
  developerName: string;
  appName: string;
  countryCode: string;
}) {
  const primaryTerms = (developerName.trim() || appName.trim()).slice(0, 100);
  const webSearchQ = encodeURIComponent(primaryTerms || appName);
  const metaLibraryWebUrl = `https://www.facebook.com/ads/library/?active_status=active&ad_type=all&country=ALL&q=${webSearchQ}&search_type=keyword_unordered&media_type=all`;

  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [configured, setConfigured] = useState(true);
  const [apiError, setApiError] = useState<string | null>(null);
  const [ads, setAds] = useState<MetaArchivedAd[]>([]);
  const [nextAfter, setNextAfter] = useState<string | null>(null);

  const fetchPage = useCallback(
    async (afterCursor?: string | null) => {
      const params = new URLSearchParams();
      params.set("q", primaryTerms || appName);
      params.set("countries", countryCode.toUpperCase());
      params.set("limit", "12");
      if (afterCursor) params.set("after", afterCursor);

      const res = await fetch(`/api/meta/ad-library?${params.toString()}`);
      const json = (await res.json()) as AdLibraryApiResponse;
      return json;
    },
    [primaryTerms, appName, countryCode],
  );

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      setApiError(null);
      setAds([]);
      setNextAfter(null);
      try {
        const json = await fetchPage();
        if (cancelled) return;
        setConfigured(json.configured);
        setApiError(json.error);
        setAds(json.ads ?? []);
        setNextAfter(json.paging?.cursors?.after ?? null);
      } catch (e) {
        if (!cancelled) {
          setApiError(e instanceof Error ? e.message : "Erreur réseau");
          setAds([]);
          setNextAfter(null);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [fetchPage]);

  async function handleLoadMore() {
    if (!nextAfter || loadingMore) return;
    setLoadingMore(true);
    try {
      const json = await fetchPage(nextAfter);
      setApiError(json.error);
      setAds((prev) => [...prev, ...(json.ads ?? [])]);
      setNextAfter(json.paging?.cursors?.after ?? null);
    } catch (e) {
      setApiError(e instanceof Error ? e.message : "Erreur réseau");
    } finally {
      setLoadingMore(false);
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-xs text-white/50">
            Meta Ad Library — recherche{" "}
            <span className="font-semibold text-white/85">{primaryTerms || appName}</span>
            {countryCode ? (
              <span className="text-white/35"> · pays {countryCode.toUpperCase()}</span>
            ) : null}
          </p>
          <p className="mt-0.5 text-[11px] text-white/30">
            Données Graph API <code className="rounded bg-white/[0.06] px-1 text-[10px]">ads_archive</code> — créatives
            publiques
          </p>
        </div>
        <a
          href={metaLibraryWebUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="shrink-0 rounded-xl border border-white/15 bg-white/[0.08] px-4 py-2 text-xs font-semibold text-white/85 transition hover:bg-white/[0.12]"
        >
          Ouvrir sur facebook.com ↗
        </a>
      </div>

      {!configured && (
        <div className="rounded-xl border border-amber-400/25 bg-amber-400/10 px-4 py-3 text-[13px] text-amber-100/90">
          <p className="font-semibold">Token Meta non configuré</p>
          <p className="mt-1 text-[12px] text-amber-100/75">
            Ajoute <code className="rounded bg-black/20 px-1">META_AD_LIBRARY_ACCESS_TOKEN</code> dans les variables
            d&apos;environnement (Vercel + locale). Crée une app sur{" "}
            <a
              href="https://developers.facebook.com/apps/"
              target="_blank"
              rel="noopener noreferrer"
              className="underline"
            >
              developers.facebook.com
            </a>{" "}
            et active l&apos;accès{" "}
            <a
              href="https://www.facebook.com/ads/library/api/"
              target="_blank"
              rel="noopener noreferrer"
              className="underline"
            >
              Ad Library API
            </a>
            .
          </p>
        </div>
      )}

      {apiError && configured && (
        <div className="rounded-xl border border-red-400/25 bg-red-500/10 px-4 py-3 text-[12px] text-red-100/90">
          <span className="font-semibold">Meta API</span> — {apiError}
        </div>
      )}

      <div className="overflow-hidden rounded-2xl border border-white/[0.06] bg-white/[0.02]">
        <div className="flex flex-wrap items-center gap-3 border-b border-white/[0.06] p-4">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/10 text-white/80">
            <svg viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4" aria-hidden>
              <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
            </svg>
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-xs font-semibold text-white/90">Créatives actives</p>
            <p className="text-[11px] text-white/35">
              {loading ? "Chargement…" : `${ads.length} résultat${ads.length > 1 ? "s" : ""} affiché${ads.length > 1 ? "s" : ""}`}
            </p>
          </div>
        </div>

        <div className="p-4">
          {loading ? (
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <div
                  key={i}
                  className="h-48 animate-pulse rounded-xl border border-white/[0.05] bg-white/[0.04]"
                />
              ))}
            </div>
          ) : ads.length === 0 ? (
            <div className="rounded-xl border border-white/[0.06] bg-black/40 px-4 py-10 text-center">
              <p className="text-sm text-white/55">Aucune pub trouvée pour cette recherche.</p>
              <p className="mt-2 text-[12px] text-white/35">
                Essaie la bibliothèque web Meta ou vérifie le nom du développeur / les pays ciblés.
              </p>
              <a
                href={metaLibraryWebUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-4 inline-flex rounded-lg border border-white/15 bg-white/[0.06] px-4 py-2 text-xs font-semibold text-white/75 hover:bg-white/[0.1]"
              >
                Ouvrir Meta Ad Library ↗
              </a>
            </div>
          ) : (
            <>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {ads.map((ad) => (
                  <article
                    key={ad.id}
                    className="flex flex-col rounded-xl border border-white/[0.07] bg-black/50 p-4 transition hover:border-white/[0.12]"
                  >
                    <div className="mb-2 flex flex-wrap items-start justify-between gap-2">
                      <p className="text-[13px] font-semibold leading-snug text-white/90">
                        {ad.page_name ?? "Page inconnue"}
                      </p>
                      <span className="shrink-0 rounded-md bg-white/[0.06] px-1.5 py-0.5 font-mono text-[9px] text-white/35">
                        {ad.id}
                      </span>
                    </div>

                    <div className="mb-3 flex flex-wrap gap-1">
                      {(ad.publisher_platforms ?? []).slice(0, 4).map((p) => (
                        <span
                          key={p}
                          className="rounded-full border border-white/10 bg-white/[0.05] px-2 py-0.5 text-[10px] font-medium text-white/55"
                        >
                          {labelPlatform(p)}
                        </span>
                      ))}
                    </div>

                    <p className="mb-3 flex-1 text-[12px] leading-relaxed text-white/45 line-clamp-5">
                      {excerptBodies(ad.ad_creative_bodies) || excerptBodies(ad.ad_creative_link_titles) || "—"}
                    </p>

                    <p className="mb-3 text-[10px] text-white/30">
                      Début diffusion · {formatMetaDate(ad.ad_delivery_start_time)}
                      {ad.ad_delivery_stop_time ? ` → ${formatMetaDate(ad.ad_delivery_stop_time)}` : ""}
                    </p>

                    {ad.ad_snapshot_url ? (
                      <a
                        href={ad.ad_snapshot_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mt-auto inline-flex items-center justify-center rounded-lg bg-white px-3 py-2 text-center text-[12px] font-semibold text-neutral-950 transition hover:bg-white/90"
                      >
                        Voir la créa complète ↗
                      </a>
                    ) : (
                      <span className="mt-auto text-[11px] text-white/25">Snapshot non disponible</span>
                    )}
                  </article>
                ))}
              </div>

              {nextAfter && (
                <div className="mt-4 flex justify-center">
                  <button
                    type="button"
                    onClick={() => void handleLoadMore()}
                    disabled={loadingMore}
                    className="rounded-xl border border-white/15 bg-white/[0.06] px-5 py-2.5 text-xs font-semibold text-white/80 transition hover:bg-white/[0.1] disabled:opacity-50"
                  >
                    {loadingMore ? "Chargement…" : "Charger plus"}
                  </button>
                </div>
              )}
            </>
          )}
        </div>

        <div className="border-t border-white/[0.06] px-4 py-3">
          <p className="text-[11px] text-white/35">
            Les snapshots ouvrent la visionneuse officielle Meta (images et vidéos). Respecte les{" "}
            <a
              href="https://www.facebook.com/terms.php"
              target="_blank"
              rel="noopener noreferrer"
              className="text-white/50 underline hover:text-white/70"
            >
              conditions d&apos;utilisation
            </a>{" "}
            Meta pour le stockage et l&apos;analyse des créatives.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        {[
          { icon: "🔗", label: "Graph API", tip: "Endpoint ads_archive — jeton serveur uniquement" },
          { icon: "🌍", label: "Pays", tip: `Filtre actuel : ${countryCode.toUpperCase()}` },
          { icon: "📋", label: "Page Meta", tip: "Nom affiché fourni par Meta pour chaque annonce" },
        ].map((item) => (
          <div key={item.label} className="flex items-center gap-3 rounded-xl border border-white/[0.06] bg-white/[0.02] p-3">
            <span className="text-xl">{item.icon}</span>
            <div>
              <p className="text-[11px] font-semibold text-white/70">{item.label}</p>
              <p className="text-[10px] text-white/35">{item.tip}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function TikTokAdsPanel({ appName }: { appName: string }) {
  const searchQuery = encodeURIComponent(appName);
  const tiktokUrl = `https://ads.tiktok.com/business/creativecenter/inspiration/topads/pc/en?search=${searchQuery}`;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs text-white/50">
            TikTok Creative Center pour <span className="font-semibold text-white/80">{appName}</span>
          </p>
          <p className="mt-0.5 text-[11px] text-white/30">
            Top ads, tendances créatives, performances estimées
          </p>
        </div>
        <a
          href={tiktokUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1.5 rounded-xl border border-white/10 bg-white/[0.06] px-4 py-2 text-xs font-semibold text-white/70 transition hover:bg-white/[0.1] hover:text-white"
        >
          TikTok Creative Center ↗
        </a>
      </div>

      <div className="overflow-hidden rounded-2xl border border-white/[0.06] bg-white/[0.02]">
        <div className="flex items-center gap-3 border-b border-white/[0.06] p-4">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/[0.06] text-white text-sm font-bold">
            T
          </div>
          <div>
            <p className="text-xs font-semibold text-white/80">TikTok Ads Intelligence</p>
            <p className="text-[11px] text-white/40">Top performing creatives — données TikTok Business</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 p-4 sm:grid-cols-4">
          {[
            { label: "In-Feed Ads", format: "9:16 · 15-60s", score: "98" },
            { label: "TopView", format: "9:16 · 5-60s", score: "95" },
            { label: "Branded Hashtag", format: "Challenge", score: null },
            { label: "Spark Ads", format: "Organique boosté", score: null },
          ].map((slot) => (
            <div
              key={slot.label}
              className="flex flex-col items-center justify-center gap-2 rounded-xl border border-white/[0.06] bg-white/[0.02] p-4 text-center"
            >
              {slot.score && (
                <span className="rounded-full bg-pink-400/10 px-2 py-0.5 text-[9px] font-bold text-pink-300">
                  Score {slot.score}
                </span>
              )}
              <div className="h-10 w-10 rounded-lg bg-white/[0.05] flex items-center justify-center text-xl">
                🎵
              </div>
              <div>
                <p className="text-[11px] font-medium text-white/70">{slot.label}</p>
                <p className="text-[10px] text-white/30">{slot.format}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="border-t border-white/[0.06] bg-white/[0.02] px-4 py-3">
          <p className="text-[11px] text-white/40">
            📌 Clique sur &quot;TikTok Creative Center&quot; pour voir les tops ads de la catégorie de <strong className="text-white/60">{appName}</strong>.
          </p>
        </div>
      </div>

      {/* Formats breakdown */}
      <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-4">
        <p className="mb-3 text-[10px] font-bold uppercase tracking-widest text-white/25">Formats recommandés pour apps mobiles</p>
        <div className="space-y-2">
          {[
            { format: "In-Feed Video", ratio: "9:16", duration: "15-30s", ctr: "Très élevé", color: "bg-pink-400" },
            { format: "Spark Ads (UGC)", ratio: "9:16", duration: "15-60s", ctr: "Élevé", color: "bg-violet-400" },
            { format: "TopView", ratio: "9:16", duration: "5-60s", ctr: "Maximum", color: "bg-white/40" },
            { format: "Collection Ads", ratio: "1:1 + 9:16", duration: "N/A", ctr: "Moyen", color: "bg-amber-400" },
          ].map((row) => (
            <div key={row.format} className="flex items-center gap-3">
              <div className={`h-2 w-2 rounded-full ${row.color}`} />
              <span className="w-40 text-xs text-white/70">{row.format}</span>
              <span className="w-12 text-[11px] font-mono text-white/40">{row.ratio}</span>
              <span className="w-16 text-[11px] text-white/40">{row.duration}</span>
              <span className="text-[11px] text-white/50">CTR {row.ctr}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function GoogleAdsPanel({ appName, bundleId }: { appName: string; bundleId: string }) {
  const googleUrl = `https://adstransparency.google.com/?region=anywhere&query=${encodeURIComponent(appName)}`;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs text-white/50">
            Google Ads Transparency Center pour <span className="font-semibold text-white/80">{appName}</span>
          </p>
          <p className="mt-0.5 text-[11px] text-white/30">
            Universal App Campaigns (UAC), Search, Display, YouTube
          </p>
        </div>
        <a
          href={googleUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1.5 rounded-xl border border-red-400/20 bg-red-400/10 px-4 py-2 text-xs font-semibold text-red-300 transition hover:bg-red-400/20"
        >
          Google Transparency ↗
        </a>
      </div>

      <div className="overflow-hidden rounded-2xl border border-white/[0.06] bg-white/[0.02]">
        <div className="flex items-center gap-3 border-b border-white/[0.06] p-4">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-red-500/10 text-lg">
            🔴
          </div>
          <div>
            <p className="text-xs font-semibold text-white/80">Google UAC Intelligence</p>
            <p className="text-[11px] text-white/40">Search, Play Store, YouTube, Display Network</p>
          </div>
          {bundleId && (
            <span className="ml-auto rounded-full bg-white/[0.05] px-2 py-0.5 text-[10px] font-mono text-white/30">
              {bundleId.slice(0, 30)}{bundleId.length > 30 ? "…" : ""}
            </span>
          )}
        </div>

        <div className="grid grid-cols-2 gap-3 p-4 sm:grid-cols-4">
          {[
            { label: "Google Play", format: "Store listing", icon: "📱" },
            { label: "YouTube Ads", format: "Pre-roll 6-30s", icon: "▶️" },
            { label: "Display", format: "Banner / Interstitiel", icon: "🖼" },
            { label: "Search Ads", format: "Texte sponsorisé", icon: "🔍" },
          ].map((slot) => (
            <div
              key={slot.label}
              className="flex flex-col items-center justify-center gap-2 rounded-xl border border-white/[0.06] bg-white/[0.02] p-4 text-center"
            >
              <span className="text-2xl">{slot.icon}</span>
              <div>
                <p className="text-[11px] font-medium text-white/70">{slot.label}</p>
                <p className="text-[10px] text-white/30">{slot.format}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export function AppAds({
  appName,
  developerName,
  bundleId,
  countryCode = "US",
}: {
  appName: string;
  developerName: string;
  bundleId: string;
  /** Code pays App Store (ex. `us`, `fr`) — aligné sur la requête tracker pour filtrer les pubs par pays atteint */
  countryCode?: string;
}) {
  const [platform, setPlatform] = useState<Platform>("meta");
  const metaCountry = (countryCode || "US").trim() || "US";

  return (
    <div className="space-y-5">
      {/* Platform tabs */}
      <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
        {PLATFORMS.map((p) => (
          <button
            key={p.id}
            onClick={() => setPlatform(p.id)}
            className={`flex shrink-0 items-center gap-2 rounded-xl border px-4 py-2 text-xs font-semibold transition ${
              platform === p.id
                ? "border-white/20 bg-white/10 text-white"
                : "border-white/[0.06] bg-white/[0.02] text-white/45 hover:border-white/15 hover:text-white/80"
            }`}
          >
            <span>{p.icon}</span>
            {p.label}
          </button>
        ))}
      </div>

      {/* Panel content */}
      {platform === "meta" && (
        <MetaAdsPanel developerName={developerName} appName={appName} countryCode={metaCountry} />
      )}
      {platform === "tiktok" && (
        <TikTokAdsPanel appName={appName} />
      )}
      {platform === "google" && (
        <GoogleAdsPanel appName={appName} bundleId={bundleId} />
      )}

      {/* Attribution disclaimer */}
      <p className="text-[11px] text-white/20">
        Meta : créatives via Graph API <code className="text-white/25">ads_archive</code> (jeton serveur). TikTok /
        Google : liens vers les centres publics respectifs. Aucune donnée privée collectée côté tracker.
      </p>
    </div>
  );
}
