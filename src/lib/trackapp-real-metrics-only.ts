import type { IosAggregateAppMetrics } from "@/lib/apple-charts";
import {
  isTrackerAggregateDisplayReady,
  METRICS_TO_FIX,
  TRACKAPP_METRICS_UNAVAILABLE_LABEL,
  type TrackappAppDisplayMetrics,
} from "@/lib/trackapp-app-display-metrics";
import { formatShowcaseRevenueEurCompactFromLabel } from "@/lib/showcase-revenue-display";
import {
  finalizeTrackappDownloadsLabel,
  finalizeTrackappRevenueEurLabel,
  formatTrackappLiveSearchRevenueEur,
  hasAnyTrackerAggregateSignal,
  TRACKAPP_ZERO_REVENUE_MAX_USD,
} from "@/lib/trackapp-revenue-display";

export { METRICS_TO_FIX, TRACKAPP_METRICS_UNAVAILABLE_LABEL };

/** Revenu USD brut pour graphiques marché — uniquement si Sensor Tower a livré un agrégat. */
export function sensorTowerRevenueUsdOrNull(agg: IosAggregateAppMetrics | null | undefined): number | null {
  if (!agg || !hasAnyTrackerAggregateSignal(agg)) return null;
  if (agg.revenue <= TRACKAPP_ZERO_REVENUE_MAX_USD) return null;
  return agg.revenue;
}

/** Libellés téléchargements / revenus pour cartes (landing, embeds) — jamais d’estimation par rang. */
export function sensorTowerDownloadsLabel(
  agg: IosAggregateAppMetrics | null | undefined,
): string {
  if (!isTrackerAggregateDisplayReady(agg) || !agg) return TRACKAPP_METRICS_UNAVAILABLE_LABEL;
  return finalizeTrackappDownloadsLabel(agg.downloadsString.toUpperCase());
}

export function sensorTowerRevenueLabel(
  agg: IosAggregateAppMetrics | null | undefined,
  appId?: string,
): string {
  if (!hasAnyTrackerAggregateSignal(agg) || !agg) return TRACKAPP_METRICS_UNAVAILABLE_LABEL;
  return finalizeTrackappRevenueEurLabel(formatTrackappLiveSearchRevenueEur(agg, appId ?? ""));
}

/** CA mensuel showcase (EUR) — Sensor Tower uniquement. */
export function sensorTowerShowcaseMonthlyLabel(
  agg: IosAggregateAppMetrics | null | undefined,
  appId: string,
): string | null {
  const eurLabel = sensorTowerRevenueLabel(agg, appId);
  if (eurLabel === TRACKAPP_METRICS_UNAVAILABLE_LABEL || eurLabel === "—") return null;
  const compact = formatShowcaseRevenueEurCompactFromLabel(eurLabel);
  if (compact === "—") return null;
  return `${compact} / mois`;
}

export function formatDisplayMetricsDownloads(m: TrackappAppDisplayMetrics): string {
  return finalizeTrackappDownloadsLabel(m.downloadsDisplay);
}

export function formatDisplayMetricsRevenue(m: TrackappAppDisplayMetrics): string {
  return finalizeTrackappRevenueEurLabel(m.revenueDisplay);
}
