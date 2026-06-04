import { redirect } from "next/navigation";

import { normalizeTrackerCountryParam } from "@/lib/apple-charts";
import { trackappAccueilHref } from "@/lib/trackapp-apptracker-paths";

interface PageProps {
  searchParams: Promise<{ q?: string; country?: string }>;
}

/** Ancienne page recherche tracker — unifiée sur Accueil Trackapp (Sensor Tower). */
export default async function SearchPage({ searchParams }: PageProps) {
  const sp = await searchParams;
  const country = normalizeTrackerCountryParam(sp.country);
  const q = typeof sp.q === "string" ? sp.q.trim() : "";
  redirect(trackappAccueilHref({ country, q: q || undefined }));
}
