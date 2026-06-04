"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";

import { TrackerSearchBar } from "@/components/tracker/tracker-search-bar";
import { useTrackappSearchHistory } from "@/hooks/use-trackapp-search-history";
import type { CountryCode } from "@/lib/apple-charts";

import "@/styles/tracker-search-bar.css";

export function TrackappLabSidebarSearchModal({
  open,
  onClose,
  country = "fr",
}: Readonly<{
  open: boolean;
  onClose: () => void;
  country?: CountryCode;
}>) {
  const [mounted, setMounted] = useState(false);
  const history = useTrackappSearchHistory(country);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!open) return undefined;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      document.removeEventListener("keydown", onKey);
    };
  }, [open, onClose]);

  if (!mounted || !open) return null;

  return createPortal(
    <div className="trackapp-studio-search" role="dialog" aria-modal="true" aria-label="Rechercher une app">
      <button type="button" className="trackapp-studio-search__backdrop" aria-label="Fermer" onClick={onClose} />
      <div className="trackapp-studio-search__panel">
        <TrackerSearchBar
          searchSurface="dark"
          isOpen
          trackappLiveMetrics
          country={country}
          onClose={onClose}
          onOpen={() => undefined}
          onNavigateToApp={(app) => {
            history.recordApp(app);
            onClose();
          }}
        />
      </div>
    </div>,
    document.body,
  );
}
