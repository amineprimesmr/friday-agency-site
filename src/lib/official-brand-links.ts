import { unstable_cache } from "next/cache";

import type { AppDetail } from "@/lib/apple-charts";
import {
  OFFICIAL_BRAND_OSINT_SYSTEM_PROMPT,
  OFFICIAL_BRAND_OSINT_USER_SUFFIX,
} from "@/lib/official-brand-osint-prompt";
import {
  facebookGraphIdentifierFromUrl,
  resolveFacebookPageNode,
} from "@/lib/meta-page-resolve";
import { detectProfileFromUrl, type DetectedSocialProfile } from "@/lib/social-presence";
import { buildHeuristicSocialCandidates } from "@/lib/official-brand-social-candidates";
import { affirmOfficialSocialProfile, isSocialBioAffirmConfigured } from "@/lib/official-brand-social-affirm";
import { VERIFIED_OFFICIAL_SOCIAL_OVERRIDES } from "@/lib/official-brand-social-overrides";
import {
  isLegalOrPolicySitePath,
  resolveOfficialSiteHomeUrl,
  scoreOfficialSiteCandidate,
} from "@/lib/official-brand-site-home";
import { urlHasWebEvidence, verifyOutboundUrl } from "@/lib/official-brand-url-verify";

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
  source: "app_store" | "official_site" | "openai_web" | "meta_graph" | "profile_verify" | "not_found";
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

const SOCIAL_KEYS: Array<
  Exclude<OfficialLinkKey, "site" | "appStore" | "googlePlay" | "metaAdsLibrary">
> = ["instagram", "tiktok", "x", "youtube", "facebook", "linkedin"];

async function tryAcceptLink(
  report: OfficialBrandLinksReport,
  key: OfficialLinkKey,
  url: string,
  source: OfficialLinkValidation["source"],
  reasonPrefix: string,
  options?: { skipHttpVerify?: boolean },
): Promise<boolean> {
  const classified = classifyOutputKey(url);
  if (classified !== key) return false;

  if (key === "metaAdsLibrary") {
    const pageId = metaPageIdFromAdLibraryUrl(url);
    if (!pageId) return false;
    const verify = await verifyOutboundUrl(url, "metaAdsLibrary");
    if (!verify.ok) return false;
    report.metaPageId = pageId;
    report[key] = {
      label: report[key].label,
      url: metaAdsLibraryUrl(pageId),
      validated: true,
      reason: `${reasonPrefix} — ${verify.reason}`,
      source,
    };
    return true;
  }

  if (!options?.skipHttpVerify) {
    const verifyPlatform: Parameters<typeof verifyOutboundUrl>[1] =
      key === "site"
        ? "site"
        : SOCIAL_KEYS.includes(key as (typeof SOCIAL_KEYS)[number])
          ? (key as (typeof SOCIAL_KEYS)[number])
          : undefined;
    const verify = await verifyOutboundUrl(url, verifyPlatform);
    if (!verify.ok) {
      report[key] = emptyLink(report[key].label, `pas de lien officiel validé (${verify.reason})`);
      return false;
    }

    if (key === "facebook" && process.env.META_AD_LIBRARY_ACCESS_TOKEN?.trim()) {
      const meta = await resolveOfficialMetaPage(url);
      if (!meta?.pageId) {
        report[key] = emptyLink(
          report[key].label,
          "pas de lien officiel validé (page Facebook introuvable via Graph API)",
        );
        return false;
      }
    }
  }

  report[key] = {
    label: report[key].label,
    url,
    validated: true,
    reason: reasonPrefix,
    source,
  };
  return true;
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

function metaPageIdFromAdLibraryUrl(raw: string | null): string | null {
  if (!raw) return null;
  const url = parseUrl(raw);
  if (!url) return null;
  const pageId = url.searchParams.get("view_all_page_id")?.trim();
  return pageId && /^\d{6,24}$/.test(pageId) ? pageId : null;
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
    signal: AbortSignal.timeout(55_000),
    body: JSON.stringify({
      model,
      tool_choice: "auto",
      include: ["web_search_call.action.sources"],
      temperature: 0,
      tools: [{ type: "web_search", external_web_access: true }],
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
          content: OFFICIAL_BRAND_OSINT_SYSTEM_PROMPT,
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
            OFFICIAL_BRAND_OSINT_USER_SUFFIX,
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
    const rawSite = pickUrl(parsed.site_url);
    return {
      site_url: rawSite ? resolveOfficialSiteHomeUrl(rawSite) : null,
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

function toOfficialSiteHomeUrl(raw: string | URL | undefined | null): URL | null {
  if (!raw) return null;
  const home = resolveOfficialSiteHomeUrl(raw);
  return home ? parseUrl(home) : null;
}

/** Choisit le meilleur lien « site » App Store et le ramène toujours vers la home (pas /terms, /privacy). */
function pickBestOfficialSiteFromApp(app: AppDetail): URL | null {
  const candidates: URL[] = [];
  const seen = new Set<string>();

  const add = (raw: string | undefined | null) => {
    const candidate = isLikelyOfficialSiteCandidate(raw);
    if (!candidate) return;
    const key = `${hostWithoutWww(candidate)}${candidate.pathname}`;
    if (seen.has(key)) return;
    seen.add(key);
    candidates.push(candidate);
  };

  add(app.sellerUrl);
  add(app.supportUrl);
  for (const raw of urlsFromText(app.description ?? "")) add(raw);
  for (const raw of urlsFromText(app.releaseNotes ?? "")) add(raw);

  if (candidates.length === 0) return null;

  let best = candidates[0]!;
  let bestScore = scoreOfficialSiteCandidate(best);
  for (let i = 1; i < candidates.length; i += 1) {
    const c = candidates[i]!;
    const s = scoreOfficialSiteCandidate(c);
    if (s > bestScore) {
      best = c;
      bestScore = s;
    }
  }

  return toOfficialSiteHomeUrl(best);
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

/** Liens sameAs (schema.org) — souvent les seuls réseaux sur sites marketing sans footer social. */
function extractJsonLdSameAs(html: string): string[] {
  const out: string[] = [];
  const seen = new Set<string>();
  const re = /<script[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi;
  let m: RegExpExecArray | null;

  const pushUrl = (raw: unknown) => {
    const url = pickUrl(typeof raw === "string" ? raw : null);
    if (!url || seen.has(url)) return;
    seen.add(url);
    out.push(url);
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
        if (record["@graph"] && Array.isArray(record["@graph"])) {
          for (const child of record["@graph"]) {
            if (!child || typeof child !== "object") continue;
            const childSame = (child as Record<string, unknown>).sameAs;
            if (typeof childSame === "string") pushUrl(childSame);
            else if (Array.isArray(childSame)) {
              for (const entry of childSame) pushUrl(entry);
            }
          }
        }
      }
    } catch {
      // JSON-LD invalide — ignorer
    }
  }
  return out;
}

/** Évite les faux positifs TikTok/Instagram dans le JS minifié (widgets, analytics). */
function collectSiteOutboundLinks(html: string, baseUrl: string): string[] {
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
  for (const href of extractLiteralUrls(html)) {
    const key = classifyOutputKey(href);
    if (key && SOCIAL_KEYS.includes(key as (typeof SOCIAL_KEYS)[number])) continue;
    push(href);
  }
  return out;
}

async function tryApplyVerifiedSocialOverrides(
  report: OfficialBrandLinksReport,
  app: AppDetail,
  seenAccepted: Set<OfficialLinkKey>,
): Promise<void> {
  const row = VERIFIED_OFFICIAL_SOCIAL_OVERRIDES[String(app.id)];
  if (!row) return;

  const officialSiteUrl = report.site.validated ? report.site.url : null;

  for (const platform of ["instagram", "tiktok"] as const) {
    const url = row[platform];
    if (!url || report[platform].validated) continue;

    if (
      await tryAcceptLink(
        report,
        platform,
        url,
        "profile_verify",
        "compte vérifié manuellement (liste blanche Trackapp)",
      )
    ) {
      seenAccepted.add(platform);
    }
  }
}

async function tryDiscoverSocialFromHeuristics(
  report: OfficialBrandLinksReport,
  app: AppDetail,
  seenAccepted: Set<OfficialLinkKey>,
): Promise<void> {
  if (!isSocialBioAffirmConfigured()) return;

  const officialSiteUrl = report.site.validated ? report.site.url : null;
  const candidates = buildHeuristicSocialCandidates(app);

  for (const platform of ["instagram", "tiktok"] as const) {
    if (report[platform].validated) continue;

    for (const candidate of candidates.filter((c) => c.platform === platform)) {
      const affirm = await affirmOfficialSocialProfile(platform, candidate.url, app, officialSiteUrl, {
        strictBrandSlug: true,
      });
      if (!affirm.ok) continue;

      if (
        await tryAcceptLink(
          report,
          platform,
          candidate.url,
          "profile_verify",
          `handle dérivé du site / nom d'app — ${affirm.reason}`,
        )
      ) {
        seenAccepted.add(platform);
        break;
      }
    }
  }
}

async function tryDiscoverSocialFromWebSearch(
  report: OfficialBrandLinksReport,
  app: AppDetail,
  ai: OpenAiOfficialLinks | null,
  seenAccepted: Set<OfficialLinkKey>,
): Promise<void> {
  if (!ai) return;

  const officialSiteUrl = report.site.validated ? report.site.url : null;
  const aiSources = ai.sources ?? [];

  const candidates: Array<{
    key: (typeof SOCIAL_KEYS)[number];
    url: string;
    note: string;
  }> = [
    { key: "instagram", url: ai.instagram_url ?? "", note: ai.validation_notes.instagram },
    { key: "tiktok", url: ai.tiktok_url ?? "", note: ai.validation_notes.tiktok },
    { key: "x", url: ai.x_url ?? "", note: ai.validation_notes.x },
    { key: "youtube", url: ai.youtube_url ?? "", note: ai.validation_notes.youtube },
    { key: "facebook", url: ai.facebook_url ?? "", note: ai.validation_notes.facebook },
    { key: "linkedin", url: ai.linkedin_url ?? "", note: ai.validation_notes.linkedin },
  ].filter((row): row is { key: (typeof SOCIAL_KEYS)[number]; url: string; note: string } =>
    Boolean(row.url && !seenAccepted.has(row.key as OfficialLinkKey)),
  );

  for (const candidate of candidates) {
    if (!urlHasWebEvidence(candidate.url, aiSources)) continue;

    if (candidate.key === "instagram" || candidate.key === "tiktok") {
      if (!isSocialBioAffirmConfigured()) continue;
      const affirm = await affirmOfficialSocialProfile(candidate.key, candidate.url, app, officialSiteUrl);
      if (!affirm.ok) continue;
      if (
        await tryAcceptLink(
          report,
          candidate.key,
          candidate.url,
          "openai_web",
          `${candidate.note || "recherche web"} — ${affirm.reason}`,
        )
      ) {
        seenAccepted.add(candidate.key);
      }
      continue;
    }

    if (
      await tryAcceptLink(
        report,
        candidate.key,
        candidate.url,
        "openai_web",
        candidate.note || "lien confirmé par recherche web + vérification HTTP",
      )
    ) {
      seenAccepted.add(candidate.key);
    }
  }
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
  return false;
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
} | null> {
  const token = process.env.META_AD_LIBRARY_ACCESS_TOKEN?.trim();
  if (!token) return null;

  const identifier = facebookGraphIdentifierFromUrl(facebookUrl);
  if (!identifier) return null;

  const node = await resolveFacebookPageNode(token, identifier);
  if (!node) return null;

  return {
    pageId: node.id,
    pageName: node.name,
  };
}

async function resolveOfficialBrandLinks(app: AppDetail): Promise<OfficialBrandLinksReport> {
  const report = makeReportBase();
  const localOfficialSite = pickBestOfficialSiteFromApp(app);
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

  const rawOfficialSite =
    localOfficialSite ??
    (() => {
      const url = isLikelyOfficialSiteCandidate(ai?.site_url);
      return url;
    })();

  const officialSite = rawOfficialSite ? toOfficialSiteHomeUrl(rawOfficialSite) : null;

  if (!officialSite) return report;

  const siteUrl = cleanUrl(officialSite);
  const redirectedFromLegal =
    rawOfficialSite && isLegalOrPolicySitePath(rawOfficialSite.pathname);
  const siteVerify = await verifyOutboundUrl(siteUrl, "site");
  if (!siteVerify.ok) {
    report.site = emptyLink("Site", `pas de lien officiel validé (${siteVerify.reason})`);
    return report;
  }

  const legalNote = redirectedFromLegal
    ? " (URL App Store / IA pointait vers une page légale — home utilisée)"
    : "";

  report.site = {
    label: "Site",
    url: siteUrl,
    validated: true,
    reason: localOfficialSite
      ? `site officiel (page d'accueil) issu de la fiche App Store${legalNote} — ${siteVerify.reason}`
      : `${ai?.validation_notes.site || "site officiel validé par recherche web"}${legalNote} — ${siteVerify.reason}`,
    source: localOfficialSite ? "app_store" : "openai_web",
  };
  report.officialSiteOrigin = officialSite.origin;

  const allOutboundLinks: string[] = [];
  const scanned = new Set<string>();

  const firstHtml = await fetchHtml(cleanUrl(officialSite));
  if (firstHtml) {
    scanned.add(cleanUrl(officialSite));
    const firstLinks = collectSiteOutboundLinks(firstHtml, cleanUrl(officialSite));
    allOutboundLinks.push(...firstLinks);

    for (const scanUrl of internalScanLinks(officialSite, firstLinks)) {
      if (scanned.has(scanUrl)) continue;
      const html = await fetchHtml(scanUrl);
      if (!html) continue;
      scanned.add(scanUrl);
      allOutboundLinks.push(...collectSiteOutboundLinks(html, scanUrl));
    }
  }

  report.scannedUrls = [...scanned];
  const seenAccepted = new Set<OfficialLinkKey>();
  const manualSocial = VERIFIED_OFFICIAL_SOCIAL_OVERRIDES[String(app.id)];

  for (const raw of allOutboundLinks) {
    const key = classifyOutputKey(raw);
    if (!key || seenAccepted.has(key)) continue;

    if (key === "appStore") {
      if (!appStoreUrlIsCurrentApp(app, raw)) continue;
      if (await tryAcceptLink(report, "appStore", raw, "official_site", "lien App Store sur le site officiel")) {
        seenAccepted.add(key);
      }
      continue;
    }

    if (key === "googlePlay") {
      if (!googlePlayUrlMatchesApp(app, raw)) continue;
      if (await tryAcceptLink(report, "googlePlay", raw, "official_site", "lien Google Play sur le site officiel")) {
        seenAccepted.add(key);
      }
      continue;
    }

    if (!SOCIAL_KEYS.includes(key as (typeof SOCIAL_KEYS)[number])) continue;

    if (key === "instagram" || key === "tiktok") {
      if (manualSocial?.[key]) continue;
      if (
        await tryAcceptLink(
          report,
          key,
          raw,
          "official_site",
          "lien social trouvé sur le site officiel (footer / page)",
        )
      ) {
        seenAccepted.add(key);
      }
      continue;
    }

    if (
      await tryAcceptLink(
        report,
        key,
        raw,
        "official_site",
        "lien sortant trouvé sur le site officiel (niveau 1 — source de vérité)",
      )
    ) {
      seenAccepted.add(key);
    }
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

  const openAiStoreCandidates: Array<{
    key: OfficialLinkKey;
    url: string | null;
    note: string;
  }> = ai
    ? [
        { key: "appStore", url: ai.app_store_url, note: ai.validation_notes.app_store },
        { key: "googlePlay", url: ai.google_play_url, note: ai.validation_notes.google_play },
      ]
    : [];

  const aiSources = ai?.sources ?? [];

  for (const candidate of openAiStoreCandidates) {
    if (!candidate.url || report[candidate.key].validated) continue;
    if (candidate.key === "appStore" && !appStoreUrlIsCurrentApp(app, candidate.url)) continue;
    if (candidate.key === "googlePlay" && !googlePlayUrlMatchesApp(app, candidate.url)) continue;
    if (!urlHasWebEvidence(candidate.url, aiSources)) continue;

    await tryAcceptLink(
      report,
      candidate.key,
      candidate.url,
      "openai_web",
      candidate.note || "lien confirmé par recherche web + vérification HTTP",
    );
  }

  await tryApplyVerifiedSocialOverrides(report, app, seenAccepted);
  await tryDiscoverSocialFromHeuristics(report, app, seenAccepted);
  await tryDiscoverSocialFromWebSearch(report, app, ai, seenAccepted);

  const profiles: DetectedSocialProfile[] = [];
  for (const key of NETWORK_ORDER) {
    const link = report[key];
    if (!link.validated || !link.url) continue;
    const profile = detectProfileFromUrl(link.url);
    if (profile) profiles.push(profile);
  }
  report.socialProfiles = profiles;

  if (report.facebook.validated && report.facebook.url) {
    const meta = await resolveOfficialMetaPage(report.facebook.url);
    if (meta?.pageId) {
      report.metaPageId = meta.pageId;
      report.metaPageName = meta.pageName ?? null;
      const adsUrl = metaAdsLibraryUrl(meta.pageId);
      await tryAcceptLink(
        report,
        "metaAdsLibrary",
        adsUrl,
        "meta_graph",
        "Page ID officielle via Graph API (search_type=page, view_all_page_id)",
        { skipHttpVerify: true },
      );
    } else {
      report.metaAdsLibrary = emptyLink(
        "Meta Ads Library",
        "pas de lien officiel validé (Page ID Facebook introuvable via Graph)",
      );
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
      "official-brand-links-v15-site-home-canonical",
      isOfficialLinksOpenAiConfigured() ? "openai-on" : "openai-off",
      isSocialBioAffirmConfigured() ? "apify-affirm-on" : "apify-affirm-off",
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

/** Requis pour valider les réseaux quand le site officiel est une SPA (HTML sans liens sociaux). */
export function isOfficialLinksOpenAiConfigured(): boolean {
  return Boolean(process.env.OPENAI_API_KEY?.trim());
}
