"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

import { TrackappLogoMark } from "@/components/trackapp/trackapp-logo-mark";
import {
  trackappConnexionForAppHref,
  trackappUnlockHref,
} from "@/lib/trackapp-apptracker-paths";
import { TRACKER_CONNEXION_HREF } from "@/lib/tracker-auth-nav";

import "@/styles/trackapp-guest-preview.css";

export function TrackappPremiumGate({
  title,
  description,
  appId,
  country,
  children,
  className,
}: Readonly<{
  title: string;
  description: string;
  appId: string;
  country: string;
  children: React.ReactNode;
  className?: string;
}>) {
  const router = useRouter();
  const unlockHref = trackappUnlockHref(appId, country);
  const connexionHref = appId ? trackappConnexionForAppHref(appId, country) : TRACKER_CONNEXION_HREF;

  useEffect(() => {
    router.prefetch(unlockHref);
    router.prefetch(connexionHref);
  }, [router, unlockHref, connexionHref]);

  return (
    <div className={className ? `trackapp-premium-gate ${className}` : "trackapp-premium-gate"}>
      <div className="trackapp-premium-gate__content" aria-hidden="true">
        {children}
      </div>
      <div className="trackapp-premium-gate__veil" aria-hidden />
      <div className="trackapp-premium-gate__panel">
        <span className="trackapp-premium-gate__icon" aria-hidden>
          ◆
        </span>
        <p className="trackapp-premium-gate__title">{title}</p>
        <p className="trackapp-premium-gate__desc">{description}</p>
        <div className="trackapp-premium-gate__actions">
          <Link href={unlockHref} className="trackapp-guest-cta" prefetch>
            Débloquer
          </Link>
          <Link href={connexionHref} className="trackapp-guest-cta trackapp-guest-cta--ghost" prefetch>
            Connexion
          </Link>
        </div>
      </div>
    </div>
  );
}
