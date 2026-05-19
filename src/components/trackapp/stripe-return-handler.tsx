"use client";

import { useSearchParams } from "next/navigation";
import { Suspense, useEffect } from "react";

/** Ancien retour Stripe sur /accueil → redirige vers la page d'activation. */
function Inner() {
  const sp = useSearchParams();
  const sessionId = sp?.get("session_id");

  useEffect(() => {
    if (!sessionId || typeof window === "undefined") return;
    window.location.replace(`/trackapp/activation?session_id=${encodeURIComponent(sessionId)}`);
  }, [sessionId]);

  if (!sessionId) return null;

  return (
    <div className="mb-10 rounded-2xl border border-violet-500/36 bg-violet-500/[0.12] px-5 py-3 text-[13px] text-white/92">
      Paiement reçu — redirection vers la création de compte…
    </div>
  );
}

export function StripeReturnHandler() {
  return (
    <Suspense fallback={null}>
      <Inner />
    </Suspense>
  );
}
