"use client";

import Link from "next/link";

import { TrackappBreadcrumbOverride } from "@/components/trackapp/trackapp-breadcrumb-context";
import { TRACKAPP_ACCUEIL_BASE } from "@/lib/trackapp-apptracker-paths";

import "@/styles/trackapp-apptracker-detail-context.css";

export function TrackappApptrackerDetailContext({ appName }: Readonly<{ appName: string }>) {
  return (
    <>
      <TrackappBreadcrumbOverride pageLabel={appName} />
      <nav className="trackapp-apptracker-detail-context" aria-label="Contexte Apptracker">
        <Link href={TRACKAPP_ACCUEIL_BASE} className="trackapp-apptracker-detail-context__hub">
          Apptracker
        </Link>
        <span className="trackapp-apptracker-detail-context__sep" aria-hidden>
          /
        </span>
        <span className="trackapp-apptracker-detail-context__current truncate">{appName}</span>
      </nav>
    </>
  );
}
