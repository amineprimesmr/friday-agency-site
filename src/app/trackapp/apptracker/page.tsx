import type { Metadata } from "next";

import { TrackappApptrackerSearchSection } from "@/components/trackapp/trackapp-apptracker-search-section";
import { normalizeTrackerCountryParam } from "@/lib/apple-charts";
import { cachedTrackappApptrackerSearch } from "@/lib/trackapp-apptracker-search";

export const metadata: Metadata = {
  title: "Apptracker — Trackapp",
  description: "Recherche et analyse d'apps App Store dans l'espace Trackapp.",
};

export const revalidate = 300;

export default async function TrackappApptrackerPage({
  searchParams,
}: Readonly<{
  searchParams: Promise<{ q?: string; country?: string }>;
}>) {
  const sp = await searchParams;
  const q = typeof sp.q === "string" ? sp.q.trim() : "";
  const country = normalizeTrackerCountryParam(sp.country);
  const results = q ? await cachedTrackappApptrackerSearch(q, country) : [];

  return (
    <div className="relative z-[1] dashboard-main pb-16">
      <section className="dashboard-section">
        <p className="trackapp-workspace-hero-kicker">Apptracker</p>
        <h1 className="trackapp-workspace-hero-title">Recherche d&apos;apps App Store</h1>
        <p className="trackapp-workspace-hero-desc max-w-[68ch]">
          Cherche une app, analyse ses signaux et ouvre sa fiche détaillée directement dans le SaaS Trackapp.
        </p>
      </section>

      <TrackappApptrackerSearchSection
        action="/trackapp/apptracker"
        q={q}
        country={country}
        results={results}
      />
    </div>
  );
}
