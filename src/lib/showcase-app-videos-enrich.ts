import { unstable_cache } from "next/cache";

import type { AppShowcaseVideoItem } from "@/lib/app-videos";
import { listAppShowcaseVideoItems } from "@/lib/app-videos";
import {
  deriveShowcaseMonthlyRevenueEUR,
  formatShowcaseEurMonthlyLabel,
  showcaseMonthlyRevenueCanonicalKey,
} from "@/lib/showcase-revenue-display";

export type AppShowcaseVideoItemEnriched = AppShowcaseVideoItem & {
  /** CA mensuel affiché en EUR (ex. « 100 342 € / mois »). */
  monthlyRevenueLabel: string;
};

function buildMonthlyRevenueLabel(item: AppShowcaseVideoItem): string {
  const eur = deriveShowcaseMonthlyRevenueEUR(
    item.approxMonthlyRevenueEUR,
    showcaseMonthlyRevenueCanonicalKey(item.displayName, item.src),
  );
  return formatShowcaseEurMonthlyLabel(eur);
}

/** Sans appels réseau — utilisé si l’enrichissement dépasse le budget ou échoue. */
export function listAppShowcaseVideoItemsFallbackEnriched(): AppShowcaseVideoItemEnriched[] {
  return listAppShowcaseVideoItems().map((item) => ({
    ...item,
    monthlyRevenueLabel: buildMonthlyRevenueLabel(item),
  }));
}

async function listAppShowcaseVideoItemsEnrichedCore(): Promise<AppShowcaseVideoItemEnriched[]> {
  return listAppShowcaseVideoItems().map((item) => ({
    ...item,
    monthlyRevenueLabel: buildMonthlyRevenueLabel(item),
  }));
}

export const listAppShowcaseVideoItemsEnriched = unstable_cache(
  listAppShowcaseVideoItemsEnrichedCore,
  ["app-showcase-videos-enriched-v2-eur"],
  { revalidate: 3600 },
);
