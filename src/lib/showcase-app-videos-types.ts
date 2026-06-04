import type { AppShowcaseVideoItem } from "@/lib/selection-app/types";

/** Item showcase vidéo + libellé CA (safe import côté client). */
export type AppShowcaseVideoItemEnriched = AppShowcaseVideoItem & {
  monthlyRevenueLabel: string | null;
};
