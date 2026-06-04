import type { AppDetail } from "@/lib/apple-charts";
import { extractOpenAiResponseText, extractWebSearchSourceUrls } from "@/lib/openai-responses";
import {
  OFFICIAL_BRAND_OSINT_SYSTEM_PROMPT,
  OFFICIAL_BRAND_OSINT_USER_SUFFIX,
} from "@/lib/official-brand-osint-prompt";
import { resolveOfficialSiteHomeUrl } from "@/lib/official-brand-site-home";
import { getBrandOsintOpenAiModel } from "@/lib/openai-brand-model";
import { isPlausibleMetaPageId } from "@/lib/meta-page-id-plausible";
import { cleanUrl, isHttpUrl, parseUrl } from "@/lib/social-discovery/normalizeUrls";
import type { OpenAiWebDiscovery } from "@/lib/social-discovery/findOfficialWebsite";

function pickUrl(v: unknown): string | null {
  if (typeof v !== "string") return null;
  const url = parseUrl(v);
  return url && isHttpUrl(url) ? cleanUrl(url) : null;
}

function mergeDiscoverySources(
  parsed: Record<string, unknown>,
  responseJson: unknown,
): string[] {
  const urls = new Set<string>(extractWebSearchSourceUrls(responseJson));
  for (const v of pickSources(parsed.sources)) urls.add(v);
  for (const key of [
    "site_url",
    "instagram_url",
    "tiktok_url",
    "x_url",
    "youtube_url",
    "facebook_url",
    "linkedin_url",
    "threads_url",
    "app_store_url",
    "google_play_url",
  ]) {
    const u = pickUrl(parsed[key]);
    if (u) urls.add(u);
  }
  return [...urls].slice(0, 24);
}

function pickSources(v: unknown): string[] {
  if (!Array.isArray(v)) return [];
  return v
    .map((x) => (typeof x === "string" ? x.trim() : ""))
    .filter((x) => /^https:\/\//i.test(x))
    .slice(0, 12);
}

export function isOpenAiDiscoveryConfigured(): boolean {
  return Boolean(process.env.OPENAI_API_KEY?.trim());
}

export async function runOpenAiWebDiscovery(
  app: AppDetail,
  officialSiteHint: string | null,
): Promise<OpenAiWebDiscovery | null> {
  const key = process.env.OPENAI_API_KEY?.trim();
  if (!key) return null;

  const model = getBrandOsintOpenAiModel();
  const response = await fetch("https://api.openai.com/v1/responses", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${key}`,
      "Content-Type": "application/json",
    },
    signal: AbortSignal.timeout(90_000),
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
              threads_url: { type: ["string", "null"] },
              app_store_url: { type: ["string", "null"] },
              google_play_url: { type: ["string", "null"] },
              meta_page_id: { type: ["string", "null"] },
              sources: { type: "array", items: { type: "string" }, maxItems: 12 },
            },
            required: [
              "site_url",
              "instagram_url",
              "tiktok_url",
              "x_url",
              "youtube_url",
              "facebook_url",
              "linkedin_url",
              "threads_url",
              "app_store_url",
              "google_play_url",
              "meta_page_id",
              "sources",
            ],
          },
        },
      },
      input: [
        { role: "system", content: OFFICIAL_BRAND_OSINT_SYSTEM_PROMPT },
        {
          role: "user",
          content: [
            `App: ${app.name}`,
            `App Store ID: ${app.id}`,
            `App Store URL: ${app.trackViewUrl}`,
            `Developer/Seller: ${app.sellerName || app.artistName}`,
            `Bundle ID: ${app.bundleId}`,
            `Site hint: ${officialSiteHint || app.sellerUrl || "none"}`,
            "",
            OFFICIAL_BRAND_OSINT_USER_SUFFIX,
            "",
            (app.description ?? "").slice(0, 1200),
          ].join("\n"),
        },
      ],
    }),
  });

  if (!response.ok) return null;
  const responseJson = await response.json();
  const text = extractOpenAiResponseText(responseJson);
  if (!text) return null;

  try {
    const parsed = JSON.parse(text) as Record<string, unknown>;
    const rawSite = pickUrl(parsed.site_url);
    return {
      site_url: rawSite ? resolveOfficialSiteHomeUrl(rawSite) : null,
      instagram_url: pickUrl(parsed.instagram_url),
      tiktok_url: pickUrl(parsed.tiktok_url),
      x_url: pickUrl(parsed.x_url),
      youtube_url: pickUrl(parsed.youtube_url),
      facebook_url: pickUrl(parsed.facebook_url),
      linkedin_url: pickUrl(parsed.linkedin_url),
      threads_url: pickUrl(parsed.threads_url),
      app_store_url: pickUrl(parsed.app_store_url),
      google_play_url: pickUrl(parsed.google_play_url),
      meta_page_id:
        typeof parsed.meta_page_id === "string" && isPlausibleMetaPageId(parsed.meta_page_id)
          ? parsed.meta_page_id.trim()
          : null,
      sources: mergeDiscoverySources(parsed, responseJson),
    };
  } catch {
    return null;
  }
}
