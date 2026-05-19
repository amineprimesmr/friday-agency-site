"use client";

import { useCallback, useEffect, useState } from "react";

import { getTrackappPaiementPlan } from "@/lib/trackapp-paiement-plan-storage";
import { TRACKAPP_PRICING } from "@/lib/trackapp/pricing";
import { cn } from "@/lib/utils";

export function TrackappPaiementMarketingHero() {
  const [lifetime, setLifetime] = useState(true);

  const syncFromStore = useCallback(() => {
    setLifetime(getTrackappPaiementPlan() === "lifetime");
  }, []);

  useEffect(() => {
    syncFromStore();
    window.addEventListener("trackapp-paiement-plan", syncFromStore);
    return () => window.removeEventListener("trackapp-paiement-plan", syncFromStore);
  }, [syncFromStore]);

  return (
    <section
      className={cn("tpl-hero", !lifetime && "tpl-hero--monthly")}
      aria-label={lifetime ? "Offre Trackapp — accès à vie" : "Trackapp — sans engagement"}
    >
      <div className="tpl-hero__bg" aria-hidden />
      <div className="tpl-hero__inner">
        {lifetime ? (
          <>
            <p className="tpl-hero__eyebrow">Offre limitée</p>
            <p className="tpl-hero__discount">{TRACKAPP_PRICING.lifetime.display}</p>
            <p className="tpl-hero__tagline">Accès à vie — une seule fois</p>
          </>
        ) : (
          <>
            <p className="tpl-hero__discount tpl-hero__discount--monthly">Sans engagement</p>
            <p className="tpl-hero__tagline">
              {TRACKAPP_PRICING.monthly.display}
              {TRACKAPP_PRICING.monthly.period} — annule quand tu veux
            </p>
          </>
        )}
      </div>
    </section>
  );
}
