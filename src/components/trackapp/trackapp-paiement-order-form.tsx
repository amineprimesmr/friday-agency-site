"use client";

import { useEffect, useState } from "react";

import { TrackappDevPremiumBypassButton } from "@/components/trackapp/trackapp-dev-premium-bypass-button";

const COUNTRIES = [
  { code: "FR", label: "France" },
  { code: "BE", label: "Belgique" },
  { code: "CH", label: "Suisse" },
  { code: "LU", label: "Luxembourg" },
  { code: "CA", label: "Canada" },
] as const;

/** Bon de commande — paiement direct (Stripe Checkout). */
export function TrackappPaiementOrderForm({
  plan,
  country,
  onCountryChange,
  className,
  hideWalletHero = false,
}: Readonly<{
  plan: "monthly" | "yearly";
  country: string;
  onCountryChange: (code: string) => void;
  className?: string;
  hideWalletHero?: boolean;
}>) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    setError("");
  }, [plan]);

  const continueLabel = busy ? "Ouverture du paiement..." : "Rejoindre";

  const beginCheckout = async () => {
    if (busy) return;
    setBusy(true);
    setError("");
    try {
      const res = await fetch("/api/trackapp/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          plan: plan === "yearly" ? "yearly" : "monthly",
        }),
      });
      const data = (await res.json().catch(() => ({}))) as { url?: string; error?: string };
      if (res.status === 401) {
        window.location.href = "/trackapp/inscription?mode=start&redirect=/trackapp/paiement";
        return;
      }
      if (!res.ok || !data.url) {
        throw new Error(data.error || "Impossible de préparer le paiement.");
      }
      window.location.href = data.url;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Le paiement a échoué.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className={`saas-pay-order-inset tpl-paiement-order-steps${className ? ` ${className}` : ""}`}>
      {!hideWalletHero ? (
        <section className="saas-pay-wallet-hero" aria-label="Paiement express">
          <div className="saas-pay-wallet-hero__glass saas-pay-wallet-hero__glass--loading">
            <div className="saas-pay-wallet-mount saas-pay-wallet-mount--hero">Paiement sécurisé Trackapp</div>
          </div>
        </section>
      ) : null}

      <section className="saas-pay-method">
        <p className="saas-pay-wallet-divider">Informations bancaires</p>

        <label>Numéro de carte</label>
        <div className="saas-pay-field saas-pay-card-number-field" aria-hidden="true">
          <span className="saas-pay-field-placeholder">1234 1234 1234 1234</span>
          <div className="saas-pay-card-brands">
            <span className="saas-pay-card-brand-logo--sheet">VISA · Mastercard · CB</span>
          </div>
        </div>

        <div className="saas-pay-inline">
          <div>
            <label>Date d&apos;expiration</label>
            <div className="saas-pay-field saas-pay-expiry-field" aria-hidden="true">
              <span className="saas-pay-field-placeholder">MM / AA</span>
            </div>
          </div>
          <div>
            <label>Code de sécurité</label>
            <div className="saas-pay-field saas-pay-cvc-field" aria-hidden="true">
              <span className="saas-pay-field-placeholder">CVC</span>
              <span className="saas-pay-cvc-icon">123</span>
            </div>
          </div>
        </div>

        <label>Pays</label>
        <div className="saas-pay-select-wrap">
          <select value={country} onChange={(e) => onCountryChange(e.target.value)}>
            {COUNTRIES.map((entry) => (
              <option key={entry.code} value={entry.code}>
                {entry.label}
              </option>
            ))}
          </select>
        </div>

        {error ? <p className="saas-pay-feedback is-error">{error}</p> : null}

        <button type="button" className="saas-pay-continue" onClick={beginCheckout} disabled={busy}>
          <span className="saas-pay-continue-label">{continueLabel}</span>
        </button>

        <TrackappDevPremiumBypassButton />
      </section>
    </div>
  );
}
