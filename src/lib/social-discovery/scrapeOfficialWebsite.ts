import {
  detectPlatformFromUrl,
  cleanUrl,
  hostWithoutWww,
  isHttpUrl,
  parseUrl,
  urlsFromText,
} from "@/lib/social-discovery/normalizeUrls";
import { isScrapeableOfficialSocialUrl } from "@/lib/social-discovery/brand-social-heuristic";
import type { LinkCandidate, SocialPlatform } from "@/lib/social-discovery/types";

const SCAN_PATH_HINTS = ["about", "contact", "press", "career", "jobs", "company", "support", "help", "legal", "privacy", "terms"];
const FALLBACK_PATHS = ["/", "/about", "/contact", "/press", "/careers", "/fr", "/en"];

const SOCIAL_PLATFORMS: SocialPlatform[] = [
  "instagram",
  "tiktok",
  "x",
  "youtube",
  "facebook",
  "linkedin",
  "threads",
  "app_store",
  "google_play",
];

async function fetchHtml(url: string): Promise<string | null> {
  try {
    const res = await fetch(url, {
      headers: {
        Accept: "text/html,application/xhtml+xml",
        "User-Agent": "TrackappBot/1.0 (+https://trackapp.fr)",
      },
      signal: AbortSignal.timeout(8000),
      cache: "no-store",
    });
    if (!res.ok) return null;
    const type = res.headers.get("content-type") ?? "";
    if (type && !type.toLowerCase().includes("text/html")) return null;
    return (await res.text()).slice(0, 900_000);
  } catch {
    return null;
  }
}

function extractAnchorHrefs(html: string, baseUrl: string): string[] {
  const out: string[] = [];
  const seen = new Set<string>();
  const re = /<a\b[^>]*?\bhref\s*=\s*(["'])(.*?)\1/gi;
  let m: RegExpExecArray | null;
  while ((m = re.exec(html)) !== null) {
    const raw = m[2]?.trim();
    const parsed = parseUrl(raw, baseUrl);
    if (!parsed || !isHttpUrl(parsed)) continue;
    const href = cleanUrl(parsed);
    if (seen.has(href)) continue;
    seen.add(href);
    out.push(href);
  }
  return out;
}

function extractJsonLdSameAs(html: string): string[] {
  const out: string[] = [];
  const seen = new Set<string>();
  const re = /<script[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi;
  let m: RegExpExecArray | null;

  const pushUrl = (raw: unknown) => {
    if (typeof raw !== "string") return;
    const parsed = parseUrl(raw.replace(/&amp;/g, "&"));
    if (!parsed || !isHttpUrl(parsed)) return;
    const href = cleanUrl(parsed);
    if (seen.has(href)) return;
    seen.add(href);
    out.push(href);
  };

  while ((m = re.exec(html)) !== null) {
    const block = m[1]?.trim();
    if (!block) continue;
    try {
      const parsed = JSON.parse(block) as unknown;
      const nodes = Array.isArray(parsed) ? parsed : [parsed];
      for (const node of nodes) {
        if (!node || typeof node !== "object") continue;
        const record = node as Record<string, unknown>;
        const sameAs = record.sameAs;
        if (typeof sameAs === "string") pushUrl(sameAs);
        else if (Array.isArray(sameAs)) {
          for (const entry of sameAs) pushUrl(entry);
        }
      }
    } catch {
      /* ignore */
    }
  }
  return out;
}

function collectOutboundLinks(html: string, baseUrl: string): string[] {
  const out: string[] = [];
  const seen = new Set<string>();
  const push = (raw: string) => {
    const parsed = parseUrl(raw, baseUrl);
    if (!parsed || !isHttpUrl(parsed)) return;
    const href = cleanUrl(parsed);
    if (seen.has(href)) return;
    seen.add(href);
    out.push(href);
  };

  for (const href of extractAnchorHrefs(html, baseUrl)) push(href);
  for (const href of extractJsonLdSameAs(html)) push(href);
  for (const href of urlsFromText(html)) {
    const platform = detectPlatformFromUrl(href);
    if (platform && SOCIAL_PLATFORMS.includes(platform)) push(href);
  }
  return out;
}

function sameOrigin(a: URL, b: URL): boolean {
  return a.hostname.replace(/^www\./i, "") === b.hostname.replace(/^www\./i, "");
}

function internalScanUrls(base: URL, links: string[]): string[] {
  const candidates = new Set<string>();
  for (const path of FALLBACK_PATHS) {
    candidates.add(cleanUrl(new URL(path, base.origin)));
  }
  for (const href of links) {
    const u = parseUrl(href);
    if (!u || !sameOrigin(base, u)) continue;
    const path = u.pathname.toLowerCase();
    if (SCAN_PATH_HINTS.some((hint) => path.includes(hint))) {
      candidates.add(cleanUrl(u));
    }
  }
  return [...candidates].slice(0, 12);
}

export type ScrapeOfficialWebsiteResult = Readonly<{
  scannedUrls: string[];
  candidates: LinkCandidate[];
}>;

function marketingRootsForScrape(base: URL): string[] {
  const roots = new Set<string>();
  roots.add(cleanUrl(base));

  const host = hostWithoutWww(base);
  const parts = host.split(".");
  if (parts.length >= 3 && /^[a-z]{2}$/i.test(parts[0]!)) {
    const apex = parts.slice(1).join(".");
    roots.add(cleanUrl(new URL(`https://www.${apex}/`)));
    roots.add(cleanUrl(new URL(`https://${apex}/`)));
  }

  return [...roots];
}

export async function scrapeOfficialWebsite(websiteUrl: string): Promise<ScrapeOfficialWebsiteResult> {
  const base = parseUrl(websiteUrl);
  if (!base) return { scannedUrls: [], candidates: [] };

  const scanned = new Set<string>();
  const allLinks: string[] = [];

  for (const home of marketingRootsForScrape(base)) {
    const homeUrl = parseUrl(home);
    if (!homeUrl) continue;
    const firstHtml = await fetchHtml(home);
    if (!firstHtml) continue;
    scanned.add(home);
    const firstLinks = collectOutboundLinks(firstHtml, home);
    allLinks.push(...firstLinks);
    for (const scanUrl of internalScanUrls(homeUrl, firstLinks)) {
      if (scanned.has(scanUrl)) continue;
      const html = await fetchHtml(scanUrl);
      if (!html) continue;
      scanned.add(scanUrl);
      allLinks.push(...collectOutboundLinks(html, scanUrl));
    }
  }

  const candidates: LinkCandidate[] = [];
  const seen = new Set<string>();

  for (const raw of allLinks) {
    if (!isScrapeableOfficialSocialUrl(raw)) continue;
    const platform = detectPlatformFromUrl(raw);
    if (!platform || platform === "website" || platform === "meta_ads_library") continue;
    const key = `${platform}:${raw}`;
    if (seen.has(key)) continue;
    seen.add(key);
    candidates.push({
      url: raw,
      platform,
      source: "official_website_scrape",
      evidence: ["official_website_link"],
    });
  }

  return { scannedUrls: [...scanned], candidates };
}
