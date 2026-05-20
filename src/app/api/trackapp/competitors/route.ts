import { NextResponse } from "next/server";

import { runTrackappCompetitorIntelligence } from "@/lib/trackapp-competitor-intelligence";

export const maxDuration = 60;

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const appId = (searchParams.get("appId") ?? searchParams.get("id") ?? "").trim();
  const country = searchParams.get("country") ?? undefined;
  const refresh = searchParams.get("refresh") === "1";

  if (!appId) {
    return NextResponse.json({ error: "appId_required" }, { status: 400 });
  }

  try {
    const result = await runTrackappCompetitorIntelligence(appId, country, {
      bypassCache: refresh,
    });

    if (!result.report) {
      const status =
        result.error === "not_found" ? 404 : result.error === "openai_unavailable" ? 503 : 502;
      return NextResponse.json(
        {
          error: result.error ?? "analysis_failed",
          detail: result.detail ?? null,
          report: null,
        },
        { status },
      );
    }

    return NextResponse.json(
      { report: result.report, error: null },
      {
        status: 200,
        headers: {
          "Cache-Control": refresh
            ? "no-store"
            : "public, s-maxage=1800, stale-while-revalidate=7200",
        },
      },
    );
  } catch {
    return NextResponse.json({ error: "analysis_failed", report: null }, { status: 502 });
  }
}
