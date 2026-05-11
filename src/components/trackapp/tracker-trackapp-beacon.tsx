"use client";

import { useCallback, useEffect, useState } from "react";

import { TrackappPromoModal } from "@/components/trackapp/trackapp-promo-modal";

const MODAL_ONCE = "trackapp-tracker-intro-v1";

/** Pop-up automatique première visite Tracker + même modale depuis le hero (événement custom). */
export function TrackerTrackappBeacon() {
  const [open, setOpen] = useState(false);

  const openIntro = useCallback(() => setOpen(true), []);

  useEffect(() => {
    try {
      if (!sessionStorage.getItem(MODAL_ONCE)) {
        setOpen(true);
      }
    } catch {
      /* ignore */
    }
    const listener = () => openIntro();
    window.addEventListener("trackapp-intro-open", listener);
    return () => window.removeEventListener("trackapp-intro-open", listener);
  }, [openIntro]);

  const dismiss = () => {
    try {
      sessionStorage.setItem(MODAL_ONCE, "1");
    } catch {
      /* ignore */
    }
    setOpen(false);
  };

  return <TrackappPromoModal open={open} onClose={dismiss} />;
}
