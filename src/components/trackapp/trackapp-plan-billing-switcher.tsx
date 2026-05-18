"use client";

import type { RefObject } from "react";
import { useId } from "react";

export function TrackappPlanBillingSwitcher({
  yearly,
  onYearlyChange,
  radioName,
  switcherRef,
}: Readonly<{
  yearly: boolean;
  onYearlyChange: (yearly: boolean) => void;
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
        aria-label="Mensuel ou annuel"
        {...{ "c-previous": yearly ? "1" : "2" }}
      >
        <legend className="switcher__legend">Mensuel ou annuel</legend>
        <label className="switcher__option" title="Abonnement mensuel">
          <input
            className="switcher__input"
            type="radio"
            name={radioName}
            value="monthly"
            checked={!yearly}
            onChange={() => onYearlyChange(false)}
            aria-label="Mensuel — 39 euros par mois, résiliation possible"
            {...{ "c-option": "1" }}
          />
          <span className="switcher__text">Mensuel</span>
        </label>
        <label className="switcher__option switcher__option--yearly" title="Abonnement annuel">
          <input
            className="switcher__input"
            type="radio"
            name={radioName}
            value="yearly"
            checked={yearly}
            onChange={() => onYearlyChange(true)}
            aria-label="Annuel — 99 euros par an, abonnement annuel"
            {...{ "c-option": "2" }}
          />
          <span className="switcher__text">Annuel</span>
          <span className="saas-pay-billing-pct-badge" aria-hidden="true">
            −89&nbsp;%
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
