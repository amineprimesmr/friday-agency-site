import type { SocialPlatform } from "@/lib/social-discovery/types";

export function parseUrl(raw: string, base?: string): URL | null {
  try {
    return base ? new URL(raw.trim(), base) : new URL(raw.trim());
  } catch {
    return null;
  }
}

export function isHttpUrl(url: URL): boolean {
  return url.protocol === "http:" || url.protocol === "https:";
}

export function hostWithoutWww(url: URL): string {
  return url.hostname.replace(/^www\./i, "").toLowerCase();
}

export function cleanUrl(url: URL | string): string {
  const u = typeof url === "string" ? parseUrl(url) : url;
  if (!u) return typeof url === "string" ? url : "";
  u.hash = "";
  return u.toString();
}

const DIRECTORY_HOSTS = new Set([
  "crunchbase.com",
  "linkedin.com",
  "play.google.com",
  "apps.apple.com",
  "facebook.com",
  "instagram.com",
  "tiktok.com",
  "youtube.com",
  "x.com",
  "twitter.com",
  "medium.com",
  "notion.site",
  "producthunt.com",
  "wikipedia.org",
]);

export function isLikelyMarketingSiteHost(host: string): boolean {
  const h = host.toLowerCase();
  if (DIRECTORY_HOSTS.has(h)) return false;
  if (h.endsWith(".apple.com")) return false;
  return true;
}

export function detectPlatformFromUrl(urlString: string): SocialPlatform | null {
  const url = parseUrl(urlString);
  if (!url || !isHttpUrl(url)) return null;
  const host = hostWithoutWww(url);
  const pathParts = url.pathname.split("/").filter(Boolean);
  const first = pathParts[0]?.toLowerCase();
  const second = pathParts[1]?.toLowerCase();

  if (host.endsWith("instagram.com") || host === "instagr.am") {
    if (!first || ["p", "reel", "reels", "stories", "explore", "accounts", "direct"].includes(first)) return null;
    return "instagram";
  }
  if (host.endsWith("tiktok.com")) {
    if (!first?.startsWith("@")) return null;
    return "tiktok";
  }
  if (host === "x.com" || host.endsWith("twitter.com")) {
    if (!first || ["i", "intent", "share", "home", "search", "hashtag", "status", "statuses"].includes(first)) {
      return null;
    }
    if (pathParts.includes("status") || pathParts.includes("statuses") || second === "status") return null;
    return "x";
  }
  if (host.endsWith("youtube.com") || host === "youtu.be") {
    if (host === "youtu.be") return null;
    if (!first || first === "watch" || first === "shorts") return null;
    if (!first.startsWith("@") && !["channel", "c", "user"].includes(first)) return null;
    return "youtube";
  }
  if (host.endsWith("threads.net")) {
    if (!first || first.startsWith("@")) return "threads";
    return null;
  }
  if (host.endsWith("facebook.com") || host === "fb.com") {
    const rejected = [
      "watch",
      "videos",
      "reel",
      "reels",
      "stories",
      "posts",
      "share",
      "groups",
      "events",
      "ads",
      "ads_library",
    ];
    if (!first || rejected.includes(first)) return null;
    if (first === "profile.php" && !url.searchParams.get("id")) return null;
    return "facebook";
  }
  if (host.endsWith("linkedin.com")) {
    if (!["company", "showcase", "school"].includes(first ?? "")) return null;
    return "linkedin";
  }
  if (host === "apps.apple.com" || host.endsWith(".apps.apple.com")) return "app_store";
  if (host === "play.google.com" && url.pathname.includes("/store/apps/details")) return "google_play";
  if (host.includes("facebook.com") && url.pathname.includes("/ads/library")) return "meta_ads_library";

  if (isLikelyMarketingSiteHost(host)) return "website";
  return null;
}

export function urlsFromText(text: string): string[] {
  const re = /https?:\/\/[^\s<>"')\]]+/gi;
  return (text.match(re) ?? []).map((u) => u.replace(/[.,;:!?)]+$/, ""));
}

export function appStoreUrlMatchesApp(appId: string, urlString: string): boolean {
  const url = parseUrl(urlString);
  if (!url) return false;
  const text = `${url.pathname}${url.search}`;
  return text.includes(`id${appId}`) || text.includes(`id=${appId}`);
}

export function googlePlayUrlMatchesBundle(bundleId: string, urlString: string): boolean {
  const url = parseUrl(urlString);
  if (!url) return false;
  const packageId = url.searchParams.get("id")?.trim().toLowerCase();
  const bundle = bundleId.trim().toLowerCase();
  return Boolean(packageId && bundle && packageId === bundle);
}

export function metaPageIdFromAdLibraryUrl(raw: string): string | null {
  const url = parseUrl(raw);
  if (!url) return null;
  const pageId = url.searchParams.get("view_all_page_id")?.trim();
  return pageId && /^\d{6,24}$/.test(pageId) ? pageId : null;
}

export function isKeywordMetaAdsLibraryUrl(raw: string): boolean {
  const url = parseUrl(raw);
  if (!url) return false;
  if (!url.pathname.includes("/ads/library")) return false;
  const st = url.searchParams.get("search_type");
  if (st === "keyword_unordered" || st === "keyword") return true;
  if (url.searchParams.has("q") && !url.searchParams.has("view_all_page_id")) return true;
  return false;
}
