import { permanentRedirect } from "next/navigation";

import { normalizeTrackerCountryParam } from "@/lib/apple-charts";
import { trackappAccueilHref } from "@/lib/trackapp-apptracker-paths";

/** `/trackapp/apptracker` sans id → recherche sur Accueil. */
export default async function TrackappApptrackerIndexRedirectPage({
  searchParams,
}: Readonly<{
  searchParams: Promise<{ q?: string; country?: string }>;
}>) {
  const sp = await searchParams;
  const q = typeof sp.q === "string" ? sp.q.trim() : "";
  const country = normalizeTrackerCountryParam(sp.country);
  permanentRedirect(trackappAccueilHref({ country, q: q || undefined }));
}
