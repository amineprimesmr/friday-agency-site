import { unstable_cache } from "next/cache";

import type { CountryCode } from "@/lib/apple-charts";
import { runAppLabAnalysis } from "@/lib/trackapp-applab/analyze";
import type { AppLabAnalyzeResult } from "@/lib/trackapp-applab/types";

async function loadAppLabReportUncached(
  appId: string,
  country: CountryCode,
): Promise<AppLabAnalyzeResult> {
  const { context: _ctx, ...result } = await runAppLabAnalysis(appId, country);
  return result;
}

export async function loadAppLabReportCached(
  appId: string,
  country: CountryCode,
): Promise<AppLabAnalyzeResult> {
  const run = unstable_cache(
    async () => loadAppLabReportUncached(appId, country),
    [
      "trackapp-applab-report-v2",
      process.env.OPENAI_API_KEY?.trim() ? "openai-on" : "openai-off",
      appId,
      country,
    ],
    { revalidate: 60 * 60 * 12 },
  );
  return run();
}

export async function refreshAppLabReport(
  appId: string,
  country: CountryCode,
): Promise<AppLabAnalyzeResult> {
  return loadAppLabReportUncached(appId, country);
}
