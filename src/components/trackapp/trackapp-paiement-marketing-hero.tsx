"use client";

import { useCallback, useEffect, useState } from "react";

import { getTrackappPaiementPlan } from "@/lib/trackapp-paiement-plan-storage";
import { cn } from "@/lib/utils";

export function TrackappPaiementMarketingHero() {
  const [yearly, setYearly] = useState(true);

  const syncFromStore = useCallback(() => {
    setYearly(getTrackappPaiementPlan() === "yearly");
  }, []);

  useEffect(() => {
    syncFromStore();
    window.addEventListener("trackapp-paiement-plan", syncFromStore);
    return () => window.removeEventListener("trackapp-paiement-plan", syncFromStore);
  }, [syncFromStore]);

  return (
    <section
      className={cn("tpl-hero", !yearly && "tpl-hero--monthly")}
      aria-label={yearly ? "Offre Trackapp — réduction annuelle" : "Trackapp — sans engagement"}
    >
      <div className="tpl-hero__bg" aria-hidden />
      <div className="tpl-hero__inner">
        {yearly ? (
          <>
            <p className="tpl-hero__eyebrow">Offre Spéciale</p>
            <p className="tpl-hero__discount">-79&nbsp;%</p>
            <p className="tpl-hero__tagline">Créez votre app maintenant</p>
          </>
        ) : (
          <>
            <p className="tpl-hero__discount tpl-hero__discount--monthly">Sans engagement</p>
            <p className="tpl-hero__tagline">Annulez à tout moment</p>
          </>
        )}
      </div>
    </section>
  );
}
