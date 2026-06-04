"use client";

import { useCallback, useEffect, useState } from "react";
import {
  CheckoutElementsProvider,
  ExpressCheckoutElement,
  PaymentElement,
  useCheckoutElements,
} from "@stripe/react-stripe-js/checkout";
import type { StripeExpressCheckoutElementConfirmEvent } from "@stripe/stripe-js";

import { fetchTrackappCheckoutClientSecret, openTrackappCheckout } from "@/lib/trackapp/open-trackapp-checkout";
import type { TrackappBillingPlan } from "@/lib/trackapp/pricing";
import { getStripePromise, stripePublishableKeyConfigured } from "@/lib/stripe-client";

const CHECKOUT_APPEARANCE = {
  theme: "night" as const,
  variables: {
    borderRadius: "12px",
    colorBackground: "#14181c",
    colorText: "#f8fafc",
    colorDanger: "#f87171",
    fontFamily: "var(--font-geist-sans), ui-sans-serif, system-ui, sans-serif",
  },
};

function StripeCheckoutLoading() {
  return <p className="tpl-stripe-checkout__loading">Chargement du paiement sécurisé…</p>;
}

function StripeCheckoutError({ message }: Readonly<{ message: string }>) {
  return <p className="saas-pay-feedback is-error">{message}</p>;
}

function ExpressCheckoutSection() {
  const checkoutState = useCheckoutElements();
  const [error, setError] = useState("");

  const handleConfirm = useCallback(
    async (event: StripeExpressCheckoutElementConfirmEvent) => {
      if (checkoutState.type !== "success") return;
      setError("");
      const result = await checkoutState.checkout.confirm({ expressCheckoutConfirmEvent: event });
      if (result.type === "error") {
        setError(result.error.message);
      }
    },
    [checkoutState],
  );

  if (checkoutState.type === "loading") return <StripeCheckoutLoading />;
  if (checkoutState.type === "error") return <StripeCheckoutError message={checkoutState.error.message} />;

  return (
    <div className="tpl-stripe-checkout__express">
      <ExpressCheckoutElement
        onConfirm={handleConfirm}
        options={{
          buttonTheme: { applePay: "black" },
          buttonType: { applePay: "buy" },
          buttonHeight: 52,
          layout: { maxColumns: 1, maxRows: 1, overflow: "never" },
          paymentMethodOrder: ["apple_pay", "google_pay"],
          paymentMethods: { applePay: "always", googlePay: "auto", link: "never" },
        }}
      />
      {error ? <StripeCheckoutError message={error} /> : null}
    </div>
  );
}

function CardCheckoutSection() {
  const checkoutState = useCheckoutElements();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const handlePay = useCallback(async () => {
    if (checkoutState.type !== "success" || busy) return;
    setBusy(true);
    setError("");
    const result = await checkoutState.checkout.confirm();
    if (result.type === "error") {
      setError(result.error.message);
      setBusy(false);
    }
  }, [busy, checkoutState]);

  if (checkoutState.type === "loading") return <StripeCheckoutLoading />;
  if (checkoutState.type === "error") return <StripeCheckoutError message={checkoutState.error.message} />;

  const total = checkoutState.checkout.total?.total?.amount;
  const payLabel = busy ? "Paiement en cours…" : total ? `Payer ${total}` : "Payer par carte";

  return (
    <div className="tpl-stripe-checkout__card">
      <p className="saas-pay-wallet-divider">Informations bancaires</p>
      <PaymentElement options={{ layout: "tabs" }} />
      {error ? <StripeCheckoutError message={error} /> : null}
      <button type="button" className="saas-pay-continue" onClick={handlePay} disabled={busy}>
        <span className="saas-pay-continue-label">{payLabel}</span>
      </button>
    </div>
  );
}

function StripeHostedFallback({
  plan,
  showExpress,
  showCard,
}: Readonly<{
  plan: TrackappBillingPlan;
  showExpress: boolean;
  showCard: boolean;
}>) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const redirect = async () => {
    if (busy) return;
    setBusy(true);
    setError("");
    try {
      await openTrackappCheckout(plan);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Le paiement a échoué.");
      setBusy(false);
    }
  };

  return (
    <div className="tpl-stripe-checkout__fallback">
      {showExpress ? (
        <button type="button" className="tpl-spotlight__apple-pay" onClick={redirect} disabled={busy}>
          <span className="tpl-spotlight__apple-pay-fallback" aria-hidden={busy}>
            <span>{busy ? "Ouverture…" : "Pay"}</span>
          </span>
        </button>
      ) : null}
      {showCard ? (
        <>
          <p className="saas-pay-wallet-divider">Paiement sécurisé Stripe</p>
          {error ? <StripeCheckoutError message={error} /> : null}
          <button type="button" className="saas-pay-continue" onClick={redirect} disabled={busy}>
            <span className="saas-pay-continue-label">{busy ? "Ouverture du paiement…" : "Continuer vers Stripe"}</span>
          </button>
        </>
      ) : null}
    </div>
  );
}

function StripeCheckoutInner({
  showExpress,
  showCard,
}: Readonly<{
  showExpress: boolean;
  showCard: boolean;
}>) {
  return (
    <div className="tpl-stripe-checkout">
      {showExpress ? <ExpressCheckoutSection /> : null}
      {showExpress && showCard ? <p className="tpl-stripe-checkout__or">ou</p> : null}
      {showCard ? <CardCheckoutSection /> : null}
    </div>
  );
}

/** Checkout Stripe in-page (Apple Pay + carte) via Checkout Sessions ui_mode custom. */
export function TrackappPaiementStripeCheckout({
  plan,
  showExpress = true,
  showCard = true,
  className,
}: Readonly<{
  plan: TrackappBillingPlan;
  showExpress?: boolean;
  showCard?: boolean;
  className?: string;
}>) {
  const stripePromise = getStripePromise();
  const canEmbed = stripePublishableKeyConfigured() && stripePromise;
  const [clientSecret, setClientSecret] = useState<Promise<string> | null>(null);

  useEffect(() => {
    if (!canEmbed) return;
    setClientSecret(fetchTrackappCheckoutClientSecret(plan));
  }, [canEmbed, plan]);

  if (!canEmbed) {
    return (
      <div className={className}>
        <StripeHostedFallback plan={plan} showExpress={showExpress} showCard={showCard} />
      </div>
    );
  }

  if (!clientSecret) {
    return (
      <div className={className}>
        <StripeCheckoutLoading />
      </div>
    );
  }

  return (
    <div className={className}>
      <CheckoutElementsProvider
        key={plan}
        stripe={stripePromise}
        options={{
          clientSecret,
          elementsOptions: { appearance: CHECKOUT_APPEARANCE },
        }}
      >
        <StripeCheckoutInner showExpress={showExpress} showCard={showCard} />
      </CheckoutElementsProvider>
    </div>
  );
}
