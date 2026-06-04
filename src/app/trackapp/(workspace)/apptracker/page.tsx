import type { Metadata } from "next";

import { TrackappAccueilSearch } from "@/components/trackapp/trackapp-accueil-search";
import { normalizeTrackerCountryParam } from "@/lib/apple-charts";

export const metadata: Metadata = {
  title: "Apptracker — Trackapp",
  description: "Recherchez une app sur l'App Store et ouvrez sa fiche pour l'analyser.",
};

export default async function TrackappApptrackerPage({
  searchParams,
}: Readonly<{
  searchParams: Promise<{ q?: string; country?: string }>;
}>) {
  const sp = await searchParams;
  const country = normalizeTrackerCountryParam(sp.country);
  const q = typeof sp.q === "string" ? sp.q.trim() : "";

  return (
    <div className="trackapp-workspace-tool-page relative z-[1] dashboard-main pb-16">
      <section className="dashboard-section mx-auto flex w-full max-w-[40rem] flex-col items-stretch px-1">
        <header className="mb-8 text-center">
          <h1 className="trackapp-workspace-hero-title m-0">Apptracker</h1>
          <p className="trackapp-workspace-hero-desc mx-auto mt-3 max-w-[42ch]">
            Recherchez une app par nom ou mot-clé, puis ouvrez sa fiche pour les métriques et AppLAB.
          </p>
        </header>
        <TrackappAccueilSearch country={country} initialQuery={q} />
      </section>
    </div>
  );
}
