import { redirect } from "next/navigation";

import { normalizeTrackerCountryParam } from "@/lib/apple-charts";
import { trackappAccueilAppHref } from "@/lib/trackapp-apptracker-paths";

type PageProps = Readonly<{
  params: Promise<{ id: string }>;
  searchParams: Promise<{
    country?: string;
    stack?: string;
    angle?: string;
    open?: string;
  }>;
}>;

/** Legacy — export IDE depuis la fiche app (section AppLAB). */
export default async function TrackappCreerDepuisAppRedirect({ params, searchParams }: PageProps) {
  const { id } = await params;
  const sp = await searchParams;
  const country = normalizeTrackerCountryParam(sp.country);
  const href = trackappAccueilAppHref(id, country);
  const url = new URL(href, "http://local");
  url.searchParams.set("export", "1");
  redirect(`${url.pathname}${url.search}#trackapp-applab-export`);
}
