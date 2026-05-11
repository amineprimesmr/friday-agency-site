"use client";

import { useEffect } from "react";

/**
 * Applique la classe attendue par les feuilles Fidelity portées (`body.trackapp-fidelity-body`).
 */
export function TrackappBodyClass({ active }: Readonly<{ active: boolean }>) {
  useEffect(() => {
    if (!active) return undefined;
    document.body.classList.add("trackapp-fidelity-body");
    return () => {
      document.body.classList.remove("trackapp-fidelity-body");
    };
  }, [active]);

  return null;
}
