"use client";

import { TrackappPaiementStripeCheckout } from "@/components/trackapp/trackapp-paiement-stripe-checkout";
import type { TrackappBillingPlan } from "@/lib/trackapp/pricing";

/** Bon de commande — paiement Stripe in-page (Apple Pay + carte). */
export function TrackappPaiementOrderForm({
  plan,
  className,
  hideWalletHero = false,
}: Readonly<{
  plan: TrackappBillingPlan;
  country?: string;
  onCountryChange?: (code: string) => void;
  className?: string;
  hideWalletHero?: boolean;
}>) {
  return (
    <div className={`saas-pay-order-inset tpl-paiement-order-steps${className ? ` ${className}` : ""}`}>
      <TrackappPaiementStripeCheckout
        plan={plan}
        showExpress={!hideWalletHero}
        showCard
        className="tpl-stripe-checkout--order-form"
      />
    </div>
  );
}
