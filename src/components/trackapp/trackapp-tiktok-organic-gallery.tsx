"use client";

import { useEffect, useState } from "react";

import { abortInFlightRequest, isAbortError } from "@/lib/abort-signal";
import type { TikTokOrganicContentResult, TikTokOrganicVideo } from "@/lib/tiktok-organic-content";

type TikTokSortKey = "views" | "likes" | "comments" | "shares" | "recent" | "engagement";

const SORT_OPTIONS: Array<{ key: TikTokSortKey; label: string }> = [
  { key: "views", label: "Vues" },
  { key: "likes", label: "Likes" },
  { key: "comments", label: "Commentaires" },
  { key: "shares", label: "Partages" },
  { key: "recent", label: "Récentes" },
  { key: "engagement", label: "Engagement" },
];

function compactNumber(value: number | null): string {
  if (typeof value !== "number" || !Number.isFinite(value)) return "—";
  return new Intl.NumberFormat("fr-FR", {
    notation: "compact",
    maximumFractionDigits: value >= 10_000 ? 1 : 0,
  }).format(value);
}

function formatDate(raw: string | null): string {
  if (!raw) return "date inconnue";
  const d = new Date(raw);
  if (Number.isNaN(d.getTime())) return "date inconnue";
  return d.toLocaleDateString("fr-FR", { day: "numeric", month: "short", year: "numeric" });
}

function engagementRate(video: TikTokOrganicVideo): number | null {
  if (!video.views || video.views <= 0) return null;
  const interactions = (video.likes ?? 0) + (video.comments ?? 0) + (video.shares ?? 0);
  return interactions / video.views;
}

function metricValue(video: TikTokOrganicVideo, sort: TikTokSortKey): number {
  switch (sort) {
    case "likes":
      return video.likes ?? 0;
    case "comments":
      return video.comments ?? 0;
    case "shares":
      return video.shares ?? 0;
    case "recent":
      return Date.parse(video.publishedAt ?? "") || 0;
    case "engagement":
      return engagementRate(video) ?? 0;
    case "views":
    default:
      return video.views ?? 0;
  }
}

function videoMatchesQuery(video: TikTokOrganicVideo, q: string): boolean {
  const term = q.trim().toLowerCase();
  if (!term) return true;
  const haystack = [
    video.caption,
    video.musicTitle ?? "",
    ...video.hashtags.map((tag) => `#${tag}`),
    ...video.hashtags,
  ]
    .join(" ")
    .toLowerCase();
  return haystack.includes(term);
}

function stat(label: string, value: string) {
  return (
    <span className="rounded-2xl border border-white/15 bg-white/10 px-3 py-2">
      <span className="block text-[0.66rem] font-bold uppercase tracking-[0.12em] text-white/45">{label}</span>
      <span className="mt-0.5 block text-[0.88rem] font-black tabular-nums text-white">{value}</span>
    </span>
  );
}

function proxiedMediaUrl(src: string): string {
  return `/api/trackapp/media-proxy?url=${encodeURIComponent(src)}`;
}

function VideoCover({ src }: { src: string | null }) {
  const [failed, setFailed] = useState(false);
  if (!src || failed) {
    return (
      <div className="grid h-full w-full place-items-center bg-gradient-to-br from-slate-950 via-slate-900 to-black text-white/45">
        TikTok
      </div>
    );
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={proxiedMediaUrl(src)}
      alt=""
      className="h-full w-full object-cover"
      loading="eager"
      decoding="async"
      onError={() => setFailed(true)}
    />
  );
}

function VideoCard({ video, rank }: { video: TikTokOrganicVideo; rank: number }) {
  const er = engagementRate(video);

  return (
    <article className="flex h-full flex-col overflow-hidden rounded-[18px] border border-[var(--dash-border)] bg-white shadow-[var(--dash-shadow)]">
      <a
        href={video.url}
        target="_blank"
        rel="noopener noreferrer"
        className="relative block h-52 overflow-hidden bg-slate-950 no-underline sm:h-56 lg:h-60"
      >
        <VideoCover src={video.thumbnailUrl} />
        <div className="absolute inset-0 bg-gradient-to-t from-black/72 via-black/10 to-transparent" />
        <span className="absolute left-3 top-3 rounded-full bg-black/60 px-2.5 py-1 text-[0.7rem] font-black text-white">
          #{rank}
        </span>
        <span className="absolute bottom-2.5 left-2.5 right-2.5 flex items-center justify-between gap-2">
          <span className="rounded-full bg-white px-2 py-0.5 text-[0.68rem] font-black text-slate-950">Voir sur TikTok</span>
          <span className="rounded-full bg-black/55 px-2 py-0.5 text-[0.68rem] font-bold text-white">
            {compactNumber(video.views)} vues
          </span>
        </span>
      </a>

      <div className="flex flex-1 flex-col gap-2.5 p-3">
        <p className="line-clamp-2 text-[0.78rem] leading-snug text-[var(--dash-text)]">
          {video.caption || "Sans description"}
        </p>
        {video.hashtags.length > 0 ? (
          <div className="flex flex-wrap gap-1.5">
            {video.hashtags.slice(0, 4).map((tag) => (
              <span key={tag} className="rounded-full bg-slate-100 px-2 py-0.5 text-[0.68rem] font-semibold text-slate-600">
                #{tag}
              </span>
            ))}
          </div>
        ) : null}
        <div className="mt-auto grid grid-cols-2 gap-1.5 text-[0.68rem]">
          <span className="rounded-lg bg-slate-50 px-2 py-1.5 font-bold text-slate-700">Likes {compactNumber(video.likes)}</span>
          <span className="rounded-lg bg-slate-50 px-2 py-1.5 font-bold text-slate-700">Com. {compactNumber(video.comments)}</span>
          <span className="rounded-lg bg-slate-50 px-2 py-1.5 font-bold text-slate-700">Shares {compactNumber(video.shares)}</span>
          <span className="rounded-lg bg-slate-50 px-2 py-1.5 font-bold text-slate-700">
            ER {er === null ? "—" : `${(er * 100).toFixed(1)}%`}
          </span>
        </div>
        <p className="text-[0.72rem] font-medium text-[var(--dash-muted-light)]">{formatDate(video.publishedAt)}</p>
      </div>
    </article>
  );
}

export function TrackappTikTokOrganicGallery({
  profileUrl,
}: Readonly<{
  profileUrl: string | null;
}>) {
  const [result, setResult] = useState<TikTokOrganicContentResult | null>(null);
  const [loading, setLoading] = useState(Boolean(profileUrl));
  const [sort, setSort] = useState<TikTokSortKey>("views");
  const [query, setQuery] = useState("");
  const [showAll, setShowAll] = useState(false);

  useEffect(() => {
    if (!profileUrl) return undefined;
    const ac = new AbortController();
    setLoading(true);
    setResult(null);

    void (async () => {
      try {
        const res = await fetch(`/api/trackapp/tiktok-organic?url=${encodeURIComponent(profileUrl)}&limit=24`, {
          signal: ac.signal,
          cache: "no-store",
        });
        const data = (await res.json()) as TikTokOrganicContentResult;
        if (!ac.signal.aborted) setResult(data);
      } catch (e) {
        if (isAbortError(e) || ac.signal.aborted) return;
        setResult({
          ok: false,
          configured: true,
          profileUrl,
          profile: null,
          videos: [],
          source: "error",
          error: "Impossible de charger TikTok pour l’instant.",
        });
      } finally {
        if (!ac.signal.aborted) setLoading(false);
      }
    })().catch(() => undefined);

    return () => abortInFlightRequest(ac);
  }, [profileUrl]);

  if (!profileUrl) return null;

  if (loading && !result) {
    return (
      <section className="mt-8 border-t border-[var(--dash-border)] pt-8">
        <div className="overflow-hidden rounded-[26px] border border-slate-200 bg-gradient-to-br from-slate-950 via-slate-900 to-black p-5 text-white shadow-[var(--dash-shadow-lg)] sm:p-6">
          <p className="m-0 text-[0.72rem] font-black uppercase tracking-[0.18em] text-white/45">TikTok organique</p>
          <h4 className="mt-1 text-[1.25rem] font-black tracking-tight">Collecte des vidéos...</h4>
          <div className="mt-5 grid gap-3 sm:grid-cols-3">
            {Array.from({ length: 3 }, (_, i) => (
              <div key={i} className="h-48 animate-pulse rounded-[22px] bg-white/10" />
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (!result?.profileUrl) return null;

  const profile = result.profile;
  const filteredVideos = result.videos
    .filter((video) => videoMatchesQuery(video, query))
    .sort((a, b) => metricValue(b, sort) - metricValue(a, sort));
  const visibleVideos = showAll ? filteredVideos : filteredVideos.slice(0, 8);
  const sortedVideos = [...result.videos].sort((a, b) => (b.views ?? 0) - (a.views ?? 0));
  const topVideo = sortedVideos[0];
  const topViews = topVideo?.views ?? null;
  const totalViews = result.videos.reduce((sum, video) => sum + (video.views ?? 0), 0);

  return (
    <section className="mt-8 border-t border-[var(--dash-border)] pt-8">
      <div className="overflow-hidden rounded-[28px] border border-[var(--dash-border)] bg-white shadow-[var(--dash-shadow-lg)]">
        <div className="bg-gradient-to-br from-slate-950 via-slate-900 to-black p-4 text-white sm:p-5">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="flex min-w-0 items-center gap-4">
            <div className="grid h-12 w-12 shrink-0 place-items-center overflow-hidden rounded-2xl bg-white/10 ring-1 ring-white/10">
              {profile?.avatarUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={proxiedMediaUrl(profile.avatarUrl)}
                  alt=""
                  className="h-full w-full object-cover"
                  loading="eager"
                  decoding="async"
                />
              ) : (
                <span className="text-xl font-black">♪</span>
              )}
            </div>
            <div className="min-w-0">
              <p className="m-0 text-[0.72rem] font-black uppercase tracking-[0.18em] text-white/45">TikTok organique</p>
              <h4 className="mt-1 truncate text-[1.25rem] font-black tracking-tight text-white">
                {profile?.displayName || profile?.handle || "Compte TikTok"}
                {profile?.verified ? <span className="ml-2 text-sky-300">✓</span> : null}
              </h4>
              <p className="mt-1 truncate text-[0.84rem] text-white/55">{profile?.handle ?? result.profileUrl}</p>
            </div>
          </div>
          <a
            href={result.profileUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex min-h-9 items-center justify-center rounded-full bg-white px-4 text-[0.78rem] font-black text-slate-950 no-underline transition hover:bg-white/90"
          >
            Ouvrir TikTok ↗
          </a>
        </div>

        <div className="mt-4 grid gap-2 sm:grid-cols-4">
          {stat("Followers", compactNumber(profile?.followers ?? null))}
          {stat("Likes profil", compactNumber(profile?.likesTotal ?? null))}
          {stat("Top vidéo", compactNumber(topViews))}
          {stat("Vues affichées", compactNumber(totalViews || null))}
        </div>
      </div>

      {!result.configured ? (
        <div className="mx-4 mt-4 rounded-2xl border border-dashed border-amber-200 bg-amber-50 px-4 py-4 text-[0.88rem] leading-relaxed text-amber-950">
          <strong className="font-bold">Apify non configuré.</strong> Ajoute{" "}
          <code className="rounded bg-amber-100 px-1 text-[0.8rem]">APIFY_TOKEN</code> puis, optionnellement,{" "}
          <code className="rounded bg-amber-100 px-1 text-[0.8rem]">APIFY_TIKTOK_ACTOR_ID</code>. Actor conseillé :{" "}
          <code className="rounded bg-amber-100 px-1 text-[0.8rem]">andok/tiktok-intelligence</code>.
        </div>
      ) : null}

      {result.configured && !result.ok ? (
        <div className="mx-4 mt-4 rounded-2xl border border-dashed border-rose-200 bg-rose-50 px-4 py-4 text-[0.88rem] leading-relaxed text-rose-950">
          <strong className="font-bold">Collecte TikTok indisponible.</strong> {result.error}
        </div>
      ) : null}

      {result.ok && result.videos.length === 0 ? (
        <div className="mx-4 mt-4 rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-4 py-8 text-center text-[0.88rem] text-slate-600">
          Compte trouvé, mais aucune vidéo exploitable n’a été retournée par Apify pour l’instant.
        </div>
      ) : null}

      {result.ok && result.videos.length > 0 ? (
        <div className="p-4 sm:p-5">
          <div className="mb-4 rounded-[22px] border border-slate-200 bg-slate-50/70 p-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <p className="m-0 text-[0.72rem] font-bold uppercase tracking-[0.14em] text-slate-400">
                Bibliothèque TikTok
              </p>
              <div className="flex items-center gap-2">
                <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-[0.72rem] font-bold text-slate-600">
                  {filteredVideos.length}/{result.videos.length} vidéos
                </span>
                {filteredVideos.length > 8 ? (
                  <button
                    type="button"
                    onClick={() => setShowAll((value) => !value)}
                    className="inline-flex h-8 items-center rounded-full border border-slate-200 bg-white px-3 text-[0.72rem] font-black text-slate-700 shadow-sm transition hover:bg-slate-50"
                  >
                    {showAll ? "Réduire" : "Voir plus ↗"}
                  </button>
                ) : null}
              </div>
            </div>

            <div className="mt-3 grid gap-3 lg:grid-cols-[1fr_auto]">
              <label className="relative block">
                <span className="sr-only">Rechercher dans les captions TikTok</span>
                <input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Filtrer par caption, hashtag, musique..."
                  className="h-11 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 text-[0.9rem] font-medium text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-slate-300 focus:bg-white"
                />
              </label>

              <div className="flex flex-wrap gap-2">
                {SORT_OPTIONS.map((option) => (
                  <button
                    key={option.key}
                    type="button"
                    onClick={() => setSort(option.key)}
                    className={[
                      "h-11 rounded-2xl px-3 text-[0.78rem] font-black transition",
                      sort === option.key
                        ? "bg-slate-950 text-white shadow-sm"
                        : "border border-slate-200 bg-slate-50 text-slate-600 hover:bg-white",
                    ].join(" ")}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {visibleVideos.length > 0 ? (
            <div className="max-w-full overflow-hidden">
              <ul className="m-0 flex list-none gap-3 overflow-x-auto overscroll-x-contain p-0 pb-3 [scrollbar-gutter:stable]">
              {visibleVideos.map((video, i) => (
                <li key={video.id} className="w-[220px] shrink-0 sm:w-[230px]">
                  <VideoCard video={video} rank={i + 1} />
                </li>
              ))}
            </ul>
            </div>
          ) : (
            <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-4 py-8 text-center text-[0.88rem] text-slate-600">
              Aucune vidéo ne correspond à ce filtre.
            </div>
          )}
        </div>
      ) : null}
      </div>
    </section>
  );
}
