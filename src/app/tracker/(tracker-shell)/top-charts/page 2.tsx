import type { Metadata } from "next";
import { Suspense } from "react";
import { fetchTopCharts, COUNTRY_MAP, type CountryCode, normalizeTrackerCountryParam } from "@/lib/apple-charts";
import { AppTable } from "@/components/tracker/app-table";

export const metadata: Metadata = { title: "Classements App Store" };
export const revalidate = 900;

interface PageProps {
  searchParams: Promise<{ country?: string; chart?: string; category?: string }>;
}

async function ChartsContent({ country, chart, category }: { country: string; chart: string; category: string }) {
  const apps = await fetchTopCharts(country, chart, 100);
  const countryData = COUNTRY_MAP[country as CountryCode];
  const filtered =
    category === "all" ? apps : apps.filter((a) => a.categoryId === category);

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <span className="text-2xl">{countryData?.flag ?? "🌐"}</span>
        <div>
          <h1 className="text-2xl font-bold text-white">
            {chart === "top-free"
              ? "Top Gratuit"
              : chart === "top-paid"
                ? "Top Payant"
                : "Top Revenus"}
          </h1>
          <p className="text-sm text-white/45">{countryData?.name ?? country}</p>
        </div>
      </div>
      <AppTable apps={filtered} country={country} chart={chart} category={category} />
    </div>
  );
}

export default async function TopChartsPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const country = normalizeTrackerCountryParam(params.country);
  const chart = params.chart ?? "top-free";
  const category = params.category ?? "all";

  return (
    <div className="mx-auto max-w-7xl space-y-8 px-4 py-8 sm:px-6">
      <Suspense
        fallback={
          <div className="py-24 text-center text-sm text-white/40">
            Chargement des classements…
          </div>
        }
      >
        <ChartsContent country={country} chart={chart} category={category} />
      </Suspense>
    </div>
  );
}
