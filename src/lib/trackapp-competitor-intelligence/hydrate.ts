import {
  fetchAppDetail,
  fetchIosAggregateAppMetrics,
  searchApps,
  type CountryCode,
} from "@/lib/apple-charts";
import { resolveTrackappAppDisplayMetrics } from "@/lib/trackapp-app-display-metrics";
import {
  buildAppStoreUrl,
  extractAppStoreId,
  normalizeAppStoreUrl,
} from "@/lib/trackapp-app-store-url";
import type {
  CompetitorCandidate,
  CompetitorIntelligenceReport,
  HydratedCompetitor,
  HydratedCompetitorReport,
} from "@/lib/trackapp-competitor-intelligence/types";

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

async function isAppOnItunesStore(appId: string, country: CountryCode): Promise<boolean> {
  const detail = await fetchAppDetail(appId, country).catch(() => null);
  if (detail) return true;
  if (country !== "us") {
    const us = await fetchAppDetail(appId, "us").catch(() => null);
    if (us) return true;
  }
  return false;
}

async function resolveValidatedAppStoreUrl(
  appId: string,
  country: CountryCode,
): Promise<string | null> {
  const detail =
    (await fetchAppDetail(appId, country).catch(() => null)) ??
    (country !== "us" ? await fetchAppDetail(appId, "us").catch(() => null) : null);
  if (detail?.trackViewUrl) return detail.trackViewUrl;
  const onStore = await isAppOnItunesStore(appId, country);
  if (onStore) return buildAppStoreUrl(appId, country);
  return null;
}

async function resolveCompetitorAppId(
  candidate: CompetitorCandidate,
  country: CountryCode,
  excludeId: string,
): Promise<{
  appId: string | null;
  artworkUrl: string | null;
  artistName: string | null;
  appStoreUrl: string | null;
  appStoreUnavailable: boolean;
}> {
  const urlId = extractAppStoreId(candidate.app_store_url);
  let resolvedId: string | null = null;
  let artworkUrl: string | null = null;
  let artistName: string | null = null;

  if (urlId && urlId !== excludeId) {
    const detail = await fetchAppDetail(urlId, country).catch(() => null);
    if (detail) {
      resolvedId = detail.id;
      artworkUrl = detail.artworkUrl;
      artistName = detail.artistName;
    } else if (country !== "us") {
      const usDetail = await fetchAppDetail(urlId, "us").catch(() => null);
      if (usDetail) {
        resolvedId = usDetail.id;
        artworkUrl = usDetail.artworkUrl;
        artistName = usDetail.artistName;
      }
    }
  }

  if (!resolvedId) {
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
    if (best && best.score >= 40) {
      resolvedId = best.id;
      artworkUrl = best.artworkUrl;
      artistName = best.artistName;
    }
  }

  if (resolvedId) {
    const appStoreUrl = await resolveValidatedAppStoreUrl(resolvedId, country);
    return {
      appId: resolvedId,
      artworkUrl,
      artistName,
      appStoreUrl,
      appStoreUnavailable: !appStoreUrl,
    };
  }

  if (urlId && urlId !== excludeId) {
    const onStore = await isAppOnItunesStore(urlId, country);
    if (onStore) {
      const appStoreUrl = await resolveValidatedAppStoreUrl(urlId, country);
      return {
        appId: urlId,
        artworkUrl,
        artistName,
        appStoreUrl,
        appStoreUnavailable: !appStoreUrl,
      };
    }
    const agg = await fetchIosAggregateAppMetrics(urlId, { timeoutMs: 2500 }).catch(() => null);
    if (agg?.active !== false) {
      return {
        appId: null,
        artworkUrl: agg ? null : null,
        artistName: null,
        appStoreUrl: null,
        appStoreUnavailable: true,
      };
    }
  }

  const llmId = extractAppStoreId(candidate.app_store_url);
  const llmLooksValid = llmId && llmId !== excludeId;
  return {
    appId: null,
    artworkUrl: null,
    artistName: null,
    appStoreUrl: null,
    appStoreUnavailable: Boolean(llmLooksValid || candidate.app_store_url),
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

      let app_store_url = resolved.appStoreUrl;
      if (!app_store_url && resolved.appId && !resolved.appStoreUnavailable) {
        app_store_url = normalizeAppStoreUrl(candidate.app_store_url, resolved.appId, country);
      }
      if (resolved.appStoreUnavailable) {
        app_store_url = null;
      } else if (app_store_url && resolved.appId) {
        const idInUrl = extractAppStoreId(app_store_url);
        if (idInUrl && idInUrl !== resolved.appId) {
          app_store_url = buildAppStoreUrl(resolved.appId, country);
        }
      }

      return {
        ...candidate,
        app_id: resolved.appId,
        artwork_url: resolved.artworkUrl,
        artist_name: resolved.artistName,
        app_store_url,
        app_store_unavailable: resolved.appStoreUnavailable,
        trackapp_metrics,
      };
    }),
  );

  return { ...report, competitors: hydrated };
}
