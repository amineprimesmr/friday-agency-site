import type { TrackappAppDisplayMetrics } from "@/lib/trackapp-app-display-metrics";
import { TRACKAPP_METRICS_UNAVAILABLE_LABEL } from "@/lib/trackapp-app-display-metrics";
import { finalizeTrackappRevenueEurLabel } from "@/lib/trackapp-revenue-display";

/** Libellé revenu mensuel pour tuiles landing (aligné fiches Trackapp). */
export function trackappMonthlyPickRevenueHint(metrics: TrackappAppDisplayMetrics): string {
  const rev = finalizeTrackappRevenueEurLabel(metrics.revenueDisplay);
  if (rev === TRACKAPP_METRICS_UNAVAILABLE_LABEL || rev === "—") return rev;
  return `${rev} / mois`;
}
