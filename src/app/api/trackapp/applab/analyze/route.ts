import { NextResponse } from "next/server";

import { normalizeTrackerCountryParam } from "@/lib/apple-charts";
import { loadAppLabReportCached, refreshAppLabReport } from "@/lib/trackapp-applab/load-report";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 120;

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id")?.trim();
  const country = normalizeTrackerCountryParam(searchParams.get("country") ?? undefined);
  const refresh = searchParams.get("refresh") === "1";

  if (!id) {
    return NextResponse.json({ error: "Paramètre id requis." }, { status: 400 });
  }

  const result = refresh
    ? await refreshAppLabReport(id, country)
    : await loadAppLabReportCached(id, country);

  if (!result.report) {
    return NextResponse.json(
      {
        ok: false,
        error: result.failureDetail ?? result.failure ?? "analysis_failed",
        failure: result.failure,
      },
      { status: result.failure === "openai_missing_key" ? 503 : 502 },
    );
  }

  return NextResponse.json({ ok: true, report: result.report });
}
