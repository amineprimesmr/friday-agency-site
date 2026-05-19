"use client";

import { useRouter } from "next/navigation";
import { useCallback, useEffect } from "react";

function BackChevron() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="m15 18-6-6 6-6"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

const PAYMENT_BACK_TARGET = "/tracker";

/** Page paiement : retour déterministe vers la landing publique, sans dépendre de l'historique. */
export function TrackappPaiementPageShell({ children }: Readonly<{ children: React.ReactNode }>) {
  const router = useRouter();

  useEffect(() => {
    router.prefetch(PAYMENT_BACK_TARGET);
  }, [router]);

  const goLanding = useCallback(() => {
    router.replace(PAYMENT_BACK_TARGET);
  }, [router]);

  return (
    <div className="tpl-paiement-page">
      <button type="button" className="tpl-paiement-back-discrete" onClick={goLanding} aria-label="Retour à la landing Trackapp">
        <BackChevron />
        <span>Retour</span>
      </button>
      {children}
    </div>
  );
}
