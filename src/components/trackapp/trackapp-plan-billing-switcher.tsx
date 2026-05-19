"use client";

import type { RefObject } from "react";
import { useId } from "react";

import { TRACKAPP_PRICING } from "@/lib/trackapp/pricing";

export function TrackappPlanBillingSwitcher({
  lifetime,
  onLifetimeChange,
  radioName,
  switcherRef,
}: Readonly<{
  lifetime: boolean;
  onLifetimeChange: (lifetime: boolean) => void;
  radioName: string;
  switcherRef?: RefObject<HTMLFieldSetElement | null>;
}>) {
  const filterUid = useId().replace(/:/g, "");
  const filterId = `trackappBillingLiquidGoo-${filterUid}`;

  return (
    <div className="saas-pay-billing-switcher-row">
      <fieldset
        ref={switcherRef}
        className="switcher"
        role="radiogroup"
        aria-label="Mensuel ou à vie"
        {...{ "c-previous": lifetime ? "1" : "2" }}
      >
        <legend className="switcher__legend">Mensuel ou à vie</legend>
        <label className="switcher__option" title="Abonnement mensuel">
          <input
            className="switcher__input"
            type="radio"
            name={radioName}
            value="monthly"
            checked={!lifetime}
            onChange={() => onLifetimeChange(false)}
            aria-label={`Mensuel — ${TRACKAPP_PRICING.monthly.display} par mois, résiliation possible`}
            {...{ "c-option": "1" }}
          />
          <span className="switcher__text">Mensuel</span>
        </label>
        <label className="switcher__option switcher__option--yearly" title="Accès à vie">
          <input
            className="switcher__input"
            type="radio"
            name={radioName}
            value="lifetime"
            checked={lifetime}
            onChange={() => onLifetimeChange(true)}
            aria-label={`À vie — ${TRACKAPP_PRICING.lifetime.display} en une fois`}
            {...{ "c-option": "2" }}
          />
          <span className="switcher__text">À vie</span>
          <span className="saas-pay-billing-pct-badge" aria-hidden="true">
            {TRACKAPP_PRICING.lifetime.display}
          </span>
        </label>
        <svg className="switcher__filter" aria-hidden="true">
          <defs>
            <filter id={filterId}>
              <feGaussianBlur in="SourceGraphic" stdDeviation="6" result="blur" />
              <feColorMatrix
                in="blur"
                mode="matrix"
                values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 22 -10"
                result="goo"
              />
              <feComposite in="SourceGraphic" in2="goo" operator="atop" />
            </filter>
          </defs>
        </svg>
      </fieldset>
    </div>
  );
}
