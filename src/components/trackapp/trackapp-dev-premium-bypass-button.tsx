"use client";

import { useState } from "react";

function isDevUnlockVisible(): boolean {
  return (
    process.env.NODE_ENV !== "production"
    || process.env.NEXT_PUBLIC_TRACKAPP_DEV_UNLOCK === "1"
  );
}

/** Bypass temporaire : même effet qu'une activation Stripe finalisée. */
export function TrackappDevPremiumBypassButton() {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  if (!isDevUnlockVisible()) {
    return null;
  }

  const unlock = async () => {
    if (busy) return;
    setBusy(true);
    setError("");
    try {
      const res = await fetch("/api/dev/trackapp-unlock-premium", { method: "POST" });
      const data = (await res.json().catch(() => ({}))) as {
        error?: string;
        redirect?: string;
      };

      if (res.status === 401) {
        window.location.href = "/trackapp/connexion?next=/trackapp/paiement";
        return;
      }

      if (!res.ok) {
        throw new Error(data.error || "Impossible d'activer l'accès dev.");
      }

      window.location.href = data.redirect ?? "/trackapp/accueil";
    } catch (err) {
      setError(err instanceof Error ? err.message : "Échec du bypass dev.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="ta-dev-premium-bypass">
      <button type="button" className="ta-dev-premium-bypass__btn" onClick={unlock} disabled={busy}>
        {busy ? "Activation…" : "Dev — accéder au SaaS (sans payer)"}
      </button>
      {error ? <p className="ta-dev-premium-bypass__error">{error}</p> : null}
    </div>
  );
}
