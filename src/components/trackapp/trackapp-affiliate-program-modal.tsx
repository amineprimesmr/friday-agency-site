"use client";

import { TrendtrackAffiliateLanding } from "@/components/tracker/trendtrack-affiliate-landing";
import { useEffect, useId } from "react";

import "@/styles/tracker-bracket-badge.css";

export function TrackappAffiliateProgramModal({
  open,
  onClose,
}: Readonly<{
  open: boolean;
  onClose: () => void;
}>) {
  const modalHeadingId = useId();

  useEffect(() => {
    if (!open) return;

    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }

    window.addEventListener("keydown", onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[600] flex items-center justify-center bg-black/45 p-3 backdrop-blur-[10px] md:p-6"
      role="presentation"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={modalHeadingId}
        className="relative flex max-h-[min(92dvh,920px)] w-full max-w-[1100px] flex-col overflow-hidden rounded-[clamp(14px,2.5vw,22px)] bg-black shadow-[0_24px_80px_rgba(0,0,0,0.55)] ring-1 ring-white/[0.12]"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 id={modalHeadingId} className="sr-only">
          Programme d&apos;affiliation Trackapp
        </h2>

        <button
          type="button"
          className="absolute right-3 top-3 z-[2] flex h-10 w-10 items-center justify-center rounded-full border border-white/15 bg-black/55 text-[13px] font-semibold text-white backdrop-blur-md transition hover:bg-black/70 md:right-4 md:top-4"
          onClick={onClose}
          aria-label="Fermer la fenêtre affiliation"
        >
          ✕
        </button>

        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain">
          <TrendtrackAffiliateLanding />
        </div>
      </div>
    </div>
  );
}
