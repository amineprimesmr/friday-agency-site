import type { Metadata } from "next";

import { TrendtrackAffiliateLanding } from "@/components/tracker/trendtrack-affiliate-landing";

export const metadata: Metadata = {
  title: "Affiliation",
  description:
    "Programme d’affiliation Trackapp : 30 % sur chaque abonnement généré, lien et code promo, simulateur de revenus et FAQ.",
};

export default function TrackerAffiliationPage() {
  return <TrendtrackAffiliateLanding />;
}
