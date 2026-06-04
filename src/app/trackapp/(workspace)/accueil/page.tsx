import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { normalizeTrackerCountryParam } from "@/lib/apple-charts";
import { trackappApptrackerHref } from "@/lib/trackapp-apptracker-paths";

export const metadata: Metadata = {
  title: "Redirection — Trackapp",
  description: "Redirection vers Apptracker.",
};

export default async function TrackappAccueilPage({
  searchParams,
}: Readonly<{
  searchParams: Promise<{ country?: string; q?: string }>;
}>) {
  const sp = await searchParams;
  const country = normalizeTrackerCountryParam(sp.country);
  const q = typeof sp.q === "string" ? sp.q.trim() : "";
  redirect(trackappApptrackerHref({ country, q: q || undefined }));
}
