import type { Metadata } from "next";

import { TrendtrackAffiliateLanding } from "@/components/tracker/trendtrack-affiliate-landing";

export const metadata: Metadata = {
  title: "Affiliation",
  description:
    "Programme d’affiliation Trackapp : 20 € de MRR par parrainage actif, lien et code promo, simulateur de revenus et FAQ.",
};

export default function TrackerAffiliationPage() {
  return <TrendtrackAffiliateLanding />;
}
