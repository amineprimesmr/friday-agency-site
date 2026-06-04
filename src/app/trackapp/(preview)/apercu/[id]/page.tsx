import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";

import { normalizeTrackerCountryParam, type CountryCode } from "@/lib/apple-charts";
import { createClient } from "@/lib/supabase/server";
import { trackappAccueilAppHref } from "@/lib/trackapp-apptracker-paths";
import { fetchAppDetailCached } from "@/lib/tracker-server-cache";
import { TrackappAccueilAppDetailView } from "@/components/trackapp/trackapp-accueil-app-detail-view";

export const maxDuration = 60;
export const revalidate = 900;

type PageProps = Readonly<{
  params: Promise<{ id: string }>;
  searchParams: Promise<{ country?: string }>;
}>;

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  const app = await fetchAppDetailCached(id);
  return {
    title: app ? `${app.name} — Aperçu Trackapp` : "Aperçu app — Trackapp",
    description: app
      ? `Aperçu gratuit de ${app.name} — métriques, réseaux sociaux et analyse IA avec Trackapp.`
      : undefined,
  };
}

export default async function TrackappApercuAppPage({ params, searchParams }: PageProps) {
  const { id } = await params;
  const sp = await searchParams;
  const country = normalizeTrackerCountryParam(sp.country);
  const countryCode = country as CountryCode;

  const app = await fetchAppDetailCached(id, countryCode);
  if (!app) notFound();

  const sb = await createClient();
  const user = sb ? (await sb.auth.getUser()).data.user : null;
  if (user && sb) {
    const { data: profile } = await sb
      .from("trackapp_profiles")
      .select("plan_unlocked_at")
      .eq("id", user.id)
      .maybeSingle();
    if (profile?.plan_unlocked_at) {
      redirect(trackappAccueilAppHref(id, country));
    }
  }

  return (
    <TrackappAccueilAppDetailView app={app} country={country} countryCode={countryCode} guestMode />
  );
}
