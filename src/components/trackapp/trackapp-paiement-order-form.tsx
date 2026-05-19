"use client";

import { useEffect, useState } from "react";

const COUNTRIES = [
  { code: "FR", label: "France" },
  { code: "BE", label: "Belgique" },
  { code: "CH", label: "Suisse" },
  { code: "LU", label: "Luxembourg" },
  { code: "CA", label: "Canada" },
] as const;

const EMAIL_RE =
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function normalizeSpace(s: string) {
  return s.trim().replace(/\s+/g, " ");
}

/** Bon de commande : étape coordonnées → étape paiement (même carte, sans rechargement de page). */
export function TrackappPaiementOrderForm({
  plan,
  country,
  onCountryChange,
  className,
}: Readonly<{
  plan: "monthly" | "yearly";
  country: string;
  onCountryChange: (code: string) => void;
  className?: string;
}>) {
  /** 1 = identité, 2 = bloc paiement (aperçu carte + Stripe) */
  const [step, setStep] = useState<1 | 2>(1);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");

  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    setStep(1);
    setError("");
  }, [plan]);

  const continueLabel = busy ? "Ouverture du paiement..." : "Rejoindre";

  const validateIdentity = () => {
    const fn = normalizeSpace(firstName);
    const ln = normalizeSpace(lastName);
    const em = email.trim().toLowerCase();
    if (fn.length < 1 || fn.length > 80) return "Indique ton prénom.";
    if (ln.length < 1 || ln.length > 80) return "Indique ton nom.";
    if (!EMAIL_RE.test(em)) return "Indique une adresse e-mail valide.";
    return null;
  };

  const goToPaymentStep = () => {
    const v = validateIdentity();
    setError("");
    if (v) {
      setError(v);
      return;
    }
    setStep(2);
  };

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
          billingFirstName: normalizeSpace(firstName),
          billingLastName: normalizeSpace(lastName),
          billingEmail: email.trim(),
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
      {step === 1 ?
          <section className="saas-pay-identity-step" aria-label="Étape 1 — Coordonnées">
            <p className="saas-pay-wallet-divider">Tes informations</p>

            <label htmlFor={`tpl-pay-fn-${plan}`}>Prénom</label>
            <div className="saas-pay-field saas-pay-field--editable">
              <input
                id={`tpl-pay-fn-${plan}`}
                name="billingFirstName"
                type="text"
                autoComplete="given-name"
                className="saas-pay-native-input"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                placeholder="Prénom"
              />
            </div>

            <label htmlFor={`tpl-pay-ln-${plan}`}>Nom</label>
            <div className="saas-pay-field saas-pay-field--editable">
              <input
                id={`tpl-pay-ln-${plan}`}
                name="billingLastName"
                type="text"
                autoComplete="family-name"
                className="saas-pay-native-input"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                placeholder="Nom"
              />
            </div>

            <label htmlFor={`tpl-pay-em-${plan}`}>E-mail</label>
            <div className="saas-pay-field saas-pay-field--editable">
              <input
                id={`tpl-pay-em-${plan}`}
                name="billingEmail"
                type="email"
                autoComplete="email"
                className="saas-pay-native-input"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="nom@domaine.fr"
              />
            </div>
            <p className="saas-pay-identity-hint">Même e-mail que ton compte Trackapp.</p>

            {error ? <p className="saas-pay-feedback is-error">{error}</p> : null}

            <button type="button" className="saas-pay-continue" onClick={goToPaymentStep}>
              <span className="saas-pay-continue-label">Continuer</span>
            </button>
          </section>
        : <div>
            <section className="saas-pay-wallet-hero" aria-label="Paiement express">
              <div className="saas-pay-wallet-hero__glass saas-pay-wallet-hero__glass--loading">
                <div className="saas-pay-wallet-mount saas-pay-wallet-mount--hero">Paiement sécurisé Trackapp</div>
              </div>
            </section>

            <section className="saas-pay-method">
              <button
                type="button"
                className="saas-pay-step-back"
                onClick={() => {
                  setError("");
                  setStep(1);
                }}
              >
                ← Modifier mes coordonnées
              </button>

              <p className="saas-pay-wallet-divider">ou payer par carte</p>

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
            </section>
          </div>
        }
    </div>
  );
}
