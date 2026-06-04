"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

import { useTrackappOnboardingUi } from "@/components/trackapp/onboarding/trackapp-onboarding-ui-context";
import { prefetchOnboardingBootstrap } from "@/components/trackapp/onboarding/trackapp-onboarding-overlay-gate";
import {
  TRACKAPP_LANDING_PATH,
  trackappConnexionNextHref,
} from "@/lib/trackapp-landing-paths";

export function TrackappLandingAuthBar({
  loggedIn = false,
}: Readonly<{
  loggedIn?: boolean;
}>) {
  const router = useRouter();
  const { openOnboarding, isOpening } = useTrackappOnboardingUi();
  const connexionHref = trackappConnexionNextHref(TRACKAPP_LANDING_PATH);

  useEffect(() => {
    router.prefetch(connexionHref);
    prefetchOnboardingBootstrap();
  }, [router, connexionHref]);

  if (loggedIn) return null;

  return (
    <div className="trackapp-landing-auth-bar" role="region" aria-label="Compte Trackapp">
      <Link href={connexionHref} className="trackapp-landing-auth-bar__btn trackapp-landing-auth-bar__btn--ghost" prefetch>
        Se connecter
      </Link>
      <button
        type="button"
        className="trackapp-landing-auth-bar__btn trackapp-landing-auth-bar__btn--liquidglass"
        disabled={isOpening}
        onPointerEnter={prefetchOnboardingBootstrap}
        onFocus={prefetchOnboardingBootstrap}
        onClick={openOnboarding}
      >
        Commencer
      </button>
    </div>
  );
}
