import { permanentRedirect } from "next/navigation";

import { normalizeTrackerCountryParam } from "@/lib/apple-charts";
import { trackappAccueilAppHref } from "@/lib/trackapp-apptracker-paths";

/** Ancienne URL — redirige vers Accueil › fiche app. */
export default async function LegacyApptrackerDetailRedirect({
  params,
  searchParams,
}: Readonly<{
  params: Promise<{ id: string }>;
  searchParams: Promise<{ country?: string; compare?: string }>;
}>) {
  const { id } = await params;
  const sp = await searchParams;
  const country = normalizeTrackerCountryParam(sp.country);
  const base = trackappAccueilAppHref(id, country);
  const url = sp.compare ? `${base}&compare=${encodeURIComponent(sp.compare)}` : base;
  permanentRedirect(url);
}
