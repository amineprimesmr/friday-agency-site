"use client";

import { useCallback, useEffect, useState } from "react";

import { getTrackappPaiementPlan, setTrackappPaiementPlan } from "@/lib/trackapp-paiement-plan-storage";
import { TrackappPlanBillingSwitcher } from "@/components/trackapp/trackapp-plan-billing-switcher";

export function TrackappPaiementMarketingPlanSwitcher() {
  const [yearly, setYearly] = useState(true);

  const syncFromStore = useCallback(() => {
    setYearly(getTrackappPaiementPlan() === "yearly");
  }, []);

  useEffect(() => {
    syncFromStore();
    window.addEventListener("trackapp-paiement-plan", syncFromStore);
    return () => window.removeEventListener("trackapp-paiement-plan", syncFromStore);
  }, [syncFromStore]);

  const handleYearlyChange = (y: boolean) => {
    setTrackappPaiementPlan(y ? "yearly" : "monthly");
  };

  return (
    <div className="saas-pay saas-pay--plan-switcher-inline tpl-shell-plan-switcher">
      <div className="saas-pay-billing saas-pay-billing--checkout tpl-shell-plan-switcher__billing">
        <div className="saas-pay-billing-liquid">
          <TrackappPlanBillingSwitcher
            yearly={yearly}
            onYearlyChange={handleYearlyChange}
            radioName="trackappPlanMarketing"
          />
        </div>
      </div>
    </div>
  );
}
