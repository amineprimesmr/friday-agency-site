"use client";

import { useEffect, useRef } from "react";

import { pushTrackappSearchHistoryApp } from "@/lib/trackapp-search-history";
import type { CountryCode } from "@/lib/apple-charts";

type Props = Readonly<{
  app: Readonly<{
    id: string;
    name: string;
    artistName: string;
    artworkUrl: string;
    category: string;
  }>;
  country: CountryCode;
}>;

/** Enregistre la visite fiche app dans l’historique Accueil (localStorage). */
export function TrackappSearchHistoryRecorder({ app, country }: Props) {
  const recorded = useRef(false);

  useEffect(() => {
    if (recorded.current) return;
    recorded.current = true;
    pushTrackappSearchHistoryApp(app, country);
  }, [app, country]);

  return null;
}
