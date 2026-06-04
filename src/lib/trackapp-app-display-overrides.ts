import type { TrackappAppDisplayMetrics } from "@/lib/trackapp-app-display-metrics";

/**
 * Overrides d’affichage métriques — désactivés.
 * Trackapp n’affiche que des agrégats Sensor Tower ou « Indisponible — à corriger ».
 */
export function getTrackappAppDisplayOverride(_appId: string): undefined {
  return undefined;
}

export function applyTrackappAppDisplayOverride(
  _appId: string,
  metrics: TrackappAppDisplayMetrics,
): TrackappAppDisplayMetrics {
  return metrics;
}
