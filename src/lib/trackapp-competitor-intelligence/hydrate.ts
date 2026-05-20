import {
  fetchAppDetail,
  searchApps,
  type CountryCode,
} from "@/lib/apple-charts";
import { resolveTrackappAppDisplayMetrics } from "@/lib/trackapp-app-display-metrics";
import type {
  CompetitorCandidate,
  CompetitorIntelligenceReport,
  HydratedCompetitor,
  HydratedCompetitorReport,
} from "@/lib/trackapp-competitor-intelligence/types";

function extractAppStoreId(url: string | null): string | null {
  if (!url) return null;
  const m = url.match(/\/id(\d{6,12})/i);
  return m?.[1] ?? null;
}

function normalizeName(name: string): string {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
}

function nameScore(a: string, b: string): number {
  const na = normalizeName(a);
  const nb = normalizeName(b);
  if (!na || !nb) return 0;
  if (na === nb) return 100;
  if (na.includes(nb) || nb.includes(na)) return 75;
  const aw = new Set(na.split(/\s+/));
  const bw = nb.split(/\s+/);
  let shared = 0;
  for (const w of bw) {
    if (w.length >= 3 && aw.has(w)) shared += 1;
  }
  return Math.min(60, shared * 18);
}

async function resolveCompetitorAppId(
  candidate: CompetitorCandidate,
  country: CountryCode,
  excludeId: string,
): Promise<{ appId: string | null; artworkUrl: string | null; artistName: string | null }> {
  const fromUrl = extractAppStoreId(candidate.app_store_url);
  if (fromUrl && fromUrl !== excludeId) {
    const detail = await fetchAppDetail(fromUrl, country).catch(() => null);
    if (detail) {
      return {
        appId: detail.id,
        artworkUrl: detail.artworkUrl,
        artistName: detail.artistName,
      };
    }
  }

  const hits = await searchApps(candidate.name, country, 8).catch(() => []);
  let best: { id: string; artworkUrl: string; artistName: string; score: number } | null = null;
  for (const hit of hits) {
    if (hit.id === excludeId) continue;
    const score = nameScore(candidate.name, hit.name);
    if (!best || score > best.score) {
      best = {
        id: hit.id,
        artworkUrl: hit.artworkUrl,
        artistName: hit.artistName,
        score,
      };
    }
  }
  if (!best || best.score < 40) {
    return { appId: null, artworkUrl: null, artistName: null };
  }
  return {
    appId: best.id,
    artworkUrl: best.artworkUrl,
    artistName: best.artistName,
  };
}

export async function hydrateCompetitorReport(
  report: CompetitorIntelligenceReport,
  country: CountryCode,
  sourceAppId: string,
): Promise<HydratedCompetitorReport> {
  const hydrated = await Promise.all(
    report.competitors.map(async (candidate): Promise<HydratedCompetitor> => {
      const resolved = await resolveCompetitorAppId(candidate, country, sourceAppId);
      let trackapp_metrics: HydratedCompetitor["trackapp_metrics"];
      if (resolved.appId) {
        const m = await resolveTrackappAppDisplayMetrics(resolved.appId, country).catch(() => null);
        if (m) {
          trackapp_metrics = {
            downloadsDisplay: m.downloadsDisplay,
            revenueDisplay: m.revenueDisplay,
            metricSource: m.metricSource,
          };
        }
      }
      return {
        ...candidate,
        app_id: resolved.appId,
        artwork_url: resolved.artworkUrl,
        artist_name: resolved.artistName,
        trackapp_metrics,
      };
    }),
  );

  return { ...report, competitors: hydrated };
}
