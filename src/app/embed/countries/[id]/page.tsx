import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { EmbedCountriesShell } from "@/components/tracker/embed-countries-shell";
import { fetchAppDetail, fetchCountryRankings, type CountryCode } from "@/lib/apple-charts";
import { normalizeEmbedTheme, normalizeEmbedView } from "@/lib/embed-url";

export const revalidate = 900;

export const metadata: Metadata = {
  robots: { index: false, follow: true },
  title: "Classements par pays · embed",
};

interface PageProps {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ theme?: string; view?: string }>;
}

export default async function EmbedCountriesPage({ params, searchParams }: PageProps) {
  const { id } = await params;
  const sp = await searchParams;

  const theme = normalizeEmbedTheme(sp.theme ?? "system");
  const view = normalizeEmbedView(sp.view);

  const [app, rankings] = await Promise.all([
    fetchAppDetail(id, "us" as CountryCode),
    fetchCountryRankings(id),
  ]);

  if (!app) notFound();

  return (
    <div className="box-border w-full px-3 py-3 antialiased sm:px-4 sm:py-4">
      <EmbedCountriesShell
        appId={id}
        appName={app.name}
        artworkUrl={app.artworkUrl ?? ""}
        rankings={rankings}
        theme={theme}
        view={view}
      />
    </div>
  );
}
