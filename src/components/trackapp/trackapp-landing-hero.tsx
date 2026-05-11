"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";

import { TrackappPromoModal } from "@/components/trackapp/trackapp-promo-modal";

const MODAL_ONCE = "trackapp-landing-intro-v1";

export function TrackappLandingHero() {
  const [promoOpen, setPromoOpen] = useState(false);

  const openIntro = useCallback(() => setPromoOpen(true), []);

  useEffect(() => {
    try {
      if (typeof sessionStorage !== "undefined" && !sessionStorage.getItem(MODAL_ONCE)) {
        setPromoOpen(true);
      }
    } catch {
      /* ignore */
    }
  }, []);

  const dismissIntro = () => {
    try {
      sessionStorage.setItem(MODAL_ONCE, "1");
    } catch {
      /* ignore */
    }
    setPromoOpen(false);
  };

  return (
    <>
      <div className="mt-10 flex flex-col items-stretch gap-4 sm:flex-row sm:justify-center">
        <Link href="/trackapp/inscription?mode=start" className="ta-cta-purple justify-center px-10 text-center">
          Commencer sans modèle
        </Link>
        <Link
          href="/tracker/search"
          className="ta-cta-purple ta-cta-purple--ghost justify-center rounded-full border border-white/[0.09] px-10 py-4 text-center"
        >
          Copier une app
        </Link>
      </div>
      <button
        type="button"
        onClick={() => openIntro()}
        className="mx-auto mt-6 block cursor-pointer rounded-full px-5 py-2 text-[13px] font-medium text-violet-300/90 underline underline-offset-4 hover:text-violet-200"
      >
        Pourquoi Trackapp remplace l’ancienne voie « extension » ?
      </button>

      <TrackappPromoModal open={promoOpen} onClose={dismissIntro} />
    </>
  );
}
