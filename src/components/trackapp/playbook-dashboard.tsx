"use client";

import { useMemo, useState } from "react";

import type { PlaybookStep } from "@/lib/trackapp/playbook";

export type VisibleRowPayload = PlaybookStep & { promptRendered: string; visible: boolean };

export function TrackappPlaybookDashboard({
  rows,
  fullUnlocked,
  stripeReady,
}: {
  rows: VisibleRowPayload[];
  fullUnlocked: boolean;
  stripeReady?: boolean | undefined;
}) {
  const [copiedIdx, setCopiedIdx] = useState<number | null>(null);

  async function checkout() {
    const res = await fetch("/api/trackapp/checkout", {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
    });
    const errMsg = stripeReady ?
      undefined
    : "Stripe pas configuré côté serveur (voir .env STRIPE_*).";

    if (!stripeReady && errMsg) {
      alert(errMsg);
      return;
    }

    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: "Erreur inconnue" }));
      alert((err as { error?: string }).error ?? errMsg ?? "Stripe indisponible.");
      return;
    }

    const data = await res.json() as { url?: string };
    if (data.url) window.location.href = data.url;
  }

  async function copyText(text: string, idx: number) {
    await navigator.clipboard.writeText(text);
    setCopiedIdx(idx);
    setTimeout(() => setCopiedIdx(null), 1800);
  }

  const serverHint = useMemo(() => {
    if (!stripeReady) return "Stripe doit être configuré (STRIPE_SECRET_KEY + STRIPE_PRICE_ID_TRACKAPP ou _MONTHLY).";
    return "";
  }, [stripeReady]);

  const showPaywallStrip = !fullUnlocked && rows.some((r) => !r.visible);

  return (
    <>
      {showPaywallStrip ?
        <div className="trackapp-paywall-bar">
          <div>
            <p className="trackapp-paywall-title">Tu vois gratuitement quelques prompts.</p>
            <p className="trackapp-paywall-sub">
              Débloque pour copier tous les prompts + phases avancées (RevenueCat, QA, Ads…).
              {serverHint ? ` ${serverHint}` : ""}
            </p>
          </div>
          <button
            type="button"
            disabled={stripeReady !== true}
            onClick={() => checkout()}
            className="trackapp-btn-primary-dash shrink-0"
          >
            Débloquer
          </button>
        </div>
      : null}

      <ol className="relative z-[1] list-none space-y-5 p-0 pb-[max(10rem,env(safe-area-inset-bottom))]">
        {rows.map((row, i) => (
          <li key={row.id} className="trackapp-playbook-card">
            <header className="trackapp-playbook-card-header">
              <span className="trackapp-playbook-idx">{String(i + 1).padStart(2, "0")}</span>
              <h2 className="trackapp-playbook-title">{row.title}</h2>
              {fullUnlocked ?
                <span className="dashboard-badge dashboard-badge-purple">ACCÈS PREMIUM</span>
              : row.visible ?
                <span className="dashboard-badge dashboard-badge-success">APERÇU GRATUIT</span>
              : null}

              {!row.visible ?
                <span className="dashboard-badge dashboard-badge-warning">FLOUTÉ · STRIPE</span>
              : null}
            </header>

            <p className="trackapp-playbook-summary">{row.summary}</p>

            <div className="relative mt-4">
              <div
                className={`trackapp-playbook-pre-wrap ${row.visible ? "" : "trackapp-playbook-pre-wrap--locked"}`}
              >
                <pre className="trackapp-playbook-pre">{row.promptRendered.trim()}</pre>
              </div>

              {!row.visible ?
                <div className="absolute inset-x-8 top-[38%] z-10 flex justify-center">
                  <button
                    type="button"
                    disabled={stripeReady !== true}
                    onClick={() => checkout()}
                    className="trackapp-btn-primary-dash"
                  >
                    Débloquer
                  </button>
                </div>
              : row.visible ?
                <div className="mt-4">
                  <button
                    type="button"
                    onClick={() => copyText(row.promptRendered, i)}
                    className="trackapp-btn-ghost-dash"
                  >
                    {copiedIdx === i ? "Prompt copié ✓" : "Copier le prompt"}
                  </button>
                </div>
              : null}
            </div>
          </li>
        ))}
      </ol>
    </>
  );
}
