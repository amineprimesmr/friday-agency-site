import { unstable_cache } from "next/cache";

import type { AppDetail } from "@/lib/apple-charts";
import { fetchAdsArchive } from "@/lib/meta-ad-library";
import {
  facebookGraphIdentifierFromUrl,
  resolveFacebookPageNode,
} from "@/lib/meta-page-resolve";
import { detectProfileFromUrl, type DetectedSocialProfile } from "@/lib/social-presence";

export type OfficialLinkKey =
  | "site"
  | "instagram"
  | "tiktok"
  | "x"
  | "youtube"
  | "facebook"
  | "linkedin"
  | "appStore"
  | "googlePlay"
  | "metaAdsLibrary";

export type OfficialLinkValidation = {
  label: string;
  url: string | null;
  validated: boolean;
  reason: string;
  source: "app_store" | "official_site" | "openai_web" | "meta_graph" | "not_found";
};

export type OfficialBrandLinksReport = Record<OfficialLinkKey, OfficialLinkValidation> & {
  officialSiteOrigin: string | null;
  scannedUrls: string[];
  evidenceUrls: string[];
  socialProfiles: DetectedSocialProfile[];
  metaPageId: string | null;
  metaPageName: string | null;
  confidence: number;
};

const SCAN_PATH_HINTS = [
  "about",
  "contact",
  "press",
  "career",
  "jobs",
  "company",
  "support",
  "help",
];

const FALLBACK_SITE_PATHS = ["/", "/about", "/contact", "/press", "/careers"];

const NETWORK_ORDER: Array<Exclude<OfficialLinkKey, "site" | "appStore" | "googlePlay" | "metaAdsLibrary">> = [
  "instagram",
  "tiktok",
  "x",
  "youtube",
  "facebook",
  "linkedin",
];

function emptyLink(label: string, reason = "pas de lien officiel validé"): OfficialLinkValidation {
  return { label, url: null, validated: false, reason, source: "not_found" };
}

function makeReportBase(): OfficialBrandLinksReport {
  return {
    site: emptyLink("Site", "site officiel non trouve dans la fiche App Store"),
    instagram: emptyLink("Instagram"),
    tiktok: emptyLink("TikTok"),
    x: emptyLink("X / Twitter"),
    youtube: emptyLink("YouTube"),
    facebook: emptyLink("Facebook"),
    linkedin: emptyLink("LinkedIn"),
    appStore: emptyLink("App Store"),
    googlePlay: emptyLink("Google Play"),
    metaAdsLibrary: emptyLink("Meta Ads Library", "Meta Ads Library : pas de page officielle validee"),
    officialSiteOrigin: null,
    scannedUrls: [],
    evidenceUrls: [],
    socialProfiles: [],
    metaPageId: null,
    metaPageName: null,
    confidence: 0,
  };
}

type OpenAiOfficialLinks = {
  site_url: string | null;
  instagram_url: string | null;
  tiktok_url: string | null;
  x_url: string | null;
  youtube_url: string | null;
  facebook_url: string | null;
  linkedin_url: string | null;
  app_store_url: string | null;
  google_play_url: string | null;
  meta_page_id: string | null;
  meta_ads_library_url: string | null;
  confidence: number;
  validation_notes: {
    site: string;
    instagram: string;
    tiktok: string;
    x: string;
    youtube: string;
    facebook: string;
    linkedin: string;
    app_store: string;
    google_play: string;
    meta_ads_library: string;
  };
  sources: string[];
};

function parseUrl(raw: string | undefined | null, base?: string): URL | null {
  const value = String(raw ?? "").trim();
  if (!value) return null;
  try {
    return base ? new URL(value, base) : new URL(value);
  } catch {
    return null;
  }
}

function isHttpUrl(url: URL): boolean {
  return url.protocol === "http:" || url.protocol === "https:";
}

function cleanUrl(url: URL): string {
  url.hash = "";
  return url.toString();
}

function hostWithoutWww(url: URL): string {
  return url.hostname.replace(/^www\./i, "").toLowerCase();
}

function isSocialOrStoreHost(url: URL): boolean {
  const host = hostWithoutWww(url);
  return (
    host.endsWith("instagram.com") ||
    host === "instagr.am" ||
    host.endsWith("tiktok.com") ||
    host === "x.com" ||
    host.endsWith("twitter.com") ||
    host.endsWith("youtube.com") ||
    host === "youtu.be" ||
    host.endsWith("facebook.com") ||
    host === "fb.com" ||
    host.endsWith("linkedin.com") ||
    host.endsWith("apple.com") ||
    host.endsWith("google.com")
  );
}

function isLikelyOfficialSiteCandidate(raw: string | undefined | null): URL | null {
  const url = parseUrl(raw);
  if (!url || !isHttpUrl(url) || isSocialOrStoreHost(url)) return null;
  return url;
}

function urlsFromText(text: string): string[] {
  return [...text.matchAll(/https?:\/\/[^\s<>"')\]]+/gi)].map((m) => m[0]!.replace(/[.,;:!?)\]]+$/u, ""));
}

function extractResponseText(data: unknown): string | null {
  if (!data || typeof data !== "object") return null;
  const record = data as Record<string, unknown>;
  if (typeof record.output_text === "string" && record.output_text.trim()) return record.output_text;

  const output = record.output;
  if (!Array.isArray(output)) return null;
  for (const item of output) {
    if (!item || typeof item !== "object") continue;
    const content = (item as Record<string, unknown>).content;
    if (!Array.isArray(content)) continue;
    for (const part of content) {
      if (!part || typeof part !== "object") continue;
      const text = (part as Record<string, unknown>).text;
      if (typeof text === "string" && text.trim()) return text;
    }
  }
  return null;
}

function pickUrl(v: unknown): string | null {
  if (typeof v !== "string") return null;
  const url = parseUrl(v);
  return url && isHttpUrl(url) ? cleanUrl(url) : null;
}

function pickNote(v: unknown): string {
  return typeof v === "string" && v.trim() ? v.trim().slice(0, 260) : "pas de preuve de validation";
}

function pickConfidence(v: unknown): number {
  const n = typeof v === "number" ? v : Number(v);
  return Number.isFinite(n) ? Math.max(0, Math.min(1, n)) : 0;
}

function pickSources(v: unknown): string[] {
  if (!Array.isArray(v)) return [];
  return v
    .map((x) => (typeof x === "string" ? x.trim() : ""))
    .filter((x) => /^https:\/\//i.test(x))
    .slice(0, 10);
}

async function inferOfficialLinksWithOpenAI(args: {
  app: AppDetail;
  officialSiteHint: string | null;
}): Promise<OpenAiOfficialLinks | null> {
  const key = process.env.OPENAI_API_KEY?.trim();
  if (!key) return null;

  const model = process.env.TRACKER_BRAND_OPENAI_MODEL?.trim() || "gpt-4o-mini";
  const response = await fetch("https://api.openai.com/v1/responses", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${key}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model,
      temperature: 0,
      tools: [{ type: "web_search" }],
      text: {
        format: {
          type: "json_schema",
          name: "official_mobile_app_links",
          strict: true,
          schema: {
            type: "object",
            additionalProperties: false,
            properties: {
              site_url: { type: ["string", "null"] },
              instagram_url: { type: ["string", "null"] },
              tiktok_url: { type: ["string", "null"] },
              x_url: { type: ["string", "null"] },
              youtube_url: { type: ["string", "null"] },
              facebook_url: { type: ["string", "null"] },
              linkedin_url: { type: ["string", "null"] },
              app_store_url: { type: ["string", "null"] },
              google_play_url: { type: ["string", "null"] },
              meta_page_id: { type: ["string", "null"] },
              meta_ads_library_url: { type: ["string", "null"] },
              confidence: { type: "number", minimum: 0, maximum: 1 },
              validation_notes: {
                type: "object",
                additionalProperties: false,
                properties: {
                  site: { type: "string" },
                  instagram: { type: "string" },
                  tiktok: { type: "string" },
                  x: { type: "string" },
                  youtube: { type: "string" },
                  facebook: { type: "string" },
                  linkedin: { type: "string" },
                  app_store: { type: "string" },
                  google_play: { type: "string" },
                  meta_ads_library: { type: "string" },
                },
                required: [
                  "site",
                  "instagram",
                  "tiktok",
                  "x",
                  "youtube",
                  "facebook",
                  "linkedin",
                  "app_store",
                  "google_play",
                  "meta_ads_library",
                ],
              },
              sources: { type: "array", items: { type: "string" }, maxItems: 10 },
            },
            required: [
              "site_url",
              "instagram_url",
              "tiktok_url",
              "x_url",
              "youtube_url",
              "facebook_url",
              "linkedin_url",
              "app_store_url",
              "google_play_url",
              "meta_page_id",
              "meta_ads_library_url",
              "confidence",
              "validation_notes",
              "sources",
            ],
          },
        },
      },
      input: [
        {
          role: "system",
          content:
            "Tu es un vérificateur strict de liens officiels d'apps mobiles. " +
            "Trouve d'abord le site officiel, puis valide les réseaux via branding, bio, contenu, lien vers le site officiel/app et cohérence produit. " +
            "Ne renvoie jamais de compte fan, affilié, UGC, page parasite, post, vidéo, reel ou recherche keyword. " +
            "Si un lien n'est pas officiellement validé, renvoie null et explique brièvement pourquoi dans validation_notes. " +
            "Pour Meta Ads Library, renvoie uniquement un Page ID Facebook officiel validé et une URL avec view_all_page_id. " +
            "N'utilise jamais q=nomdelapp ni search_type=keyword_unordered.",
        },
        {
          role: "user",
          content: [
            `App: ${args.app.name}`,
            `App Store ID: ${args.app.id}`,
            `App Store URL: ${args.app.trackViewUrl}`,
            `Developer/Seller: ${args.app.sellerName || args.app.artistName}`,
            `Bundle ID: ${args.app.bundleId}`,
            `Category: ${args.app.primaryGenreName}`,
            `Site hint from App Store: ${args.officialSiteHint || args.app.sellerUrl || args.app.supportUrl || "none"}`,
            "",
            "Retourne uniquement les liens officiels validés pour: site, Instagram, TikTok, X/Twitter, YouTube, Facebook, LinkedIn, App Store, Google Play, Meta Ads Library.",
            "Méthode obligatoire: recherche web, site officiel source principale, validation de branding/bio/contenu/lien officiel. Si doute: null.",
            "",
            "Description App Store:",
            (args.app.description ?? "").slice(0, 1400),
          ].join("\n"),
        },
      ],
    }),
  });

  if (!response.ok) return null;
  const text = extractResponseText(await response.json());
  if (!text) return null;

  try {
    const parsed = JSON.parse(text) as Record<string, unknown>;
    const notes = parsed.validation_notes as Record<string, unknown> | null;
    return {
      site_url: pickUrl(parsed.site_url),
      instagram_url: pickUrl(parsed.instagram_url),
      tiktok_url: pickUrl(parsed.tiktok_url),
      x_url: pickUrl(parsed.x_url),
      youtube_url: pickUrl(parsed.youtube_url),
      facebook_url: pickUrl(parsed.facebook_url),
      linkedin_url: pickUrl(parsed.linkedin_url),
      app_store_url: pickUrl(parsed.app_store_url),
      google_play_url: pickUrl(parsed.google_play_url),
      meta_page_id: typeof parsed.meta_page_id === "string" && /^\d{6,24}$/.test(parsed.meta_page_id.trim()) ? parsed.meta_page_id.trim() : null,
      meta_ads_library_url: pickUrl(parsed.meta_ads_library_url),
      confidence: pickConfidence(parsed.confidence),
      validation_notes: {
        site: pickNote(notes?.site),
        instagram: pickNote(notes?.instagram),
        tiktok: pickNote(notes?.tiktok),
        x: pickNote(notes?.x),
        youtube: pickNote(notes?.youtube),
        facebook: pickNote(notes?.facebook),
        linkedin: pickNote(notes?.linkedin),
        app_store: pickNote(notes?.app_store),
        google_play: pickNote(notes?.google_play),
        meta_ads_library: pickNote(notes?.meta_ads_library),
      },
      sources: pickSources(parsed.sources),
    };
  } catch {
    return null;
  }
}

function firstOfficialSiteCandidate(app: AppDetail): URL | null {
  const direct = [
    app.sellerUrl,
    app.supportUrl,
    ...urlsFromText(app.description ?? ""),
    ...urlsFromText(app.releaseNotes ?? ""),
  ];

  for (const raw of direct) {
    const candidate = isLikelyOfficialSiteCandidate(raw);
    if (candidate) return candidate;
  }
  return null;
}

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

function extractLiteralUrls(html: string): string[] {
  const out: string[] = [];
  const seen = new Set<string>();
  for (const raw of urlsFromText(html)) {
    const parsed = parseUrl(raw.replace(/&amp;/g, "&"));
    if (!parsed || !isHttpUrl(parsed)) continue;
    const href = cleanUrl(parsed);
    if (seen.has(href)) continue;
    seen.add(href);
    out.push(href);
  }
  return out;
}

function classifyOutputKey(urlString: string): OfficialLinkKey | null {
  const url = parseUrl(urlString);
  if (!url) return null;
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
    if (!first || ["i", "intent", "share", "home", "search", "hashtag"].includes(first)) return null;
    return "x";
  }

  if (host.endsWith("youtube.com")) {
    if (!first || !(first.startsWith("@") || ["channel", "c", "user"].includes(first))) return null;
    return "youtube";
  }

  if (host.endsWith("facebook.com") || host === "fb.com") {
    const rejected = [
      "watch",
      "videos",
      "video.php",
      "reel",
      "reels",
      "stories",
      "posts",
      "share",
      "photo.php",
      "groups",
      "events",
      "permalink.php",
      "story.php",
      "login",
    ];
    if (!first || rejected.includes(first) || rejected.includes(second ?? "")) return null;
    if (first === "profile.php" && !url.searchParams.get("id")) return null;
    return "facebook";
  }

  if (host.endsWith("linkedin.com")) {
    if (!["company", "showcase", "school"].includes(first ?? "")) return null;
    return "linkedin";
  }

  if (host === "apps.apple.com" || host.endsWith(".apps.apple.com")) return "appStore";
  if (host === "play.google.com" && url.pathname.includes("/store/apps/details")) return "googlePlay";

  return null;
}

function sameOrigin(a: URL, b: URL): boolean {
  return hostWithoutWww(a) === hostWithoutWww(b);
}

function internalScanLinks(base: URL, links: string[]): string[] {
  const candidates = new Set<string>();
  for (const path of FALLBACK_SITE_PATHS) {
    const u = new URL(path, base.origin);
    candidates.add(cleanUrl(u));
  }
  for (const href of links) {
    const u = parseUrl(href);
    if (!u || !sameOrigin(base, u)) continue;
    const path = u.pathname.toLowerCase();
    if (SCAN_PATH_HINTS.some((hint) => path.includes(hint))) {
      candidates.add(cleanUrl(u));
    }
  }
  return [...candidates].slice(0, 10);
}

function appStoreUrlIsCurrentApp(app: AppDetail, urlString: string): boolean {
  const url = parseUrl(urlString);
  if (!url) return false;
  const text = `${url.pathname}${url.search}`;
  return text.includes(`id${app.id}`) || text.includes(`id=${app.id}`);
}

function googlePlayUrlMatchesApp(app: AppDetail, urlString: string): boolean {
  const url = parseUrl(urlString);
  if (!url) return false;
  const packageId = url.searchParams.get("id")?.trim().toLowerCase();
  if (!packageId) return false;
  const bundle = app.bundleId.trim().toLowerCase();
  if (bundle && packageId === bundle) return true;
  return true;
}

function metaAdsLibraryUrl(pageId: string): string {
  const url = new URL("https://www.facebook.com/ads/library/");
  url.searchParams.set("active_status", "active");
  url.searchParams.set("ad_type", "all");
  url.searchParams.set("country", "ALL");
  url.searchParams.set("is_targeted_country", "false");
  url.searchParams.set("media_type", "all");
  url.searchParams.set("search_type", "page");
  url.searchParams.set("sort_data[direction]", "desc");
  url.searchParams.set("sort_data[mode]", "total_impressions");
  url.searchParams.set("view_all_page_id", pageId);
  return url.toString();
}

async function resolveOfficialMetaPage(facebookUrl: string): Promise<{
  pageId: string;
  pageName?: string;
  adsProbeCount?: number;
} | null> {
  const token = process.env.META_AD_LIBRARY_ACCESS_TOKEN?.trim();
  if (!token) return null;

  const identifier = facebookGraphIdentifierFromUrl(facebookUrl);
  if (!identifier) return null;

  const node = await resolveFacebookPageNode(token, identifier);
  if (!node) return null;

  const probe = await fetchAdsArchive({
    searchPageIds: [node.id],
    countries: ["ALL"],
    limit: 3,
  });

  return {
    pageId: node.id,
    pageName: node.name,
    adsProbeCount: probe.metaError ? undefined : probe.data.length,
  };
}

async function resolveOfficialBrandLinks(app: AppDetail): Promise<OfficialBrandLinksReport> {
  const report = makeReportBase();
  const localOfficialSite = firstOfficialSiteCandidate(app);
  const ai = await inferOfficialLinksWithOpenAI({
    app,
    officialSiteHint: localOfficialSite ? cleanUrl(localOfficialSite) : null,
  });
  report.evidenceUrls = ai?.sources ?? [];

  if (app.trackViewUrl) {
    report.appStore = {
      label: "App Store",
      url: app.trackViewUrl,
      validated: true,
      reason: `fiche App Store validee: ${app.name} par ${app.sellerName || app.artistName}`,
      source: "app_store",
    };
  }

  const officialSite =
    localOfficialSite ??
    (() => {
      const url = isLikelyOfficialSiteCandidate(ai?.site_url);
      return url;
    })();

  if (!officialSite) return report;

  report.site = {
    label: "Site",
    url: cleanUrl(officialSite),
    validated: true,
    reason: localOfficialSite ? "site officiel issu de la fiche App Store" : ai?.validation_notes.site || "site officiel validé par OpenAI web search",
    source: localOfficialSite ? "app_store" : "openai_web",
  };
  report.officialSiteOrigin = officialSite.origin;

  const allOutboundLinks: string[] = [];
  const scanned = new Set<string>();

  const firstHtml = await fetchHtml(cleanUrl(officialSite));
  if (firstHtml) {
    scanned.add(cleanUrl(officialSite));
    const firstLinks = [...extractAnchorHrefs(firstHtml, cleanUrl(officialSite)), ...extractLiteralUrls(firstHtml)];
    allOutboundLinks.push(...firstLinks);

    for (const scanUrl of internalScanLinks(officialSite, firstLinks)) {
      if (scanned.has(scanUrl)) continue;
      const html = await fetchHtml(scanUrl);
      if (!html) continue;
      scanned.add(scanUrl);
      allOutboundLinks.push(...extractAnchorHrefs(html, scanUrl), ...extractLiteralUrls(html));
    }
  }

  report.scannedUrls = [...scanned];
  const seenAccepted = new Set<OfficialLinkKey>();

  for (const raw of allOutboundLinks) {
    const key = classifyOutputKey(raw);
    if (!key || seenAccepted.has(key)) continue;

    if (key === "appStore" && !appStoreUrlIsCurrentApp(app, raw)) continue;
    if (key === "googlePlay" && !googlePlayUrlMatchesApp(app, raw)) continue;

    const label = report[key].label;
    report[key] = {
      label,
      url: raw,
      validated: true,
      reason: "lien sortant trouve sur le site officiel",
      source: "official_site",
    };
    seenAccepted.add(key);
  }

  if (!report.appStore.validated && app.trackViewUrl) {
    report.appStore = {
      label: "App Store",
      url: app.trackViewUrl,
      validated: true,
      reason: `fiche App Store validee: ${app.name} par ${app.sellerName || app.artistName}`,
      source: "app_store",
    };
  }

  const openAiCandidates: Array<{
    key: OfficialLinkKey;
    url: string | null;
    note: string;
  }> = ai
    ? [
        { key: "instagram", url: ai.instagram_url, note: ai.validation_notes.instagram },
        { key: "tiktok", url: ai.tiktok_url, note: ai.validation_notes.tiktok },
        { key: "x", url: ai.x_url, note: ai.validation_notes.x },
        { key: "youtube", url: ai.youtube_url, note: ai.validation_notes.youtube },
        { key: "facebook", url: ai.facebook_url, note: ai.validation_notes.facebook },
        { key: "linkedin", url: ai.linkedin_url, note: ai.validation_notes.linkedin },
        { key: "appStore", url: ai.app_store_url, note: ai.validation_notes.app_store },
        { key: "googlePlay", url: ai.google_play_url, note: ai.validation_notes.google_play },
      ]
    : [];

  for (const candidate of openAiCandidates) {
    if (!candidate.url || report[candidate.key].validated) continue;
    const classified = classifyOutputKey(candidate.url);
    if (classified !== candidate.key) continue;
    if (candidate.key === "appStore" && !appStoreUrlIsCurrentApp(app, candidate.url)) continue;
    if (candidate.key === "googlePlay" && !googlePlayUrlMatchesApp(app, candidate.url)) continue;

    report[candidate.key] = {
      label: report[candidate.key].label,
      url: candidate.url,
      validated: true,
      reason: candidate.note || "lien officiel validé par OpenAI web search",
      source: "openai_web",
    };
  }

  const profiles: DetectedSocialProfile[] = [];
  for (const key of NETWORK_ORDER) {
    const link = report[key];
    if (!link.validated || !link.url) continue;
    const profile = detectProfileFromUrl(link.url);
    if (profile) profiles.push(profile);
  }
  report.socialProfiles = profiles;

  if (ai?.meta_page_id) {
    report.metaPageId = ai.meta_page_id;
    report.metaPageName = null;
    report.metaAdsLibrary = {
      label: "Meta Ads Library",
      url: metaAdsLibraryUrl(ai.meta_page_id),
      validated: true,
      reason: ai.validation_notes.meta_ads_library || "Page ID officiel validé par OpenAI web search",
      source: "openai_web",
    };
  }

  if (!report.metaPageId && report.facebook.validated && report.facebook.url) {
    const meta = await resolveOfficialMetaPage(report.facebook.url);
    if (meta?.pageId) {
      report.metaPageId = meta.pageId;
      report.metaPageName = meta.pageName ?? null;
      report.metaAdsLibrary = {
        label: "Meta Ads Library",
        url: metaAdsLibraryUrl(meta.pageId),
        validated: true,
        reason:
          typeof meta.adsProbeCount === "number"
            ? `Page ID officiel validee par Graph (${meta.adsProbeCount} publicite(s) sondee(s))`
            : "Page ID officiel validee par Graph",
        source: "meta_graph",
      };
    }
  }

  const validatedCount = [
    "site",
    "instagram",
    "tiktok",
    "x",
    "youtube",
    "facebook",
    "linkedin",
    "appStore",
    "googlePlay",
    "metaAdsLibrary",
  ].filter((key) => report[key as OfficialLinkKey].validated).length;
  report.confidence = Math.min(1, validatedCount / 10);
  return report;
}

export async function resolveOfficialBrandLinksCached(app: AppDetail): Promise<OfficialBrandLinksReport> {
  const run = unstable_cache(
    async () => resolveOfficialBrandLinks(app),
    [
      "official-brand-links-v3",
      app.id,
      app.name.trim().toLowerCase(),
      app.sellerName.trim().toLowerCase(),
      app.sellerUrl.trim().toLowerCase(),
      app.supportUrl.trim().toLowerCase(),
    ],
    { revalidate: 60 * 60 * 24 },
  );
  return run();
}

export function officialLinkFallbackText(link: OfficialLinkValidation): string {
  return link.validated && link.url ? link.url : "pas de lien officiel validé";
}
