import type { TrackappAppDisplayMetrics } from "@/lib/trackapp-app-display-metrics";

/** myfidpass — affichage métriques demandé (override local, pas Sensor Tower). */
export const MYFIDPASS_APP_ID = "6759921605";

const APP_DISPLAY_OVERRIDES: Readonly<
  Record<
    string,
    Pick<
      TrackappAppDisplayMetrics,
      "downloadsDisplay" | "revenueDisplay" | "sortDownloads" | "sortRevenueUsd"
    >
  >
> = {
  [MYFIDPASS_APP_ID]: {
    downloadsDisplay: "6K",
    revenueDisplay: "12 497 €",
    sortDownloads: 6_000,
    sortRevenueUsd: 12_497,
  },
};

export function getTrackappAppDisplayOverride(
  appId: string,
): (typeof APP_DISPLAY_OVERRIDES)[string] | undefined {
  return APP_DISPLAY_OVERRIDES[appId];
}

/** Applique les valeurs d’affichage réservées à certaines apps (une seule entrée pour l’instant). */
export function applyTrackappAppDisplayOverride(
  appId: string,
  metrics: TrackappAppDisplayMetrics,
): TrackappAppDisplayMetrics {
  const patch = getTrackappAppDisplayOverride(appId);
  if (!patch) return metrics;
  return { ...metrics, ...patch };
}
