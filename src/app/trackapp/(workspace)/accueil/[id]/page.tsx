import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { normalizeTrackerCountryParam, type CountryCode } from "@/lib/apple-charts";
import { fetchAppDetailCached } from "@/lib/tracker-server-cache";
import { TrackappAccueilAppDetailView } from "@/components/trackapp/trackapp-accueil-app-detail-view";

export const maxDuration = 60;
export const revalidate = 900;

type PageProps = Readonly<{
  params: Promise<{ id: string }>;
  searchParams: Promise<{ country?: string; export?: string }>;
}>;

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  return {
    title: `App ${id} — Trackapp`,
    description: "Fiche App Store — métriques, classements et insights Trackapp.",
  };
}

export default async function TrackappAccueilAppDetailPage({ params, searchParams }: PageProps) {
  const { id } = await params;
  const sp = await searchParams;
  const country = normalizeTrackerCountryParam(sp.country);
  const countryCode = country as CountryCode;

  const app = await fetchAppDetailCached(id, countryCode);
  if (!app) notFound();

  return (
    <TrackappAccueilAppDetailView
      app={app}
      country={country}
      countryCode={countryCode}
      autoOpenApplabExport={sp.export === "1"}
    />
  );
}
