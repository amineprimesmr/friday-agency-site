import {
  extractOpenAiResponseText,
  readOpenAiResponsesError,
} from "@/lib/openai-responses";
import { buildAppLabContext, type AppLabContext } from "@/lib/trackapp-applab/build-context";
import { parseAppLabReport } from "@/lib/trackapp-applab/parse-report";
import { APPLAB_SYSTEM_PROMPT, buildAppLabUserPrompt } from "@/lib/trackapp-applab/prompts";
import { APPLAB_REPORT_JSON_SCHEMA } from "@/lib/trackapp-applab/schema";
import type { AppLabAnalyzeResult } from "@/lib/trackapp-applab/types";

export async function analyzeAppLabWithOpenAI(ctx: AppLabContext): Promise<AppLabAnalyzeResult> {
  const key = process.env.OPENAI_API_KEY?.trim();
  if (!key) {
    return { report: null, failure: "openai_missing_key", failureDetail: "OPENAI_API_KEY manquant" };
  }

  const model =
    process.env.TRACKAPP_APPLAB_OPENAI_MODEL?.trim() ||
    process.env.TRACKAPP_COMPETITOR_OPENAI_MODEL?.trim() ||
    process.env.TRACKER_BRAND_OPENAI_MODEL?.trim() ||
    "gpt-4o-mini";

  const userPrompt = buildAppLabUserPrompt(ctx);

  const response = await fetch("https://api.openai.com/v1/responses", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${key}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model,
      instructions: APPLAB_SYSTEM_PROMPT,
      input: userPrompt,
      text: {
        format: {
          type: "json_schema",
          name: "applab_report",
          strict: true,
          schema: APPLAB_REPORT_JSON_SCHEMA,
        },
      },
    }),
  });

  if (!response.ok) {
    const err = await readOpenAiResponsesError(response);
    return {
      report: null,
      failure: "openai_http",
      failureDetail: `${err.status}: ${err.message}`,
    };
  }

  const data: unknown = await response.json();
  const text = extractOpenAiResponseText(data);
  if (!text) {
    return { report: null, failure: "openai_empty", failureDetail: "Réponse OpenAI vide" };
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(text);
  } catch {
    return { report: null, failure: "openai_parse", failureDetail: "JSON invalide" };
  }

  const report = parseAppLabReport(parsed, ctx);
  if (!report) {
    return { report: null, failure: "openai_parse", failureDetail: "Rapport AppLAB invalide" };
  }

  return { report };
}

export async function runAppLabAnalysis(
  appId: string,
  country: import("@/lib/apple-charts").CountryCode,
): Promise<AppLabAnalyzeResult & { context: AppLabContext | null }> {
  const context = await buildAppLabContext(appId, country);
  if (!context) {
    return { report: null, context: null, failure: "context_missing", failureDetail: "App introuvable" };
  }

  const result = await analyzeAppLabWithOpenAI(context);
  return { ...result, context };
}
