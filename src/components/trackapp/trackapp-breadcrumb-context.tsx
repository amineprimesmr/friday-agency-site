"use client";

import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";

type BreadcrumbOverride = Readonly<{
  pageLabel?: string;
}>;

const TrackappBreadcrumbContext = createContext<{
  override: BreadcrumbOverride | null;
  setOverride: (value: BreadcrumbOverride | null) => void;
} | null>(null);

export function TrackappBreadcrumbProvider({ children }: Readonly<{ children: ReactNode }>) {
  const [override, setOverride] = useState<BreadcrumbOverride | null>(null);
  const value = useMemo(() => ({ override, setOverride }), [override]);
  return <TrackappBreadcrumbContext.Provider value={value}>{children}</TrackappBreadcrumbContext.Provider>;
}

export function useTrackappBreadcrumbOverride(): BreadcrumbOverride | null {
  return useContext(TrackappBreadcrumbContext)?.override ?? null;
}

/** Affiche le nom de l’app dans le fil d’Ariane (fiche Accueil). */
export function TrackappBreadcrumbOverride({ pageLabel }: Readonly<{ pageLabel: string }>) {
  const setOverride = useContext(TrackappBreadcrumbContext)?.setOverride;

  useEffect(() => {
    if (!setOverride) return;
    setOverride({ pageLabel });
    return () => setOverride(null);
  }, [pageLabel, setOverride]);

  return null;
}
