import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { CategoryRevenueShare } from "@/components/tracker/category-revenue-share";
import { loadTrackerAppEmbedContext, parseEmbedCountry } from "@/lib/tracker-app-embed-data";

export const revalidate = 900;

export const metadata: Metadata = {
  robots: { index: false, follow: true },
  title: "Part de marché · embed",
};

interface PageProps {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ country?: string; theme?: string }>;
}

export default async function EmbedMarketPage({ params, searchParams }: PageProps) {
  const { id } = await params;
  const sp = await searchParams;
  const country = parseEmbedCountry(sp.country);

  const ctx = await loadTrackerAppEmbedContext(id, country);
  if (!ctx) notFound();
  if (ctx.totalMarketUsd <= 0) {
    return (
      <div className="box-border w-full px-3 py-6 text-center text-sm text-white/45 sm:px-4">
        Pas assez de données pour ce graphique.
      </div>
    );
  }

  return (
    <div className="box-border w-full px-2 py-2 sm:px-3 sm:py-3">
      <CategoryRevenueShare
        rows={ctx.marketRows}
        totalUsd={ctx.totalMarketUsd}
        currentAppId={id}
        country={country}
      />
    </div>
  );
}
