import {
  extractOpenAiResponseText,
  readOpenAiResponsesError,
} from "@/lib/openai-responses";
import type { CompetitorAnalysisContext } from "@/lib/trackapp-competitor-intelligence/build-context";
import { buildCompetitorAnalysisUserPrompt } from "@/lib/trackapp-competitor-intelligence/prompts";
import { COMPETITOR_INTELLIGENCE_JSON_SCHEMA } from "@/lib/trackapp-competitor-intelligence/schema";
import type {
  CompetitorCandidate,
  CompetitorConfidence,
  CompetitorIntelligenceReport,
  CompetitorType,
} from "@/lib/trackapp-competitor-intelligence/types";

export type CompetitorAnalyzeFailure =
  | "openai_http"
  | "openai_empty"
  | "openai_parse"
  | "openai_report_parse";

export type CompetitorAnalyzeResult = Readonly<{
  report: CompetitorIntelligenceReport | null;
  failure?: CompetitorAnalyzeFailure;
  failureDetail?: string;
}>;

function asString(v: unknown, fallback = ""): string {
  return typeof v === "string" ? v.trim() : fallback;
}

function asStringArray(v: unknown, max = 12): string[] {
  if (!Array.isArray(v)) return [];
  return v
    .map((x) => (typeof x === "string" ? x.trim() : ""))
    .filter(Boolean)
    .slice(0, max);
}

function asNullableUrl(v: unknown): string | null {
  const s = asString(v);
  if (!s) return null;
  return /^https?:\/\//i.test(s) ? s : null;
}

function asType(v: unknown): CompetitorType {
  const s = asString(v);
  if (s === "direct" || s === "close" || s === "indirect" || s === "old" || s === "rising") {
    return s;
  }
  return "close";
}

function asConfidence(v: unknown): CompetitorConfidence {
  const s = asString(v);
  if (s === "high" || s === "medium" || s === "low") return s;
  return "medium";
}

function parseCompetitor(raw: unknown): CompetitorCandidate | null {
  if (!raw || typeof raw !== "object") return null;
  const o = raw as Record<string, unknown>;
  const name = asString(o.name);
  if (!name) return null;

  const traction = (o.traction_signals as Record<string, unknown> | undefined) ?? {};
  const social = (o.social_links as Record<string, unknown> | undefined) ?? {};

  return {
    name,
    type: asType(o.type),
    similarity_score: Math.max(
      0,
      Math.min(100, typeof o.similarity_score === "number" ? o.similarity_score : 50),
    ),
    reason: asString(o.reason, "Concurrent identifié par analyse marché."),
    app_store_url: asNullableUrl(o.app_store_url),
    google_play_url: asNullableUrl(o.google_play_url),
    website: asNullableUrl(o.website),
    category: asString(o.category, "App"),
    description: asString(o.description).slice(0, 500),
    shared_features: asStringArray(o.shared_features, 8),
    differences: asStringArray(o.differences, 8),
    target_user: asString(o.target_user),
    pricing: asString(o.pricing, "—"),
    traction_signals: {
      rating: asString(traction.rating, "—"),
      reviews_count: asString(traction.reviews_count, "—"),
      social_activity: asString(traction.social_activity, "—"),
      ads_activity: asString(traction.ads_activity, "—"),
      ranking: asString(traction.ranking, "—"),
    },
    social_links: {
      instagram: asString(social.instagram),
      tiktok: asString(social.tiktok),
      x: asString(social.x),
      youtube: asString(social.youtube),
      facebook: asString(social.facebook),
      linkedin: asString(social.linkedin),
    },
    meta_ads_library: asNullableUrl(o.meta_ads_library),
    confidence: asConfidence(o.confidence),
  };
}

function parseReport(raw: unknown, ctx: CompetitorAnalysisContext): CompetitorIntelligenceReport | null {
  if (!raw || typeof raw !== "object") return null;
  const o = raw as Record<string, unknown>;
  const source = (o.source_app as Record<string, unknown> | undefined) ?? {};
  const understanding = (o.understanding as Record<string, unknown> | undefined) ?? {};

  const competitors = (Array.isArray(o.competitors) ? o.competitors : [])
    .map(parseCompetitor)
    .filter((c): c is CompetitorCandidate => c !== null)
    .sort((a, b) => b.similarity_score - a.similarity_score);

  const rejected = (Array.isArray(o.rejected_apps) ? o.rejected_apps : [])
    .map((item) => {
      if (!item || typeof item !== "object") return null;
      const r = item as Record<string, unknown>;
      const name = asString(r.name);
      const reason = asString(r.reason);
      if (!name || !reason) return null;
      return { name, reason };
    })
    .filter((x): x is { name: string; reason: string } => x !== null);

  const categories = (Array.isArray(o.competitor_categories) ? o.competitor_categories : [])
    .map((item) => {
      if (!item || typeof item !== "object") return null;
      const c = item as Record<string, unknown>;
      const name = asString(c.name);
      if (!name) return null;
      return {
        name,
        description: asString(c.description),
        apps: asStringArray(c.apps, 12),
      };
    })
    .filter((x): x is { name: string; description: string; apps: string[] } => x !== null);

  return {
    source_app: {
      name: asString(source.name, ctx.app.name),
      core_problem: asString(source.core_problem, asString(understanding.core_problem)),
      target_user: asString(source.target_user, asString(understanding.target_user)),
      category: asString(source.category, ctx.app.primaryGenreName || "App"),
      positioning: asString(source.positioning, asString(understanding.positioning)),
      main_features: asStringArray(source.main_features, 12).length
        ? asStringArray(source.main_features, 12)
        : asStringArray(understanding.main_features, 12),
      not_competitors: asStringArray(source.not_competitors, 10).length
        ? asStringArray(source.not_competitors, 10)
        : asStringArray(understanding.not_competitors, 10),
    },
    understanding: {
      core_problem: asString(understanding.core_problem),
      target_user: asString(understanding.target_user),
      main_use_case: asString(understanding.main_use_case),
      secondary_use_cases: asStringArray(understanding.secondary_use_cases, 8),
      category: asString(understanding.category, ctx.app.primaryGenreName || "App"),
      positioning: asString(understanding.positioning),
      main_features: asStringArray(understanding.main_features, 12),
      monetization: asString(understanding.monetization, ctx.app.formattedPrice),
      marketing_angles: asStringArray(understanding.marketing_angles, 8),
      keywords: asStringArray(understanding.keywords, 16),
      not_competitors: asStringArray(understanding.not_competitors, 10),
      competitor_categories: asStringArray(understanding.competitor_categories, 8),
    },
    competitor_categories: categories,
    competitors,
    rejected_apps: rejected,
    search_queries_used: asStringArray(o.search_queries_used, 20),
    generated_at: new Date().toISOString(),
  };
}

export async function analyzeCompetitorsWithOpenAI(
  ctx: CompetitorAnalysisContext,
): Promise<CompetitorAnalyzeResult> {
  const key = process.env.OPENAI_API_KEY?.trim();
  if (!key) return { report: null };

  const model =
    process.env.TRACKAPP_COMPETITOR_OPENAI_MODEL?.trim() ||
    process.env.TRACKER_BRAND_OPENAI_MODEL?.trim() ||
    "gpt-4o-mini";

  const prompt = buildCompetitorAnalysisUserPrompt({
    app: ctx.app,
    country: ctx.country,
    revenueDisplay: ctx.revenueDisplay,
    downloadsDisplay: ctx.downloadsDisplay,
    genrePeerNames: ctx.genrePeerNames,
    officialSiteHint: ctx.officialSiteHint,
  });

  async function callOpenAi(userPrompt: string, useWebSearch: boolean): Promise<CompetitorAnalyzeResult> {
    const response = await fetch("https://api.openai.com/v1/responses", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${key}`,
        "Content-Type": "application/json",
      },
      signal: AbortSignal.timeout(58_000),
      body: JSON.stringify({
        model,
        max_output_tokens: 12_000,
        ...(useWebSearch
          ? {
              tool_choice: "auto" as const,
              include: ["web_search_call.action.sources"],
              tools: [{ type: "web_search", external_web_access: true }],
            }
          : { tool_choice: "none" as const }),
        temperature: 0.1,
        input: [
          {
            role: "system",
            content:
              "Tu identifies les vrais concurrents d'apps mobiles iOS. Sois strict : même transformation utilisateur. JSON compact obligatoire.",
          },
          { role: "user", content: userPrompt },
        ],
        text: {
          format: {
            type: "json_schema",
            name: "trackapp_competitor_intelligence",
            strict: true,
            schema: COMPETITOR_INTELLIGENCE_JSON_SCHEMA,
          },
        },
      }),
    });

    if (!response.ok) {
      const err = await readOpenAiResponsesError(response);
      console.error("[competitors] OpenAI HTTP", err.status, err.message);
      return { report: null, failure: "openai_http", failureDetail: `${err.status}: ${err.message}` };
    }

    const record = await response.json();
    const text = extractOpenAiResponseText(record);
    if (!text) {
      console.error("[competitors] OpenAI empty output", JSON.stringify(record).slice(0, 800));
      return { report: null, failure: "openai_empty", failureDetail: "Réponse OpenAI sans texte JSON" };
    }

    try {
      const parsed = JSON.parse(text) as unknown;
      const report = parseReport(parsed, ctx);
      if (!report) {
        return { report: null, failure: "openai_report_parse", failureDetail: "JSON invalide pour le rapport" };
      }
      return { report };
    } catch (e) {
      const msg = e instanceof Error ? e.message : "parse error";
      console.error("[competitors] JSON parse", msg, "len", text.length);
      return { report: null, failure: "openai_parse", failureDetail: msg };
    }
  }

  const first = await callOpenAi(prompt, true);
  if (first.report) return first;

  if (first.failure === "openai_parse" || first.failure === "openai_empty") {
    const retryPrompt = `${prompt}\n\nIMPORTANT : réponse JSON courte, max 6 concurrents, champs texte ≤ 120 caractères.`;
    const second = await callOpenAi(retryPrompt, false);
    if (second.report) return second;
    return second.failure ? second : first;
  }

  return first;
}
