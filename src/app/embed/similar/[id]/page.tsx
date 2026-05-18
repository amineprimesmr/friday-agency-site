import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { EmbedSimilarShell } from "@/components/tracker/embed-similar-shell";
import { loadTrackerAppEmbedContext, parseEmbedCountry } from "@/lib/tracker-app-embed-data";

export const revalidate = 900;

export const metadata: Metadata = {
  robots: { index: false, follow: true },
  title: "Apps proches · embed",
};

interface PageProps {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ country?: string; theme?: string }>;
}

export default async function EmbedSimilarPage({ params, searchParams }: PageProps) {
  const { id } = await params;
  const sp = await searchParams;
  const country = parseEmbedCountry(sp.country);

  const ctx = await loadTrackerAppEmbedContext(id, country);
  if (!ctx) notFound();

  return (
    <div className="box-border w-full px-2 py-2 sm:px-3 sm:py-3">
      <EmbedSimilarShell
        appName={ctx.app.name}
        artworkUrl={ctx.app.artworkUrl ?? ""}
        categoryLabel={ctx.app.primaryGenreName}
        apps={ctx.categoryPeers.slice(0, 20)}
        currentId={id}
        country={country}
      />
    </div>
  );
}
