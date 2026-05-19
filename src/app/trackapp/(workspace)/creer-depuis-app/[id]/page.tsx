import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { TrackappCloneAppActions } from "@/components/trackapp/trackapp-clone-app-actions";
import { TrackappApptrackerDetailContext } from "@/components/trackapp/trackapp-apptracker-detail-context";
import { normalizeTrackerCountryParam, type CountryCode } from "@/lib/apple-charts";
import { fetchAppDetailCached } from "@/lib/tracker-server-cache";
import { loadTrackappClonePromptBundle } from "@/lib/trackapp-clone-prompt/load-bundle";
import {
  parseCloneAngleParam,
  parseCloneStackParam,
} from "@/lib/trackapp-clone-prompt/parse-options";

import "@/styles/trackapp-clone-app.css";

export const maxDuration = 60;
export const revalidate = 900;

type PageProps = Readonly<{
  params: Promise<{ id: string }>;
  searchParams: Promise<{
    country?: string;
    stack?: string;
    angle?: string;
    open?: string;
  }>;
}>;

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  const app = await fetchAppDetailCached(id);
  return {
    title: app ? `Créer ${app.name} — Trackapp` : "Créer cette app — Trackapp",
    description: "Spec produit et ouverture Cursor / Claude Code à partir d'une app App Store.",
  };
}

export default async function TrackappCreerDepuisAppPage({ params, searchParams }: PageProps) {
  const { id } = await params;
  const sp = await searchParams;
  const country = normalizeTrackerCountryParam(sp.country) as CountryCode;
  const stack = parseCloneStackParam(sp.stack);
  const angle = parseCloneAngleParam(sp.angle);

  const bundle = await loadTrackappClonePromptBundle(id, country, { stack, angle });
  if (!bundle) notFound();

  const app = await fetchAppDetailCached(id);
  if (!app) notFound();

  const autoOpenIde = sp.open === "cursor" || sp.open === "claude" ? sp.open : null;

  return (
    <div className="relative z-[1] dashboard-main pb-16">
      <TrackappApptrackerDetailContext appName={app.name} />
      <TrackappCloneAppActions
        initialBundle={bundle}
        appId={id}
        country={country}
        initialStack={stack}
        initialAngle={angle}
        artworkUrl={app.artworkUrl}
        artistName={app.artistName}
        autoOpenIde={autoOpenIde}
      />
    </div>
  );
}
