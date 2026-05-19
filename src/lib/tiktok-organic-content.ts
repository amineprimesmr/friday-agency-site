import { unstable_cache } from "next/cache";

export type TikTokOrganicProfile = {
  handle: string;
  displayName: string | null;
  profileUrl: string;
  avatarUrl: string | null;
  bio: string | null;
  followers: number | null;
  following: number | null;
  likesTotal: number | null;
  videosCount: number | null;
  verified: boolean | null;
};

export type TikTokOrganicVideo = {
  id: string;
  url: string;
  caption: string;
  thumbnailUrl: string | null;
  videoUrl: string | null;
  views: number | null;
  likes: number | null;
  comments: number | null;
  shares: number | null;
  publishedAt: string | null;
  durationSec: number | null;
  hashtags: string[];
  musicTitle: string | null;
};

export type TikTokOrganicContentResult = {
  ok: boolean;
  configured: boolean;
  profileUrl: string | null;
  profile: TikTokOrganicProfile | null;
  videos: TikTokOrganicVideo[];
  source: "apify" | "not_configured" | "not_found" | "error";
  error: string | null;
};

const DEFAULT_ACTOR_ID = "clockworks/tiktok-profile-scraper";
const FALLBACK_ACTOR_ID = "clockworks/tiktok-profile-scraper";
const DEFAULT_LIMIT = 24;

function configuredActorId(): string {
  return process.env.APIFY_TIKTOK_ACTOR_ID?.trim() || DEFAULT_ACTOR_ID;
}

export function isTikTokOrganicConfigured(): boolean {
  return Boolean(process.env.APIFY_TOKEN?.trim());
}

export function tiktokHandleFromUrl(raw: string | null | undefined): string | null {
  if (!raw) return null;
  try {
    const url = new URL(raw.trim());
    const host = url.hostname.replace(/^www\./i, "").toLowerCase();
    if (!host.endsWith("tiktok.com")) return null;
    const match = url.pathname.match(/@([^/?#]+)/);
    const handle = match?.[1]?.trim().replace(/^@/, "");
    return handle ? `@${handle}` : null;
  } catch {
    return null;
  }
}

export function tiktokProfileUrlFromHandle(handle: string): string {
  const h = handle.trim().replace(/^@/, "");
  return `https://www.tiktok.com/@${encodeURIComponent(h)}`;
}

function actorApiId(actorId: string): string {
  return actorId.trim().replace("/", "~");
}

function numberFromAny(value: unknown): number | null {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string") {
    const normalized = value.replace(/[,\s]/g, "");
    const n = Number(normalized);
    if (Number.isFinite(n)) return n;
  }
  return null;
}

function stringFromAny(value: unknown): string | null {
  return typeof value === "string" && value.trim() ? value.trim() : null;
}

function boolFromAny(value: unknown): boolean | null {
  return typeof value === "boolean" ? value : null;
}

function firstString(...values: unknown[]): string | null {
  for (const value of values) {
    const s = stringFromAny(value);
    if (s) return s;
  }
  return null;
}

function nestedString(value: unknown, key: string): string | null {
  if (!value || typeof value !== "object") return null;
  return stringFromAny((value as Record<string, unknown>)[key]);
}

function nestedNumber(value: unknown, key: string): number | null {
  if (!value || typeof value !== "object") return null;
  return numberFromAny((value as Record<string, unknown>)[key]);
}

function nestedBool(value: unknown, key: string): boolean | null {
  if (!value || typeof value !== "object") return null;
  return boolFromAny((value as Record<string, unknown>)[key]);
}

function firstArrayString(value: unknown): string | null {
  if (!Array.isArray(value)) return null;
  for (const item of value) {
    const s = stringFromAny(item);
    if (s) return s;
  }
  return null;
}

function parseDate(value: unknown): string | null {
  if (typeof value === "number" && Number.isFinite(value)) {
    const ms = value > 10_000_000_000 ? value : value * 1000;
    return new Date(ms).toISOString();
  }
  if (typeof value === "string" && value.trim()) {
    const asNumber = Number(value);
    if (Number.isFinite(asNumber)) return parseDate(asNumber);
    const d = new Date(value);
    if (!Number.isNaN(d.getTime())) return d.toISOString();
  }
  return null;
}

function hashtagsFromAny(value: unknown, caption: string): string[] {
  const fromArray = Array.isArray(value)
    ? value
        .map((x) => (typeof x === "string" ? x : stringFromAny((x as Record<string, unknown>)?.name)))
        .filter((x): x is string => Boolean(x))
    : [];
  const fromCaption = [...caption.matchAll(/#([\p{L}\p{N}_]+)/gu)].map((m) => m[1]!).filter(Boolean);
  return [...new Set([...fromArray, ...fromCaption])].slice(0, 12);
}

function normalizeVideo(raw: Record<string, unknown>, fallbackHandle: string): TikTokOrganicVideo | null {
  const id = firstString(raw.videoId, raw.video_id, raw.id, raw.aweme_id);
  const url =
    firstString(raw.videoUrl, raw.video_url, raw.url, raw.webVideoUrl) ??
    (id ? `${tiktokProfileUrlFromHandle(fallbackHandle)}/video/${id}` : null);
  if (!id || !url) return null;

  const caption = firstString(raw.text, raw.description, raw.desc, raw.caption) ?? "";
  return {
    id,
    url,
    caption,
    thumbnailUrl: firstString(
      raw.cover,
      raw.thumbnail,
      raw.thumbnailUrl,
      raw.dynamicCover,
      raw.originCover,
      nestedString(raw.videoMeta, "coverUrl"),
      nestedString(raw.videoMeta, "originalCoverUrl"),
    ),
    videoUrl: firstString(
      raw.play_url,
      raw.playUrl,
      raw.videoUrlNoWatermark,
      raw.downloadUrl,
      nestedString(raw.videoMeta, "downloadAddr"),
      nestedString(raw.videoMeta, "originalDownloadAddr"),
      firstArrayString(raw.mediaUrls),
    ),
    views: numberFromAny(raw.playCount ?? raw.views ?? raw.view_count),
    likes: numberFromAny(raw.diggCount ?? raw.likes ?? raw.like_count),
    comments: numberFromAny(raw.commentCount ?? raw.comments ?? raw.comment_count),
    shares: numberFromAny(raw.shareCount ?? raw.shares ?? raw.share_count),
    publishedAt: parseDate(raw.createTime ?? raw.create_time ?? raw.published_at ?? raw.createdAt),
    durationSec: numberFromAny(raw.duration ?? raw.durationSec ?? raw.videoDuration) ?? nestedNumber(raw.videoMeta, "duration"),
    hashtags: hashtagsFromAny(raw.hashtags, caption),
    musicTitle: firstString(raw.musicTitle, raw.music_title, nestedString(raw.music, "title"), nestedString(raw.musicMeta, "musicName")),
  };
}

function normalizeProfileFromItems(
  items: Record<string, unknown>[],
  handle: string,
  profileUrl: string,
): TikTokOrganicProfile | null {
  const profileItem = items.find((item) => item.type === "profile") ?? items[0];
  if (!profileItem) return null;

  const displayName = firstString(
    profileItem.nickname,
    profileItem.authorNickname,
    profileItem.displayName,
    nestedString(profileItem.authorMeta, "nickName"),
  );
  const extractedHandle =
    firstString(
      profileItem.username,
      profileItem.authorUniqueId,
      profileItem.author_username,
      nestedString(profileItem.authorMeta, "name"),
    )?.replace(/^@/, "") ??
    handle.replace(/^@/, "");

  return {
    handle: `@${extractedHandle}`,
    displayName,
    profileUrl,
    avatarUrl: firstString(profileItem.avatar, profileItem.avatarUrl, profileItem.authorAvatar, nestedString(profileItem.authorMeta, "avatar")),
    bio: firstString(profileItem.bio, profileItem.signature, nestedString(profileItem.authorMeta, "signature")),
    followers:
      numberFromAny(profileItem.followers ?? profileItem.authorFollowers ?? profileItem.follower_count) ??
      nestedNumber(profileItem.authorMeta, "fans"),
    following:
      numberFromAny(profileItem.following ?? profileItem.following_count) ??
      nestedNumber(profileItem.authorMeta, "following"),
    likesTotal:
      numberFromAny(profileItem.likes ?? profileItem.heartCount ?? profileItem.totalLikes) ??
      nestedNumber(profileItem.authorMeta, "heart"),
    videosCount:
      numberFromAny(profileItem.videos_count ?? profileItem.videoCount) ??
      nestedNumber(profileItem.authorMeta, "video"),
    verified: boolFromAny(profileItem.verified ?? profileItem.authorVerified) ?? nestedBool(profileItem.authorMeta, "verified"),
  };
}

async function runApifyTikTokActor(
  actorId: string,
  profileUrl: string,
  handle: string,
  limit: number,
): Promise<Record<string, unknown>[]> {
  const token = process.env.APIFY_TOKEN?.trim();
  if (!token) return [];

  const endpoint = new URL(`https://api.apify.com/v2/acts/${actorApiId(actorId)}/run-sync-get-dataset-items`);
  endpoint.searchParams.set("token", token);
  endpoint.searchParams.set("clean", "true");
  endpoint.searchParams.set("format", "json");
  endpoint.searchParams.set("timeout", "90");

  const cleanHandle = handle.replace(/^@/, "");
  const input = actorId.includes("clockworks/tiktok-profile-scraper") || actorId.includes("clockworks/tiktok-scraper")
    ? {
        profiles: [cleanHandle],
        profileScrapeSections: ["videos"],
        profileSorting: "latest",
        resultsPerPage: limit,
        excludePinnedPosts: false,
        shouldDownloadVideos: false,
        shouldDownloadCovers: false,
        shouldDownloadSlideshowImages: false,
        shouldDownloadSubtitles: false,
        maxFollowersPerProfile: 0,
        maxFollowingPerProfile: 0,
      }
    : actorId.includes("dltik/tiktok-scraper")
    ? {
        mode: "profiles",
        inputs: [handle],
        maxResultsPerInput: limit,
        includeComments: false,
      }
    : {
        urls: [profileUrl],
        maxItems: limit,
        timeoutSeconds: 20,
      };

  const res = await fetch(endpoint.toString(), {
    method: "POST",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify(input),
    signal: AbortSignal.timeout(58_000),
    cache: "no-store",
  });

  const json = (await res.json().catch(() => null)) as unknown;
  if (!res.ok || !Array.isArray(json)) return [];
  return json.filter((item): item is Record<string, unknown> => Boolean(item) && typeof item === "object");
}

export async function fetchTikTokOrganicContent(
  profileUrl: string | null | undefined,
  limit = DEFAULT_LIMIT,
): Promise<TikTokOrganicContentResult> {
  const handle = tiktokHandleFromUrl(profileUrl);
  if (!profileUrl || !handle) {
    return {
      ok: false,
      configured: isTikTokOrganicConfigured(),
      profileUrl: null,
      profile: null,
      videos: [],
      source: "not_found",
      error: "Aucun compte TikTok officiel validé pour cette app.",
    };
  }

  if (!isTikTokOrganicConfigured()) {
    return {
      ok: false,
      configured: false,
      profileUrl,
      profile: {
        handle,
        displayName: null,
        profileUrl,
        avatarUrl: null,
        bio: null,
        followers: null,
        following: null,
        likesTotal: null,
        videosCount: null,
        verified: null,
      },
      videos: [],
      source: "not_configured",
      error: "APIFY_TOKEN non configuré sur le serveur.",
    };
  }

  try {
    const configured = configuredActorId();
    let items = await runApifyTikTokActor(configured, profileUrl, handle, limit);
    let videos = items
      .map((item) => normalizeVideo(item, handle))
      .filter((video): video is TikTokOrganicVideo => video !== null)
      .sort((a, b) => (Date.parse(b.publishedAt ?? "") || 0) - (Date.parse(a.publishedAt ?? "") || 0))
      .slice(0, limit);

    if (videos.length === 0 && configured !== FALLBACK_ACTOR_ID) {
      items = await runApifyTikTokActor(FALLBACK_ACTOR_ID, profileUrl, handle, limit);
      videos = items
        .map((item) => normalizeVideo(item, handle))
        .filter((video): video is TikTokOrganicVideo => video !== null)
        .sort((a, b) => (Date.parse(b.publishedAt ?? "") || 0) - (Date.parse(a.publishedAt ?? "") || 0))
        .slice(0, limit);
    }

    return {
      ok: true,
      configured: true,
      profileUrl,
      profile: normalizeProfileFromItems(items, handle, profileUrl),
      videos,
      source: "apify",
      error: null,
    };
  } catch {
    return {
      ok: false,
      configured: true,
      profileUrl,
      profile: null,
      videos: [],
      source: "error",
      error: "Impossible de récupérer le contenu TikTok via Apify.",
    };
  }
}

export const fetchTikTokOrganicContentCached = (
  profileUrl: string | null | undefined,
  limit = DEFAULT_LIMIT,
) =>
  unstable_cache(
    async () => fetchTikTokOrganicContent(profileUrl, limit),
    [
      "tiktok-organic-content-v2-clockworks-fallback",
      profileUrl ?? "none",
      String(limit),
      configuredActorId(),
      isTikTokOrganicConfigured() ? "apify-on" : "apify-off",
    ],
    { revalidate: 60 * 60 * 12 },
  )();
