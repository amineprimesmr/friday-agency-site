"use client";

import { useEffect, useState } from "react";

import { abortInFlightRequest, isAbortError } from "@/lib/abort-signal";
import type {
  InstagramOrganicContentResult,
  InstagramOrganicMediaType,
  InstagramOrganicPost,
} from "@/lib/instagram-organic-content";

type InstagramSortKey = "views" | "likes" | "comments" | "recent" | "engagement";
type InstagramTypeFilter = "all" | InstagramOrganicMediaType;

const SORT_OPTIONS: Array<{ key: InstagramSortKey; label: string }> = [
  { key: "views", label: "Vues" },
  { key: "likes", label: "Likes" },
  { key: "comments", label: "Commentaires" },
  { key: "recent", label: "Récentes" },
  { key: "engagement", label: "Engagement" },
];

const TYPE_OPTIONS: Array<{ key: InstagramTypeFilter; label: string }> = [
  { key: "all", label: "Tout" },
  { key: "reel", label: "Reels" },
  { key: "image", label: "Images" },
  { key: "carousel", label: "Carrousels" },
  { key: "video", label: "Vidéos" },
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

function typeLabel(type: InstagramOrganicMediaType): string {
  switch (type) {
    case "reel":
      return "Reel";
    case "video":
      return "Vidéo";
    case "image":
      return "Image";
    case "carousel":
      return "Carousel";
    default:
      return "Post";
  }
}

function engagementRate(post: InstagramOrganicPost): number | null {
  if (!post.views || post.views <= 0) return null;
  const interactions = (post.likes ?? 0) + (post.comments ?? 0);
  return interactions / post.views;
}

function metricValue(post: InstagramOrganicPost, sort: InstagramSortKey): number {
  switch (sort) {
    case "likes":
      return post.likes ?? 0;
    case "comments":
      return post.comments ?? 0;
    case "recent":
      return Date.parse(post.publishedAt ?? "") || 0;
    case "engagement":
      return engagementRate(post) ?? 0;
    case "views":
    default:
      return post.views ?? 0;
  }
}

function postMatchesQuery(post: InstagramOrganicPost, q: string): boolean {
  const term = q.trim().toLowerCase();
  if (!term) return true;
  const haystack = [
    post.caption,
    post.musicTitle ?? "",
    ...post.hashtags.map((tag) => `#${tag}`),
    ...post.mentions.map((mention) => `@${mention}`),
    ...post.hashtags,
    ...post.mentions,
  ]
    .join(" ")
    .toLowerCase();
  return haystack.includes(term);
}

function stat(label: string, value: string) {
  return (
    <span className="rounded-2xl border border-white/15 bg-white/12 px-3 py-2">
      <span className="block text-[0.66rem] font-bold uppercase tracking-[0.12em] text-white/55">{label}</span>
      <span className="mt-0.5 block text-[0.88rem] font-black tabular-nums text-white">{value}</span>
    </span>
  );
}

function proxiedMediaUrl(src: string): string {
  return `/api/trackapp/media-proxy?url=${encodeURIComponent(src)}`;
}

function PostCover({ src, label }: { src: string | null; label: string }) {
  const [failed, setFailed] = useState(false);
  if (!src || failed) {
    return (
      <div className="grid h-full w-full place-items-center bg-gradient-to-br from-fuchsia-700 via-pink-600 to-orange-400 text-white/70">
        {label}
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

function PostCard({ post, rank }: { post: InstagramOrganicPost; rank: number }) {
  const er = engagementRate(post);

  return (
    <article className="flex h-full flex-col overflow-hidden rounded-[18px] border border-[var(--dash-border)] bg-white shadow-[var(--dash-shadow)]">
      <a
        href={post.url}
        target="_blank"
        rel="noopener noreferrer"
        className="relative block h-44 overflow-hidden bg-slate-950 no-underline sm:h-48 lg:h-52"
      >
        <PostCover src={post.thumbnailUrl} label="Instagram" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/72 via-black/10 to-transparent" />
        <span className="absolute left-3 top-3 rounded-full bg-black/60 px-2.5 py-1 text-[0.7rem] font-black text-white">
          #{rank}
        </span>
        <span className="absolute right-3 top-3 rounded-full bg-white px-2.5 py-1 text-[0.7rem] font-black text-slate-950">
          {typeLabel(post.mediaType)}
        </span>
        <span className="absolute bottom-2.5 left-2.5 right-2.5 flex items-center justify-between gap-2">
          <span className="rounded-full bg-white px-2 py-0.5 text-[0.68rem] font-black text-slate-950">
            Voir sur Instagram
          </span>
          <span className="rounded-full bg-black/55 px-2 py-0.5 text-[0.68rem] font-bold text-white">
            {compactNumber(post.views)} vues
          </span>
        </span>
      </a>

      <div className="flex flex-1 flex-col gap-2.5 p-3">
        <p className="line-clamp-2 text-[0.78rem] leading-snug text-[var(--dash-text)]">
          {post.caption || "Sans description"}
        </p>
        {post.hashtags.length > 0 ? (
          <div className="flex flex-wrap gap-1.5">
            {post.hashtags.slice(0, 4).map((tag) => (
              <span key={tag} className="rounded-full bg-fuchsia-50 px-2 py-0.5 text-[0.68rem] font-semibold text-fuchsia-700">
                #{tag}
              </span>
            ))}
          </div>
        ) : null}
        <div className="mt-auto grid grid-cols-2 gap-1.5 text-[0.68rem]">
          <span className="rounded-lg bg-slate-50 px-2 py-1.5 font-bold text-slate-700">
            Likes {compactNumber(post.likes)}
          </span>
          <span className="rounded-lg bg-slate-50 px-2 py-1.5 font-bold text-slate-700">
            Com. {compactNumber(post.comments)}
          </span>
          <span className="rounded-lg bg-slate-50 px-2 py-1.5 font-bold text-slate-700">
            Vues {compactNumber(post.views)}
          </span>
          <span className="rounded-lg bg-slate-50 px-2 py-1.5 font-bold text-slate-700">
            ER {er === null ? "—" : `${(er * 100).toFixed(1)}%`}
          </span>
        </div>
        <p className="text-[0.72rem] font-medium text-[var(--dash-muted-light)]">{formatDate(post.publishedAt)}</p>
      </div>
    </article>
  );
}

export function TrackappInstagramOrganicGallery({
  profileUrl,
}: Readonly<{
  profileUrl: string | null;
}>) {
  const [result, setResult] = useState<InstagramOrganicContentResult | null>(null);
  const [loading, setLoading] = useState(Boolean(profileUrl));
  const [sort, setSort] = useState<InstagramSortKey>("views");
  const [query, setQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState<InstagramTypeFilter>("all");
  const [showAll, setShowAll] = useState(false);

  useEffect(() => {
    if (!profileUrl) return undefined;
    const ac = new AbortController();
    setLoading(true);
    setResult(null);

    void (async () => {
      try {
        const res = await fetch(`/api/trackapp/instagram-organic?url=${encodeURIComponent(profileUrl)}&limit=12`, {
          signal: ac.signal,
          cache: "no-store",
        });
        const data = (await res.json()) as InstagramOrganicContentResult;
        if (!ac.signal.aborted) setResult(data);
      } catch (e) {
        if (isAbortError(e) || ac.signal.aborted) return;
        setResult({
          ok: false,
          configured: true,
          profileUrl,
          profile: null,
          posts: [],
          source: "error",
          error: "Impossible de charger Instagram pour l’instant.",
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
        <div className="overflow-hidden rounded-[26px] border border-fuchsia-100 bg-gradient-to-br from-fuchsia-700 via-pink-600 to-orange-400 p-5 text-white shadow-[var(--dash-shadow-lg)] sm:p-6">
          <p className="m-0 text-[0.72rem] font-black uppercase tracking-[0.18em] text-white/55">Instagram organique</p>
          <h4 className="mt-1 text-[1.25rem] font-black tracking-tight">Collecte des posts et Reels...</h4>
          <div className="mt-5 grid gap-3 sm:grid-cols-3">
            {Array.from({ length: 3 }, (_, i) => (
              <div key={i} className="h-48 animate-pulse rounded-[22px] bg-white/15" />
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (!result?.profileUrl) return null;

  const profile = result.profile;
  const filteredPosts = result.posts
    .filter((post) => typeFilter === "all" || post.mediaType === typeFilter)
    .filter((post) => postMatchesQuery(post, query))
    .sort((a, b) => metricValue(b, sort) - metricValue(a, sort));
  const visiblePosts = showAll ? filteredPosts : filteredPosts.slice(0, 8);
  const sortedPosts = [...result.posts].sort((a, b) => (b.views ?? 0) - (a.views ?? 0));
  const topPost = sortedPosts[0];
  const topViews = topPost?.views ?? null;
  const totalViews = result.posts.reduce((sum, post) => sum + (post.views ?? 0), 0);
  const reelsCount = result.posts.filter((post) => post.mediaType === "reel").length;

  return (
    <section className="mt-8 border-t border-[var(--dash-border)] pt-8">
      <div className="overflow-hidden rounded-[28px] border border-[var(--dash-border)] bg-white shadow-[var(--dash-shadow-lg)]">
        <div className="bg-gradient-to-br from-fuchsia-700 via-pink-600 to-orange-400 p-4 text-white sm:p-5">
          <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="flex min-w-0 items-center gap-4">
            <div className="grid h-12 w-12 shrink-0 place-items-center overflow-hidden rounded-2xl bg-white/15 ring-1 ring-white/20">
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
                <span className="text-xl font-black">IG</span>
              )}
            </div>
            <div className="min-w-0">
              <p className="m-0 text-[0.72rem] font-black uppercase tracking-[0.18em] text-white/55">Instagram organique</p>
              <h4 className="mt-1 truncate text-[1.25rem] font-black tracking-tight text-white">
                {profile?.displayName || profile?.handle || "Compte Instagram"}
                {profile?.verified ? <span className="ml-2 text-sky-100">✓</span> : null}
              </h4>
              <p className="mt-1 truncate text-[0.84rem] text-white/70">{profile?.handle ?? result.profileUrl}</p>
            </div>
          </div>
          <a
            href={result.profileUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex min-h-9 items-center justify-center rounded-full bg-white px-4 text-[0.78rem] font-black text-slate-950 no-underline transition hover:bg-white/90"
          >
            Ouvrir Instagram ↗
          </a>
          </div>
        <div className="mt-4 grid gap-2 sm:grid-cols-4">
          {stat("Followers", compactNumber(profile?.followers ?? null))}
          {stat("Posts profil", compactNumber(profile?.postsCount ?? null))}
          {stat("Reels affichés", compactNumber(reelsCount || null))}
          {stat("Top vues", compactNumber(topViews ?? (totalViews || null)))}
        </div>
      </div>

      {!result.configured ? (
        <div className="mx-4 mt-4 rounded-2xl border border-dashed border-amber-200 bg-amber-50 px-4 py-4 text-[0.88rem] leading-relaxed text-amber-950">
          <strong className="font-bold">Apify non configuré.</strong> Ajoute{" "}
          <code className="rounded bg-amber-100 px-1 text-[0.8rem]">APIFY_TOKEN</code> puis, optionnellement,{" "}
          <code className="rounded bg-amber-100 px-1 text-[0.8rem]">APIFY_INSTAGRAM_ACTOR_ID</code>. Actor conseillé :{" "}
          <code className="rounded bg-amber-100 px-1 text-[0.8rem]">instagram-scraper/instagram-profile-posts-scraper</code>.
        </div>
      ) : null}

      {result.configured && !result.ok ? (
        <div className="mx-4 mt-4 rounded-2xl border border-dashed border-rose-200 bg-rose-50 px-4 py-4 text-[0.88rem] leading-relaxed text-rose-950">
          <strong className="font-bold">Collecte Instagram indisponible.</strong> {result.error}
        </div>
      ) : null}

      {result.ok && result.posts.length === 0 ? (
        <div className="mx-4 mt-4 rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-4 py-8 text-center text-[0.88rem] text-slate-600">
          {result.error ?? "Compte trouvé, mais aucun post exploitable n’a été retourné par Apify pour l’instant."}
        </div>
      ) : null}

      {result.ok && result.posts.length > 0 ? (
        <div className="p-4 sm:p-5">
          <div className="mb-4 rounded-[22px] border border-slate-200 bg-slate-50/70 p-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <p className="m-0 text-[0.72rem] font-bold uppercase tracking-[0.14em] text-slate-400">
                Bibliothèque Instagram
              </p>
              <div className="flex items-center gap-2">
                <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-[0.72rem] font-bold text-slate-600">
                  {filteredPosts.length}/{result.posts.length} contenus
                </span>
                {filteredPosts.length > 8 ? (
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
                <span className="sr-only">Rechercher dans les captions Instagram</span>
                <input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Filtrer par caption, hashtag, mention, musique..."
                  className="h-11 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 text-[0.9rem] font-medium text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-fuchsia-200 focus:bg-white"
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
                        ? "bg-fuchsia-700 text-white shadow-sm"
                        : "border border-slate-200 bg-slate-50 text-slate-600 hover:bg-white",
                    ].join(" ")}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="mt-3 flex flex-wrap gap-2">
              {TYPE_OPTIONS.map((option) => (
                <button
                  key={option.key}
                  type="button"
                  onClick={() => setTypeFilter(option.key)}
                  className={[
                    "h-9 rounded-full px-3 text-[0.75rem] font-black transition",
                    typeFilter === option.key
                      ? "bg-slate-950 text-white shadow-sm"
                      : "border border-slate-200 bg-white text-slate-600 hover:bg-slate-50",
                  ].join(" ")}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>

          {visiblePosts.length > 0 ? (
            <div className="max-w-full overflow-hidden">
              <ul className="m-0 flex list-none gap-3 overflow-x-auto overscroll-x-contain p-0 pb-3 [scrollbar-gutter:stable]">
              {visiblePosts.map((post, i) => (
                <li key={post.id} className="w-[230px] shrink-0 sm:w-[240px]">
                  <PostCard post={post} rank={i + 1} />
                </li>
              ))}
            </ul>
            </div>
          ) : (
            <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-4 py-8 text-center text-[0.88rem] text-slate-600">
              Aucun contenu Instagram ne correspond à ce filtre.
            </div>
          )}
        </div>
      ) : null}
      </div>
    </section>
  );
}
