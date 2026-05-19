"use client";

import { useCallback, useEffect, useState } from "react";

import { TrackappPlanBillingSwitcher } from "@/components/trackapp/trackapp-plan-billing-switcher";
import { getTrackappPaiementPlan, setTrackappPaiementPlan } from "@/lib/trackapp-paiement-plan-storage";

export function TrackappPaiementMarketingPlanSwitcher() {
  const [lifetime, setLifetime] = useState(true);

  const syncFromStore = useCallback(() => {
    setLifetime(getTrackappPaiementPlan() === "lifetime");
  }, []);

  useEffect(() => {
    syncFromStore();
    window.addEventListener("trackapp-paiement-plan", syncFromStore);
    return () => window.removeEventListener("trackapp-paiement-plan", syncFromStore);
  }, [syncFromStore]);

  const handleLifetimeChange = (value: boolean) => {
    setTrackappPaiementPlan(value ? "lifetime" : "monthly");
  };

  return (
    <div className="saas-pay saas-pay--plan-switcher-inline tpl-shell-plan-switcher">
      <div className="saas-pay-billing saas-pay-billing--checkout tpl-shell-plan-switcher__billing">
        <div className="saas-pay-billing-liquid">
          <TrackappPlanBillingSwitcher
            lifetime={lifetime}
            onLifetimeChange={handleLifetimeChange}
            radioName="trackappPlanMarketing"
          />
        </div>
      </div>
    </div>
  );
}
