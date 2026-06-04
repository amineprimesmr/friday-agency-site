import { instagramHandleFromUrl } from "@/lib/instagram-organic-content";
import { tiktokHandleFromUrl } from "@/lib/tiktok-organic-content";
import { parseUrl, hostWithoutWww } from "@/lib/social-discovery/normalizeUrls";
import type { SocialPlatform } from "@/lib/social-discovery/types";

export function socialHandleFromUrl(platform: SocialPlatform, url: string): string | null {
  switch (platform) {
    case "instagram": {
      const h = instagramHandleFromUrl(url);
      return h ? h.replace(/^@/, "").toLowerCase() : null;
    }
    case "tiktok": {
      const h = tiktokHandleFromUrl(url);
      return h ? h.replace(/^@/, "").toLowerCase() : null;
    }
    case "x": {
      const u = parseUrl(url);
      if (!u) return null;
      const host = hostWithoutWww(u);
      if (host !== "x.com" && !host.endsWith("twitter.com")) return null;
      const seg = u.pathname.split("/").filter(Boolean)[0]?.replace(/^@/, "").toLowerCase();
      if (!seg || ["i", "intent", "share", "home", "search", "hashtag"].includes(seg)) return null;
      return seg;
    }
    case "youtube": {
      const u = parseUrl(url);
      if (!u) return null;
      const host = hostWithoutWww(u);
      if (!host.endsWith("youtube.com")) return null;
      const parts = u.pathname.split("/").filter(Boolean);
      const first = parts[0]?.toLowerCase();
      if (first?.startsWith("@")) return first.slice(1);
      if (first === "channel" || first === "c" || first === "user") {
        return parts[1]?.toLowerCase() ?? null;
      }
      return null;
    }
    case "facebook":
    case "linkedin":
    case "threads": {
      const u = parseUrl(url);
      if (!u) return null;
      const parts = u.pathname.split("/").filter(Boolean);
      const seg = parts[0]?.replace(/^@/, "").toLowerCase();
      return seg && seg.length >= 2 ? seg : null;
    }
    default:
      return null;
  }
}

/** Handles proches (opal ↔ opalapp, withopal ↔ opal). */
export function handlesAreCrossNetworkCompatible(a: string, b: string): boolean {
  const x = a.replace(/^@/, "").toLowerCase();
  const y = b.replace(/^@/, "").toLowerCase();
  if (x === y) return true;
  if (x.length >= 4 && y.includes(x)) return true;
  if (y.length >= 4 && x.includes(y)) return true;
  const stripApp = (h: string) => h.replace(/app$/, "");
  const sx = stripApp(x);
  const sy = stripApp(y);
  if (sx.length >= 3 && sy.length >= 3 && (sx === sy || sx.includes(sy) || sy.includes(sx))) return true;
  return false;
}

export function handleMatchesWebsiteCluster(
  handle: string | null,
  websiteHandles: readonly string[],
): boolean {
  if (!handle || websiteHandles.length === 0) return false;
  return websiteHandles.some((wh) => handlesAreCrossNetworkCompatible(handle, wh));
}
