import { NextResponse } from "next/server";

import { normalizeTrackerCountryParam, type CountryCode } from "@/lib/apple-charts";
import {
  resolveTrackappMetricsForAppIds,
  TRACKAPP_METRICS_UNAVAILABLE_LABEL,
} from "@/lib/trackapp-app-display-metrics";
import { finalizeTrackappRevenueEurLabel } from "@/lib/trackapp-revenue-display";

function revenueForSearchRow(revenueDisplay: string): string {
  if (revenueDisplay === TRACKAPP_METRICS_UNAVAILABLE_LABEL) return "—";
  const raw = revenueDisplay || "—";
  return raw === "—" ? raw : finalizeTrackappRevenueEurLabel(raw);
}

export const maxDuration = 30;

export async function POST(req: Request) {
  let body: { appIds?: unknown; country?: unknown };
  try {
    body = (await req.json()) as { appIds?: unknown; country?: unknown };
  } catch {
    return NextResponse.json({ metrics: {} }, { status: 400 });
  }

  const appIds = Array.isArray(body.appIds)
    ? body.appIds.map((id) => String(id).trim()).filter(Boolean)
    : [];
  const country = normalizeTrackerCountryParam(
    typeof body.country === "string" ? body.country : null,
  ) as CountryCode;

  if (appIds.length === 0) {
    return NextResponse.json({ metrics: {} }, { status: 200 });
  }

  try {
    const map = await resolveTrackappMetricsForAppIds(appIds.slice(0, 24), country);
    const metrics: Record<
      string,
      {
        revenueDisplay: string;
        metricSource: string;
        sortRevenueUsd: number;
        sortDownloads: number;
      }
    > = {};

    for (const [id, m] of map) {
      metrics[id] = {
        revenueDisplay: revenueForSearchRow(m.revenueDisplay),
        metricSource: m.metricSource,
        sortRevenueUsd: m.sortRevenueUsd,
        sortDownloads: m.sortDownloads,
      };
    }

    return NextResponse.json(
      { metrics },
      {
        status: 200,
        headers: { "Cache-Control": "private, no-store, max-age=0" },
      },
    );
  } catch {
    return NextResponse.json({ metrics: {} }, { status: 200 });
  }
}
