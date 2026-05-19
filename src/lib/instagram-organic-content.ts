import { unstable_cache } from "next/cache";

export type InstagramOrganicMediaType = "reel" | "video" | "image" | "carousel" | "unknown";

export type InstagramOrganicProfile = {
  handle: string;
  displayName: string | null;
  profileUrl: string;
  avatarUrl: string | null;
  bio: string | null;
  followers: number | null;
  following: number | null;
  postsCount: number | null;
  verified: boolean | null;
};

export type InstagramOrganicPost = {
  id: string;
  url: string;
  caption: string;
  mediaType: InstagramOrganicMediaType;
  thumbnailUrl: string | null;
  videoUrl: string | null;
  views: number | null;
  likes: number | null;
  comments: number | null;
  publishedAt: string | null;
  hashtags: string[];
  mentions: string[];
  musicTitle: string | null;
};

export type InstagramOrganicContentResult = {
  ok: boolean;
  configured: boolean;
  profileUrl: string | null;
  profile: InstagramOrganicProfile | null;
  posts: InstagramOrganicPost[];
  source: "apify" | "not_configured" | "not_found" | "error";
  error: string | null;
};

const DEFAULT_ACTOR_ID = "instagram-scraper/instagram-profile-posts-scraper";
const FALLBACK_ACTOR_ID = "headlessagent/instagram-profile-post-reel-scraper";
const DEFAULT_LIMIT = 12;
const APIFY_REQUEST_TIMEOUT_MS = 22_000;

function configuredActorId(): string {
  return process.env.APIFY_INSTAGRAM_ACTOR_ID?.trim() || DEFAULT_ACTOR_ID;
}

export function isInstagramOrganicConfigured(): boolean {
  return Boolean(process.env.APIFY_TOKEN?.trim());
}

export function instagramHandleFromUrl(raw: string | null | undefined): string | null {
  if (!raw) return null;
  try {
    const url = new URL(raw.trim());
    const host = url.hostname.replace(/^www\./i, "").toLowerCase();
    if (!host.endsWith("instagram.com")) return null;
    const segment = url.pathname.split("/").filter(Boolean)[0]?.trim();
    if (!segment || ["p", "reel", "reels", "stories", "explore", "tv"].includes(segment.toLowerCase())) return null;
    return segment.replace(/^@/, "") || null;
  } catch {
    const handle = raw.trim().replace(/^@/, "");
    return /^[a-z0-9._]{2,30}$/i.test(handle) ? handle : null;
  }
}

export function instagramProfileUrlFromHandle(handle: string): string {
  return `https://www.instagram.com/${encodeURIComponent(handle.replace(/^@/, ""))}/`;
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

function firstArrayObject(value: unknown): Record<string, unknown> | null {
  if (!Array.isArray(value)) return null;
  const item = value.find((x) => Boolean(x) && typeof x === "object");
  return item ? (item as Record<string, unknown>) : null;
}

function firstArrayString(value: unknown, key?: string): string | null {
  if (!Array.isArray(value)) return null;
  for (const item of value) {
    if (key && item && typeof item === "object") {
      const s = stringFromAny((item as Record<string, unknown>)[key]);
      if (s) return s;
    }
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

function tagsFromAny(value: unknown, caption: string, prefix: "#" | "@"): string[] {
  const fromArray = Array.isArray(value)
    ? value
        .map((x) => {
          if (typeof x === "string") return x.replace(prefix, "");
          if (!x || typeof x !== "object") return null;
          return stringFromAny((x as Record<string, unknown>).username ?? (x as Record<string, unknown>).name);
        })
        .filter((x): x is string => Boolean(x))
    : [];
  const regex = prefix === "#" ? /#([\p{L}\p{N}_]+)/gu : /@([\p{L}\p{N}._]+)/gu;
  const fromCaption = [...caption.matchAll(regex)].map((m) => m[1]!).filter(Boolean);
  return [...new Set([...fromArray, ...fromCaption].map((x) => x.replace(prefix, "")))].slice(0, 12);
}

function mediaTypeFromRaw(raw: Record<string, unknown>, url: string): InstagramOrganicMediaType {
  const product = firstString(raw.product_type, raw.productType, raw.type, raw.typename)?.toLowerCase() ?? "";
  if (product.includes("clips") || product.includes("reel") || url.includes("/reel/")) return "reel";
  if (product.includes("sidecar") || product.includes("carousel")) return "carousel";
  if (boolFromAny(raw.is_video ?? raw.isVideo) || firstString(raw.video_url, raw.videoUrl)) return "video";
  if (firstString(raw.image, raw.display_url, raw.displayUrl, raw.thumbnailUrl)) return "image";
  return "unknown";
}

function normalizeHandle(value: string | null | undefined): string | null {
  const normalized = value?.trim().replace(/^@/, "").toLowerCase();
  return normalized || null;
}

function ownerHandleFromItem(raw: Record<string, unknown>): string | null {
  return normalizeHandle(
    firstString(
      raw.username,
      raw.ownerUsername,
      raw.owner_username,
      nestedString(raw.owner, "username"),
      nestedString(raw.user, "username"),
    ),
  );
}

function instagramPathOwner(rawUrl: string): string | null {
  try {
    const url = new URL(rawUrl);
    const host = url.hostname.replace(/^www\./i, "").toLowerCase();
    if (!host.endsWith("instagram.com")) return null;
    const parts = url.pathname.split("/").filter(Boolean);
    const first = parts[0]?.toLowerCase();
    if (!first || ["p", "reel", "reels", "tv"].includes(first)) return null;
    if (["p", "reel", "reels", "tv"].includes(parts[1]?.toLowerCase() ?? "")) return first;
    return null;
  } catch {
    return null;
  }
}

function canonicalPostUrl(raw: Record<string, unknown>, type: InstagramOrganicMediaType, fallbackHandle: string): string | null {
  const shortcode = firstString(raw.shortcode, raw.code);
  if (shortcode) {
    const section = type === "reel" ? "reel" : "p";
    return `https://www.instagram.com/${section}/${encodeURIComponent(shortcode)}/`;
  }

  const rawUrl = firstString(raw.url, raw.post_url, raw.permalink, raw.link);
  if (!rawUrl) return null;
  if (!rawUrl.startsWith("http")) return `${instagramProfileUrlFromHandle(fallbackHandle)}${rawUrl.replace(/^\//, "")}`;

  const pathOwner = instagramPathOwner(rawUrl);
  if (pathOwner && pathOwner !== normalizeHandle(fallbackHandle)) return null;
  return rawUrl;
}

function normalizePost(raw: Record<string, unknown>, fallbackHandle: string): InstagramOrganicPost | null {
  const shortcode = firstString(raw.shortcode, raw.code);
  const id = firstString(raw.id, raw.pk, raw.media_id, shortcode);
  if (!id) return null;

  const rawUrl = firstString(raw.url, raw.post_url, raw.permalink, raw.link) ?? "";
  const firstMedia = firstArrayObject(raw.media_items ?? raw.mediaItems ?? raw.carousel_media);
  const caption = firstString(raw.caption, raw.text, raw.description, raw.title) ?? "";
  const type = mediaTypeFromRaw(raw, rawUrl);
  const url = canonicalPostUrl(raw, type, fallbackHandle);
  if (!url) return null;

  return {
    id,
    url,
    caption,
    mediaType: type,
    thumbnailUrl: firstString(
      raw.image,
      raw.display_url,
      raw.displayUrl,
      raw.thumbnail,
      raw.thumbnailUrl,
      raw.thumbnail_src,
      raw.cover,
      raw.video_thumbnail_url,
      nestedString(firstMedia, "image_url"),
      nestedString(firstMedia, "imageUrl"),
      nestedString(firstMedia, "display_url"),
    ),
    videoUrl: firstString(
      raw.video_url,
      raw.videoUrl,
      raw.video_url_no_watermark,
      nestedString(firstMedia, "video_url"),
      nestedString(firstMedia, "videoUrl"),
      firstArrayString(raw.video_versions, "url"),
    ),
    views:
      numberFromAny(raw.play_count ?? raw.playCount ?? raw.view_count ?? raw.viewCount ?? raw.video_view_count ?? raw.plays) ??
      null,
    likes: numberFromAny(raw.like_count ?? raw.likeCount ?? raw.likes),
    comments: numberFromAny(raw.comment_count ?? raw.commentCount ?? raw.comments_count ?? raw.comments),
    publishedAt: parseDate(raw.taken_at ?? raw.takenAt ?? raw.timestamp ?? raw.date ?? raw.createdAt),
    hashtags: tagsFromAny(raw.hashtags, caption, "#"),
    mentions: tagsFromAny(raw.mentions ?? raw.tagged_users ?? raw.tagged_user, caption, "@"),
    musicTitle: firstString(
      raw.musicTitle,
      nestedString(raw.audio_info, "song"),
      nestedString(raw.audioInfo, "song"),
      nestedString(raw.clips_music_attribution_info, "song_name"),
      nestedString(raw.music_info, "title"),
    ),
  };
}

function flattenPostItems(items: Record<string, unknown>[]): Record<string, unknown>[] {
  const posts: Record<string, unknown>[] = [];
  for (const item of items) {
    const nestedPosts = [
      ...(Array.isArray(item.timeline_posts) ? item.timeline_posts : []),
      ...(Array.isArray(item.igtv_posts) ? item.igtv_posts : []),
      ...(Array.isArray(item.posts) ? item.posts : []),
    ].filter((x): x is Record<string, unknown> => Boolean(x) && typeof x === "object");

    if (nestedPosts.length > 0) {
      const owner = item;
      posts.push(...nestedPosts.map((post) => ({ ...post, owner })));
      continue;
    }

    const type = stringFromAny(item.type)?.toLowerCase();
    if (!type || type === "post" || type === "reel" || item.shortcode || item.url || item.pk) {
      posts.push(item);
    }
  }
  return posts;
}

function profileMatchesHandle(item: Record<string, unknown>, handle: string): boolean {
  const expected = normalizeHandle(handle);
  const itemHandle = ownerHandleFromItem(item);
  return Boolean(expected && itemHandle && itemHandle === expected);
}

function normalizeProfileFromItems(
  items: Record<string, unknown>[],
  handle: string,
  profileUrl: string,
): InstagramOrganicProfile | null {
  const profileItem =
    items.find((item) => stringFromAny(item.type)?.toLowerCase() === "user" && profileMatchesHandle(item, handle)) ??
    items.find((item) => (Array.isArray(item.timeline_posts) || Array.isArray(item.igtv_posts)) && profileMatchesHandle(item, handle)) ??
    items.find((item) => profileMatchesHandle(item, handle)) ??
    null;
  const owner = profileItem ?? null;

  const extractedHandle = handle.replace(/^@/, "");

  return {
    handle: `@${extractedHandle}`,
    displayName: owner
      ? firstString(owner.full_name, owner.fullName, owner.name, nestedString(owner.owner, "full_name"))
      : null,
    profileUrl,
    avatarUrl: owner
      ? firstString(owner.profile_pic_url, owner.profilePicUrl, owner.avatarUrl, nestedString(owner.owner, "profile_pic_url"))
      : null,
    bio: owner ? firstString(owner.biography, owner.bio, owner.description) : null,
    followers: owner
      ? numberFromAny(owner.followers_count ?? owner.followersCount ?? owner.followers) ?? nestedNumber(owner.owner, "followers")
      : null,
    following: owner ? numberFromAny(owner.following_count ?? owner.followingCount ?? owner.following) : null,
    postsCount: owner
      ? numberFromAny(owner.post_count ?? owner.postsCount ?? owner.media_count ?? owner.posts) ?? nestedNumber(owner.owner, "post_count")
      : null,
    verified:
      owner ? boolFromAny(owner.is_verified ?? owner.isVerified ?? owner.verified) ?? nestedBool(owner.owner, "is_verified") : null,
  };
}

function uniqueActorIds(...actorIds: string[]): string[] {
  return [...new Set(actorIds.map((actorId) => actorId.trim()).filter(Boolean))];
}

function actorInput(actorId: string, profileUrl: string, handle: string, limit: number): Record<string, unknown> {
  const cleanHandle = handle.replace(/^@/, "");
  if (actorId.includes("instagram-scraper/instagram-profile-posts-scraper")) {
    return { instagramUsernames: [cleanHandle], postsPerProfile: Math.max(limit, 5) };
  }
  if (actorId.includes("headlessagent/instagram-profile-post-reel-scraper")) {
    return { usernames: [profileUrl], postUrls: [], reelUrls: [] };
  }
  if (actorId.includes("agentx/instagram-post-reel-scraper")) {
    return { instagram_url: profileUrl, max_results: limit, download_medias: "none" };
  }
  return {
    usernames: [cleanHandle],
    directUrls: [profileUrl],
    resultsLimit: limit,
    resultsType: "posts",
  };
}

type ApifyInstagramRunResult = {
  actorId: string;
  items: Record<string, unknown>[];
  error: string | null;
};

async function runApifyInstagramActor(
  actorId: string,
  profileUrl: string,
  handle: string,
  limit: number,
): Promise<ApifyInstagramRunResult> {
  const token = process.env.APIFY_TOKEN?.trim();
  if (!token) return { actorId, items: [], error: "missing_token" };

  const endpoint = new URL(`https://api.apify.com/v2/acts/${actorApiId(actorId)}/run-sync-get-dataset-items`);
  endpoint.searchParams.set("token", token);
  endpoint.searchParams.set("clean", "true");
  endpoint.searchParams.set("format", "json");
  endpoint.searchParams.set("timeout", "35");

  try {
    const res = await fetch(endpoint.toString(), {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify(actorInput(actorId, profileUrl, handle, limit)),
      signal: AbortSignal.timeout(APIFY_REQUEST_TIMEOUT_MS),
      cache: "no-store",
    });

    const json = (await res.json().catch(() => null)) as unknown;
    if (!res.ok || !Array.isArray(json)) {
      return { actorId, items: [], error: `http_${res.status}` };
    }
    return {
      actorId,
      items: json.filter((item): item is Record<string, unknown> => Boolean(item) && typeof item === "object"),
      error: null,
    };
  } catch (error) {
    const message = error instanceof Error ? error.name || error.message : "unknown_error";
    return { actorId, items: [], error: message };
  }
}

function normalizePostsFromItems(items: Record<string, unknown>[], handle: string, limit: number): InstagramOrganicPost[] {
  return flattenPostItems(items)
    .map((item) => normalizePost(item, handle))
    .filter((post): post is InstagramOrganicPost => post !== null)
    .sort((a, b) => (Date.parse(b.publishedAt ?? "") || 0) - (Date.parse(a.publishedAt ?? "") || 0))
    .slice(0, limit);
}

export async function fetchInstagramOrganicContent(
  profileUrl: string | null | undefined,
  limit = DEFAULT_LIMIT,
): Promise<InstagramOrganicContentResult> {
  const handle = instagramHandleFromUrl(profileUrl);
  const normalizedProfileUrl = handle ? instagramProfileUrlFromHandle(handle) : null;

  if (!profileUrl || !handle || !normalizedProfileUrl) {
    return {
      ok: false,
      configured: isInstagramOrganicConfigured(),
      profileUrl: null,
      profile: null,
      posts: [],
      source: "not_found",
      error: "Aucun compte Instagram officiel validé pour cette app.",
    };
  }

  if (!isInstagramOrganicConfigured()) {
    return {
      ok: false,
      configured: false,
      profileUrl: normalizedProfileUrl,
      profile: {
        handle: `@${handle}`,
        displayName: null,
        profileUrl: normalizedProfileUrl,
        avatarUrl: null,
        bio: null,
        followers: null,
        following: null,
        postsCount: null,
        verified: null,
      },
      posts: [],
      source: "not_configured",
      error: "APIFY_TOKEN non configuré sur le serveur.",
    };
  }

  const actorIds = uniqueActorIds(configuredActorId(), DEFAULT_ACTOR_ID, FALLBACK_ACTOR_ID);
  const attempts = await Promise.all(actorIds.map((actorId) => runApifyInstagramActor(actorId, normalizedProfileUrl, handle, limit)));
  const best =
    attempts
      .map((attempt) => ({
        ...attempt,
        posts: normalizePostsFromItems(attempt.items, handle, limit),
      }))
      .sort((a, b) => b.posts.length - a.posts.length)[0] ?? null;

  return {
    ok: true,
    configured: true,
    profileUrl: normalizedProfileUrl,
    profile: normalizeProfileFromItems(best?.items ?? [], handle, normalizedProfileUrl),
    posts: best?.posts ?? [],
    source: "apify",
    error: best?.error ? "Instagram est temporairement limité par Apify, réessaie dans quelques minutes." : null,
  };
}

export const fetchInstagramOrganicContentCached = (
  profileUrl: string | null | undefined,
  limit = DEFAULT_LIMIT,
) =>
  unstable_cache(
    async () => fetchInstagramOrganicContent(profileUrl, limit),
    [
      "instagram-organic-content-v3-parallel-fast",
      profileUrl ?? "none",
      String(limit),
      configuredActorId(),
      isInstagramOrganicConfigured() ? "apify-on" : "apify-off",
    ],
    { revalidate: 60 * 60 * 12 },
  )();
