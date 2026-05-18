"use client";

import Link from "next/link";
import { useMemo, useRef, useState } from "react";

const AVA = [
  "https://i.pravatar.cc/96?img=12",
  "https://i.pravatar.cc/96?img=33",
  "https://i.pravatar.cc/96?img=47",
];

const COUNTRIES = [
  { code: "FR", label: "France" },
  { code: "BE", label: "Belgique" },
  { code: "CH", label: "Suisse" },
  { code: "LU", label: "Luxembourg" },
  { code: "CA", label: "Canada" },
];

function Icon({ name }: Readonly<{ name: "arrow" | "lock" | "check" }>) {
  if (name === "arrow") {
    return (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" aria-hidden>
        <path d="m15 18-6-6 6-6" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    );
  }
  if (name === "check") {
    return (
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden>
        <path d="M20 6 9 17l-5-5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    );
  }
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.3" aria-hidden>
      <rect x="4" y="10" width="16" height="10" rx="2" />
      <path d="M8 10V7a4 4 0 0 1 8 0v3" strokeLinecap="round" />
    </svg>
  );
}

function formatDateFr(date: Date) {
  return new Intl.DateTimeFormat("fr-FR", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(date);
}

export function TrackappPaymentPage() {
  const switcherRef = useRef<HTMLFieldSetElement | null>(null);
  const [annual, setAnnual] = useState(false);
  const [country, setCountry] = useState("FR");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const billingTimeline = useMemo(() => {
    const renewAnchor = new Date();
    if (annual) renewAnchor.setFullYear(renewAnchor.getFullYear() + 1);
    else renewAnchor.setMonth(renewAnchor.getMonth() + 1);
    return [
      { title: "Aujourd'hui", subtitle: "Offre premier mois", amount: "Payez 1€", icon: "lock" as const },
      {
        title: formatDateFr(renewAnchor),
        subtitle: annual ? "Soit 399 € facturés annuellement, sans engagement." : "Sans engagement, annulable à tout moment !",
        amount: annual ? "34 € /mois" : "49,99 € /mois",
        icon: "check" as const,
      },
    ];
  }, [annual]);

  const beginCheckout = async () => {
    if (busy) return;
    setBusy(true);
    setError("");
    try {
      const res = await fetch("/api/trackapp/checkout", { method: "POST" });
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
    <div className="saas-pay saas-pay-checkout">
      <main className="saas-pay-checkout-main">
        <header className="saas-pay-checkout-head">
          <Link className="saas-pay-checkout-back" href="/trackapp/accueil">
            <Icon name="arrow" />
            Retour
          </Link>
          <h1>DÉBLOQUEZ TOUT</h1>
          <p className="saas-pay-checkout-trust-lead">
            Commencez à créer votre app dès aujourd&apos;hui pour <strong>1&nbsp;€</strong>
          </p>
          <div className="saas-pay-checkout-trust-badge" role="status">
            <div className="saas-pay-checkout-trust-badge__stack" aria-hidden="true">
              {AVA.map((src, idx) => (
                <img
                  key={src}
                  src={src}
                  alt=""
                  width={32}
                  height={32}
                  loading="lazy"
                  decoding="async"
                  className="saas-pay-checkout-trust-badge__avatar"
                  style={{ zIndex: AVA.length - idx }}
                />
              ))}
            </div>
            <p className="saas-pay-checkout-trust-badge__label">Adopté par +125 créateurs</p>
          </div>
        </header>

        <div className="saas-pay-billing saas-pay-billing--checkout">
          <div className="saas-pay-billing-liquid">
            <fieldset
              ref={switcherRef}
              className="switcher"
              role="radiogroup"
              aria-label="Facturation mensuelle ou annuelle"
              {...{ "c-previous": annual ? "1" : "2" }}
            >
              <legend className="switcher__legend">Facturation mensuelle ou annuelle</legend>
              <label className="switcher__option" title="Mensuel">
                <input
                  className="switcher__input"
                  type="radio"
                  name="trackappBillingPeriodCheckout"
                  value="monthly"
                  checked={!annual}
                  onChange={() => setAnnual(false)}
                  aria-label="Mensuel"
                  {...{ "c-option": "1" }}
                />
                <span className="switcher__text">Mensuel</span>
              </label>
              <label className="switcher__option" title="Annuel">
                <input
                  className="switcher__input"
                  type="radio"
                  name="trackappBillingPeriodCheckout"
                  value="annual"
                  checked={annual}
                  onChange={() => setAnnual(true)}
                  aria-label="Annuel"
                  {...{ "c-option": "2" }}
                />
                <span className="switcher__text">Annuel</span>
              </label>
              <svg className="switcher__filter" aria-hidden="true">
                <defs>
                  <filter id="trackappBillingLiquidGoo">
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
        </div>

        <section className="saas-pay-timeline">
          {billingTimeline.map((step, idx) => (
            <div key={`${step.title}-${idx}`} className="saas-pay-timeline-row">
              <div className={`saas-pay-timeline-marker${idx === 0 ? " is-active" : " is-focus"}`} aria-hidden="true">
                <span className="saas-pay-timeline-dot">
                  <Icon name={step.icon} />
                </span>
                {idx < billingTimeline.length - 1 ? <i className="saas-pay-timeline-stem" /> : null}
              </div>
              <div className="saas-pay-timeline-copy">
                <p>{step.title}</p>
                <small>{step.subtitle}</small>
              </div>
              <strong>{step.amount}</strong>
            </div>
          ))}
        </section>

        <section className="saas-pay-wallet-hero" aria-label="Paiement express">
          <div className="saas-pay-wallet-hero__glass saas-pay-wallet-hero__glass--loading">
            <div className="saas-pay-wallet-mount saas-pay-wallet-mount--hero">
              Paiement sécurisé Trackapp
            </div>
          </div>
        </section>

        <section className="saas-pay-method">
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
            <select value={country} onChange={(e) => setCountry(e.target.value)}>
              {COUNTRIES.map((entry) => (
                <option key={entry.code} value={entry.code}>
                  {entry.label}
                </option>
              ))}
            </select>
          </div>

          {error ? <p className="saas-pay-feedback is-error">{error}</p> : null}

          <button type="button" className="saas-pay-continue" onClick={beginCheckout} disabled={busy}>
            <span className="saas-pay-continue-label">{busy ? "Chargement du paiement..." : "Commencer pour 1€"}</span>
          </button>
        </section>
      </main>
    </div>
  );
}
