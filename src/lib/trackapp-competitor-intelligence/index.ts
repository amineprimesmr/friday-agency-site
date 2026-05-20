import { unstable_cache } from "next/cache";

import { normalizeTrackerCountryParam, type CountryCode } from "@/lib/apple-charts";
import { analyzeCompetitorsWithOpenAI } from "@/lib/trackapp-competitor-intelligence/analyze";
import { buildCompetitorAnalysisContext } from "@/lib/trackapp-competitor-intelligence/build-context";
import { hydrateCompetitorReport } from "@/lib/trackapp-competitor-intelligence/hydrate";
import type { HydratedCompetitorReport } from "@/lib/trackapp-competitor-intelligence/types";

export type { HydratedCompetitorReport, CompetitorIntelligenceReport } from "@/lib/trackapp-competitor-intelligence/types";

export type RunCompetitorIntelligenceResult = Readonly<{
  report: HydratedCompetitorReport | null;
  error: "not_found" | "openai_unavailable" | "analysis_failed" | null;
}>;

async function runUncached(appId: string, country: CountryCode): Promise<RunCompetitorIntelligenceResult> {
  const ctx = await buildCompetitorAnalysisContext(appId, country);
  if (!ctx) return { report: null, error: "not_found" };

  const raw = await analyzeCompetitorsWithOpenAI(ctx);
  if (!raw) {
    const hasKey = Boolean(process.env.OPENAI_API_KEY?.trim());
    return { report: null, error: hasKey ? "analysis_failed" : "openai_unavailable" };
  }

  const hydrated = await hydrateCompetitorReport(raw, country, appId);
  return { report: hydrated, error: null };
}

const cachedRun = unstable_cache(
  async (appId: string, country: CountryCode) => runUncached(appId, country),
  ["trackapp-competitor-intelligence-v1"],
  { revalidate: 3600 },
);

export async function runTrackappCompetitorIntelligence(
  appId: string,
  countryRaw?: string,
  options?: { bypassCache?: boolean },
): Promise<RunCompetitorIntelligenceResult> {
  const country = normalizeTrackerCountryParam(countryRaw) as CountryCode;
  const id = appId.trim();
  if (!/^\d{6,12}$/.test(id)) {
    return { report: null, error: "not_found" };
  }
  if (options?.bypassCache) return runUncached(id, country);
  return cachedRun(id, country);
}
