import { unstable_cache } from "next/cache";

import type { AppShowcaseVideoItem } from "@/lib/app-videos";
import { listAppShowcaseVideoItems } from "@/lib/app-videos";
import { fetchIosAggregateAppMetrics } from "@/lib/apple-charts";
import {
  deriveShowcaseMonthlyRevenueEUR,
  showcaseMonthlyRevenueCanonicalKey,
} from "@/lib/showcase-revenue-display";

export type AppShowcaseVideoItemEnriched = AppShowcaseVideoItem & {
  /** Même source que les fiches app (`fetchIosAggregateAppMetrics` → `revenueString`) quand dispo. */
  monthlyRevenueLabel: string;
};

function fallbackEurLabel(item: AppShowcaseVideoItem): string {
  const n = deriveShowcaseMonthlyRevenueEUR(
    item.approxMonthlyRevenueEUR,
    showcaseMonthlyRevenueCanonicalKey(item.displayName, item.src),
  );
  return new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 0,
  }).format(n);
}

/** Sans appels réseau — utilisé si l’enrichissement ST dépasse le budget ou échoue (évite un SSR bloqué). */
export function listAppShowcaseVideoItemsFallbackEnriched(): AppShowcaseVideoItemEnriched[] {
  return listAppShowcaseVideoItems().map((item) => ({
    ...item,
    monthlyRevenueLabel: fallbackEurLabel(item),
  }));
}

/** Enrichit les vidéos showcase avec le CA Sensor Tower (comme `/tracker/apps/[id]`). */
async function listAppShowcaseVideoItemsEnrichedCore(): Promise<AppShowcaseVideoItemEnriched[]> {
  const base = listAppShowcaseVideoItems();
  const rows = await Promise.all(
    base.map(async (item) => {
      const agg = await fetchIosAggregateAppMetrics(item.appStoreId);
      const label =
        agg && agg.revenue > 0 && agg.revenueString !== "—"
          ? `${agg.revenueString} / mois`
          : fallbackEurLabel(item);
      return { ...item, monthlyRevenueLabel: label };
    }),
  );
  return rows;
}

export const listAppShowcaseVideoItemsEnriched = unstable_cache(
  listAppShowcaseVideoItemsEnrichedCore,
  ["app-showcase-videos-enriched-v1"],
  { revalidate: 3600 },
);
