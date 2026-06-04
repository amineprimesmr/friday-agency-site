import type { AppDetail } from "@/lib/apple-charts";
import { handleMatchesBrandSlug } from "@/lib/official-brand-social-candidates";
import { detectPlatformFromUrl, hostWithoutWww, parseUrl } from "@/lib/social-discovery/normalizeUrls";
import { socialHandleFromUrl } from "@/lib/social-discovery/social-handle-utils";

const GENERIC_WORDS = new Set([
  "app",
  "apps",
  "mobile",
  "official",
  "the",
  "and",
  "for",
  "avec",
  "pour",
  "cours",
  "temps",
  "screen",
  "time",
  "focus",
  "plus",
  "pro",
  "lite",
  "free",
]);

/** Tokens marque (opal, duolingo…) pour filtrer les faux liens scrape (témoignages, embeds). */
export function brandTokensForApp(app: AppDetail, websiteUrl?: string | null): string[] {
  const tokens = new Set<string>();

  const addText = (raw: string) => {
    const parts = raw
      .toLowerCase()
      .normalize("NFD")
      .replace(/\p{M}/gu, "")
      .replace(/[^a-z0-9]+/g, " ")
      .split(/\s+/)
      .filter((w) => w.length >= 3 && !GENERIC_WORDS.has(w));
    for (const w of parts) tokens.add(w);
  };

  addText(app.name);
  addText(app.sellerName || app.artistName);
  if (app.bundleId) {
    const seg = app.bundleId.split(".").filter(Boolean);
    const last = seg[seg.length - 1];
    if (last && last.length >= 4) addText(last);
  }

  if (websiteUrl) {
    try {
      const host = hostWithoutWww(parseUrl(websiteUrl)!);
      const base = host.split(".")[0];
      if (base && base.length >= 3) tokens.add(base);
    } catch {
      /* ignore */
    }
  }

  return [...tokens];
}

export function socialUrlMatchesBrandTokens(url: string, tokens: readonly string[]): boolean {
  if (tokens.length === 0) return true;
  const lower = url.toLowerCase();
  return tokens.some((t) => lower.includes(t));
}

/** Match handle strict (slug marque) — plus fiable que substring URL. */
export function socialUrlStrictBrandMatch(url: string, appName: string): boolean {
  const platform = detectPlatformFromUrl(url);
  if (
    !platform ||
    platform === "website" ||
    platform === "app_store" ||
    platform === "google_play" ||
    platform === "meta_ads_library"
  ) {
    return false;
  }
  const handle = socialHandleFromUrl(platform, url);
  if (!handle) return false;
  return handleMatchesBrandSlug(handle, appName);
}

/** Exclut posts / témoignages / pages non-profil trouvés dans le HTML marketing. */
export function isScrapeableOfficialSocialUrl(urlString: string): boolean {
  const url = parseUrl(urlString);
  if (!url) return false;
  const host = hostWithoutWww(url);
  const parts = url.pathname.split("/").filter(Boolean);
  const first = parts[0]?.toLowerCase();

  if (host.endsWith("instagram.com") && (first === "p" || first === "reel" || first === "reels")) {
    return false;
  }
  if (
    (host === "x.com" || host.endsWith("twitter.com")) &&
    (parts.includes("status") || parts.includes("statuses"))
  ) {
    return false;
  }
  if (host === "youtu.be") return false;
  if (host.endsWith("youtube.com") && parts[0] === "watch") return false;
  if (host.endsWith("tiktok.com") && parts.includes("video")) return false;

  return true;
}
