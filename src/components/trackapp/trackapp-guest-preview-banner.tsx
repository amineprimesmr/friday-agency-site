"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

import {
  trackappConnexionForAppHref,
  trackappUnlockHref,
} from "@/lib/trackapp-apptracker-paths";

import "@/styles/trackapp-guest-preview.css";

export function TrackappGuestPreviewBanner({
  appName,
  appId,
  country,
}: Readonly<{
  appName: string;
  appId: string;
  country: string;
}>) {
  const router = useRouter();
  const unlockHref = trackappUnlockHref(appId, country);
  const connexionHref = trackappConnexionForAppHref(appId, country);

  useEffect(() => {
    router.prefetch(unlockHref);
    router.prefetch(connexionHref);
  }, [router, unlockHref, connexionHref]);

  return (
    <div className="trackapp-guest-banner" role="region" aria-label="Aperçu gratuit Trackapp">
      <div className="trackapp-guest-banner__inner">
        <div className="min-w-0">
          <p className="trackapp-guest-banner__eyebrow">Aperçu gratuit · Trackapp AI</p>
          <h2 className="trackapp-guest-banner__title">
            Analyse de {appName} en cours — certaines données sont réservées aux membres
          </h2>
          <p className="trackapp-guest-banner__sub">
            Vous voyez la fiche complète en mode découverte. Débloquez téléchargements, revenus, réseaux sociaux,
            classements et analyse concurrentielle IA.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Link href={unlockHref} className="trackapp-guest-cta" prefetch>
            Débloquer l&apos;analyse complète
          </Link>
          <Link href={connexionHref} className="trackapp-guest-cta trackapp-guest-cta--ghost" prefetch>
            J&apos;ai déjà un compte
          </Link>
        </div>
      </div>
    </div>
  );
}
