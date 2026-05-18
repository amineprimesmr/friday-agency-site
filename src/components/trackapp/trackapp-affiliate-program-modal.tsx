"use client";

import Link from "next/link";
import { useEffect, useId } from "react";

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
        className="relative w-full max-w-[440px] overflow-hidden rounded-[20px] bg-white p-6 shadow-[0_24px_80px_rgba(0,0,0,0.18)] ring-1 ring-slate-200"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          className="absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-600 transition hover:bg-slate-50"
          onClick={onClose}
          aria-label="Fermer"
        >
          ✕
        </button>

        <h2 id={modalHeadingId} className="m-0 pr-8 text-lg font-extrabold tracking-tight text-slate-900">
          Affiliation Trackapp
        </h2>
        <p className="mt-3 text-[0.92rem] leading-relaxed text-slate-600">
          Ton lien offre <strong className="text-slate-900">−40&nbsp;%</strong> sur l&apos;abonnement aux personnes qui
          passent par toi, et tu suis tes commissions dans le dashboard.
        </p>
        <Link
          href="/trackapp/gagner-240"
          className="mt-5 inline-flex w-full min-h-11 items-center justify-center rounded-full bg-[#0f172a] text-[0.88rem] font-bold text-white no-underline transition hover:bg-[#111827]"
          onClick={onClose}
        >
          Ouvrir le dashboard affiliation
        </Link>
      </div>
    </div>
  );
}
