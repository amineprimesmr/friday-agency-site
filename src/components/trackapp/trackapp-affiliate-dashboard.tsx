"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";

import "@/styles/trackapp-affiliate-dashboard.css";

type CommissionRow = {
  id: string;
  created_at: string;
  commission_cents: number;
  gross_amount_cents: number;
  status: string;
  event_type: string;
  description: string | null;
};

type AffiliateMe = {
  referralCode: string;
  referralLink: string;
  commissionRate: number;
  minPayoutCents: number;
  balance: {
    pendingCents: number;
    availableCents: number;
    paidCents: number;
    totalEarnedCents: number;
  };
  referralsCount: number;
  recentCommissions: CommissionRow[];
  recentPayouts: { id: string; created_at: string; amount_cents: number; status: string }[];
  connect: {
    configured: boolean;
    accountId: string | null;
    payoutsEnabled: boolean;
    detailsSubmitted: boolean;
  };
};

function formatEur(cents: number): string {
  return `${(cents / 100).toLocaleString("fr-FR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}€`;
}

function statusLabel(status: string): string {
  const map: Record<string, string> = {
    pending: "En attente",
    available: "Disponible",
    paid: "Versé",
    reversed: "Annulé",
    processing: "En cours",
    completed: "Terminé",
    failed: "Échoué",
  };
  return map[status] ?? status;
}

export function TrackappAffiliateDashboard() {
  const [data, setData] = useState<AffiliateMe | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [busy, setBusy] = useState<"connect" | "payout" | null>(null);
  const [actionMsg, setActionMsg] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/trackapp/affiliate/me", { credentials: "include" });
      const json = (await res.json()) as AffiliateMe & { error?: string };
      if (!res.ok) throw new Error(json.error ?? "Impossible de charger l’espace affilié.");
      setData(json);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Erreur réseau.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
    void fetch("/api/trackapp/affiliate/attach", { method: "POST", credentials: "include" }).catch(() => {});
  }, [load]);

  async function copyLink() {
    if (!data?.referralLink) return;
    try {
      await navigator.clipboard.writeText(data.referralLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setActionMsg("Copie impossible sur ce navigateur.");
    }
  }

  async function startConnect() {
    setBusy("connect");
    setActionMsg(null);
    try {
      const res = await fetch("/api/trackapp/affiliate/connect/onboard", {
        method: "POST",
        credentials: "include",
      });
      const json = (await res.json()) as { url?: string; error?: string };
      if (!res.ok || !json.url) throw new Error(json.error ?? "Stripe Connect indisponible.");
      window.location.href = json.url;
    } catch (e) {
      setActionMsg(e instanceof Error ? e.message : "Erreur Connect.");
      setBusy(null);
    }
  }

  async function requestPayout() {
    setBusy("payout");
    setActionMsg(null);
    try {
      const res = await fetch("/api/trackapp/affiliate/payout", {
        method: "POST",
        credentials: "include",
      });
      const json = (await res.json()) as { ok?: boolean; error?: string };
      if (!res.ok) throw new Error(json.error ?? "Virement refusé.");
      setActionMsg("Virement initié vers ton compte bancaire Stripe.");
      await load();
    } catch (e) {
      setActionMsg(e instanceof Error ? e.message : "Erreur virement.");
    } finally {
      setBusy(null);
    }
  }

  if (loading) {
    return (
      <div className="trackapp-affiliate-dash trackapp-affiliate-dash--loading">
        Chargement de ton espace affilié…
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="trackapp-affiliate-dash trackapp-affiliate-dash--error">
        <p>{error ?? "Données indisponibles."}</p>
        <button type="button" onClick={() => void load()}>
          Réessayer
        </button>
      </div>
    );
  }

  const ratePct = Math.round(data.commissionRate * 100);
  const canPayout =
    data.connect.payoutsEnabled && data.balance.availableCents >= data.minPayoutCents;

  return (
    <section className="trackapp-affiliate-dash" aria-labelledby="affiliate-dash-title">
      <header className="trackapp-affiliate-dash__head">
        <h2 id="affiliate-dash-title">Ton espace affilié</h2>
        <p>
          {ratePct}&nbsp;% de commission sur chaque paiement de tes filleuls (abonnement initial et
          renouvellements).
        </p>
      </header>

      <div className="trackapp-affiliate-dash__stats">
        <article className="trackapp-affiliate-dash__stat">
          <span className="trackapp-affiliate-dash__stat-label">Gains totaux</span>
          <strong>{formatEur(data.balance.totalEarnedCents)}</strong>
        </article>
        <article className="trackapp-affiliate-dash__stat">
          <span className="trackapp-affiliate-dash__stat-label">Disponible</span>
          <strong className="is-highlight">{formatEur(data.balance.availableCents)}</strong>
        </article>
        <article className="trackapp-affiliate-dash__stat">
          <span className="trackapp-affiliate-dash__stat-label">En attente</span>
          <strong>{formatEur(data.balance.pendingCents)}</strong>
          <span className="trackapp-affiliate-dash__stat-hint">14 jours de sécurisation</span>
        </article>
        <article className="trackapp-affiliate-dash__stat">
          <span className="trackapp-affiliate-dash__stat-label">Filleuls</span>
          <strong>{data.referralsCount}</strong>
        </article>
      </div>

      <div className="trackapp-affiliate-dash__link-box">
        <p className="trackapp-affiliate-dash__link-label">Ton lien de parrainage</p>
        <div className="trackapp-affiliate-dash__link-row">
          <code>{data.referralLink}</code>
          <button type="button" onClick={() => void copyLink()}>
            {copied ? "Copié" : "Copier"}
          </button>
        </div>
        <p className="trackapp-affiliate-dash__code">
          Code&nbsp;: <strong>{data.referralCode}</strong>
        </p>
      </div>

      <div className="trackapp-affiliate-dash__actions">
        {!data.connect.payoutsEnabled ? (
          <button
            type="button"
            className="trackapp-affiliate-dash__btn trackapp-affiliate-dash__btn--primary"
            disabled={busy === "connect" || !data.connect.configured}
            onClick={() => void startConnect()}
          >
            {busy === "connect" ? "Redirection Stripe…" : "Configurer mes virements (Stripe)"}
          </button>
        ) : (
          <button
            type="button"
            className="trackapp-affiliate-dash__btn trackapp-affiliate-dash__btn--primary"
            disabled={!canPayout || busy === "payout"}
            onClick={() => void requestPayout()}
          >
            {busy === "payout" ?
              "Virement en cours…"
            : `Demander un virement (min. ${formatEur(data.minPayoutCents)})`}
          </button>
        )}
        <Link href="/trackapp/inscription?mode=start" className="trackapp-affiliate-dash__btn trackapp-affiliate-dash__btn--ghost">
          Page d’inscription filleul
        </Link>
      </div>

      {actionMsg ? <p className="trackapp-affiliate-dash__msg">{actionMsg}</p> : null}

      {data.recentCommissions.length > 0 ? (
        <div className="trackapp-affiliate-dash__table-wrap">
          <h3>Dernières commissions</h3>
          <table className="trackapp-affiliate-dash__table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Type</th>
                <th>Brut</th>
                <th>Commission</th>
                <th>Statut</th>
              </tr>
            </thead>
            <tbody>
              {data.recentCommissions.map((row) => (
                <tr key={row.id}>
                  <td>{new Date(row.created_at).toLocaleDateString("fr-FR")}</td>
                  <td>{row.event_type === "initial" ? "Premier paiement" : "Renouvellement"}</td>
                  <td>{formatEur(row.gross_amount_cents)}</td>
                  <td>{formatEur(row.commission_cents)}</td>
                  <td>{statusLabel(row.status)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : null}
    </section>
  );
}
