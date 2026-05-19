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
  friendDiscountPercent: number;
  commissionMrrCents: number;
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
  return `${(cents / 100).toLocaleString("fr-FR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} €`;
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
      if (!res.ok) throw new Error(json.error ?? "Impossible de charger le dashboard affiliation.");
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
      setActionMsg("Virement initié vers ton compte bancaire.");
      await load();
    } catch (e) {
      setActionMsg(e instanceof Error ? e.message : "Erreur virement.");
    } finally {
      setBusy(null);
    }
  }

  if (loading) {
    return (
      <div className="ta-aff-dash ta-aff-dash--state" role="status">
        Chargement du dashboard affiliation…
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="ta-aff-dash ta-aff-dash--state ta-aff-dash--error">
        <p className="m-0">{error ?? "Données indisponibles."}</p>
        <button type="button" className="ta-aff-dash__retry" onClick={() => void load()}>
          Réessayer
        </button>
      </div>
    );
  }

  const commissionMrrEur = data.commissionMrrCents / 100;
  const discountPct = data.friendDiscountPercent;
  const canPayout =
    data.connect.payoutsEnabled && data.balance.availableCents >= data.minPayoutCents;

  return (
    <div className="ta-aff-dash">
      <header className="ta-aff-dash__hero">
        <p className="trackapp-workspace-hero-kicker">Affiliation</p>
        <h1 className="ta-aff-dash__title">Dashboard affiliation</h1>
        <p className="ta-aff-dash__lead">
          Partage <strong>ton lien personnel</strong> : ton audience bénéficie de{" "}
          <strong>−{discountPct}&nbsp;%</strong> sur l&apos;abonnement au moment du paiement (offre filleul), et tu
          touches <strong>{commissionMrrEur.toLocaleString("fr-FR")}&nbsp;€ de MRR</strong> par filleul actif, chaque
          mois tant qu&apos;il reste abonné.
        </p>
      </header>

      <section className="ta-aff-dash__panel ta-aff-dash__panel--highlight" aria-labelledby="ta-aff-link-title">
        <h2 id="ta-aff-link-title" className="ta-aff-dash__panel-title">
          Lien à copier
        </h2>
        <p className="ta-aff-dash__panel-desc">
          Envoie ce lien : les inscriptions sont rattachées à ton compte. Les personnes qui souscrivent l&apos;abonnement
          après être passées par ton lien obtiennent <strong>−{discountPct}&nbsp;%</strong> sur le plan (réduction appliquée
          au paiement Stripe lorsque la remise filleul est activée sur le projet).
        </p>
        <div className="ta-aff-dash__copy-row">
          <code className="ta-aff-dash__url" title={data.referralLink}>
            {data.referralLink}
          </code>
          <button type="button" className="ta-aff-dash__copy-btn" onClick={() => void copyLink()}>
            {copied ? "Copié ✓" : "Copier"}
          </button>
        </div>
        <p className="ta-aff-dash__code-line">
          Code court : <strong>{data.referralCode}</strong> (déjà dans l&apos;URL <span className="text-[var(--dash-muted-light)]">?ref=…</span>)
        </p>
      </section>

      <div className="ta-aff-dash__stats">
        <article className="ta-aff-dash__stat">
          <span className="ta-aff-dash__stat-label">Gains totaux</span>
          <strong>{formatEur(data.balance.totalEarnedCents)}</strong>
        </article>
        <article className="ta-aff-dash__stat">
          <span className="ta-aff-dash__stat-label">Disponible</span>
          <strong className="text-emerald-700">{formatEur(data.balance.availableCents)}</strong>
        </article>
        <article className="ta-aff-dash__stat">
          <span className="ta-aff-dash__stat-label">En attente</span>
          <strong>{formatEur(data.balance.pendingCents)}</strong>
          <span className="ta-aff-dash__stat-hint">Sécurisation ~14 jours</span>
        </article>
        <article className="ta-aff-dash__stat">
          <span className="ta-aff-dash__stat-label">Filleuls</span>
          <strong>{data.referralsCount}</strong>
        </article>
      </div>

      <section className="ta-aff-dash__panel">
        <h2 className="ta-aff-dash__panel-title">Versements</h2>
        <p className="ta-aff-dash__panel-desc">
          Connecte un compte Stripe pour recevoir tes commissions par virement. Seuil minimum :{" "}
          {formatEur(data.minPayoutCents)}.
        </p>
        <div className="ta-aff-dash__actions">
          {!data.connect.payoutsEnabled ? (
            <button
              type="button"
              className="ta-aff-dash__btn ta-aff-dash__btn--primary"
              disabled={busy === "connect" || !data.connect.configured}
              onClick={() => void startConnect()}
            >
              {busy === "connect" ? "Redirection Stripe…" : "Configurer les virements (Stripe)"}
            </button>
          ) : (
            <button
              type="button"
              className="ta-aff-dash__btn ta-aff-dash__btn--primary"
              disabled={!canPayout || busy === "payout"}
              onClick={() => void requestPayout()}
            >
              {busy === "payout" ?
                "Traitement…"
              : `Demander un virement (min. ${formatEur(data.minPayoutCents)})`}
            </button>
          )}
          <Link
            href={`/trackapp/paiement?ref=${encodeURIComponent(data.referralCode)}`}
            className="ta-aff-dash__btn ta-aff-dash__btn--ghost"
            target="_blank"
            rel="noreferrer"
          >
            Prévisualiser la page paiement filleul
          </Link>
        </div>
        {actionMsg ? <p className="ta-aff-dash__msg">{actionMsg}</p> : null}
      </section>

      {data.recentCommissions.length > 0 ? (
        <section className="ta-aff-dash__table-block">
          <h2 className="ta-aff-dash__panel-title">Dernières commissions</h2>
          <div className="ta-aff-dash__table-wrap">
            <table className="ta-aff-dash__table">
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
        </section>
      ) : null}
    </div>
  );
}
