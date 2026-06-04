import {
  extractOpenAiResponseText,
  readOpenAiResponsesError,
} from "@/lib/openai-responses";

export type ApplabProjectOpenAiFailure =
  | "openai_missing_key"
  | "openai_http"
  | "openai_empty"
  | "openai_parse";

export type ApplabProjectOpenAiResult<T> = Readonly<{
  data: T | null;
  failure?: ApplabProjectOpenAiFailure;
  failureDetail?: string;
}>;

export function getApplabProjectOpenAiModel(): string {
  return (
    process.env.TRACKAPP_APPLAB_OPENAI_MODEL?.trim() ||
    process.env.TRACKAPP_COMPETITOR_OPENAI_MODEL?.trim() ||
    process.env.TRACKER_BRAND_OPENAI_MODEL?.trim() ||
    "gpt-4o-mini"
  );
}

export async function callApplabProjectOpenAi<T>(options: {
  instructions: string;
  input: string;
  schemaName: string;
  schema: Record<string, unknown>;
  timeoutMs?: number;
}): Promise<ApplabProjectOpenAiResult<T>> {
  const key = process.env.OPENAI_API_KEY?.trim();
  if (!key) {
    return { data: null, failure: "openai_missing_key", failureDetail: "OPENAI_API_KEY manquant" };
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), options.timeoutMs ?? 55_000);

  try {
    const response = await fetch("https://api.openai.com/v1/responses", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${key}`,
        "Content-Type": "application/json",
      },
      signal: controller.signal,
      body: JSON.stringify({
        model: getApplabProjectOpenAiModel(),
        instructions: options.instructions,
        input: options.input,
        text: {
          format: {
            type: "json_schema",
            name: options.schemaName,
            strict: true,
            schema: options.schema,
          },
        },
      }),
    });

    if (!response.ok) {
      const err = await readOpenAiResponsesError(response);
      return {
        data: null,
        failure: "openai_http",
        failureDetail: `${err.status}: ${err.message}`,
      };
    }

    const raw: unknown = await response.json();
    const text = extractOpenAiResponseText(raw);
    if (!text) {
      return { data: null, failure: "openai_empty", failureDetail: "Réponse OpenAI vide" };
    }

    try {
      return { data: JSON.parse(text) as T };
    } catch {
      return { data: null, failure: "openai_parse", failureDetail: "JSON invalide" };
    }
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Erreur OpenAI";
    return { data: null, failure: "openai_http", failureDetail: msg };
  } finally {
    clearTimeout(timeout);
  }
}

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

export function parseUnderstanding(raw: unknown): import("./types").ApplabConceptUnderstanding | null {
  if (!raw || typeof raw !== "object") return null;
  const o = raw as Record<string, unknown>;
  const core = asString(o.core_problem);
  const niche = asString(o.niche);
  if (!core && !niche) return null;

  return {
    core_problem: core,
    target_user: asString(o.target_user, "Utilisateurs cibles non précisés"),
    main_use_case: asString(o.main_use_case, core),
    niche: niche || core,
    specific_subject: asString(o.specific_subject, niche),
    language_or_market: asString(o.language_or_market, "fr"),
    monetization: asString(o.monetization, "À définir"),
    key_features: asStringArray(o.key_features, 8),
    not_competitors: asStringArray(o.not_competitors, 10),
    search_queries: asStringArray(o.search_queries, 10),
    must_match: asStringArray(o.must_match, 8),
  };
}

export function parseClarifyingQuestions(raw: unknown): import("./types").ApplabClarifyingQuestion[] {
  if (!Array.isArray(raw)) return [];
  const out: import("./types").ApplabClarifyingQuestion[] = [];
  for (const item of raw) {
    if (!item || typeof item !== "object") continue;
    const o = item as Record<string, unknown>;
    const id = asString(o.id);
    const question = asString(o.question);
    if (!id || !question) continue;
    const hint = asString(o.hint);
    out.push(hint ? { id, question, hint } : { id, question });
  }
  return out.slice(0, 4);
}

export function parseAssessment(raw: unknown): import("./types").ApplabConceptAssessment | null {
  if (!raw || typeof raw !== "object") return null;
  const o = raw as Record<string, unknown>;
  const headline = asString(o.headline);
  const summary = asString(o.summary);
  if (!headline || !summary) return null;

  return {
    headline,
    summary,
    how_it_works: asString(o.how_it_works, summary),
    target_user: asString(o.target_user),
    monetization: asString(o.monetization),
    differentiation: asString(o.differentiation),
    mvp_features: asStringArray(o.mvp_features, 8),
    risks: asStringArray(o.risks, 4),
    build_prompt_seed: asString(o.build_prompt_seed, summary),
  };
}
