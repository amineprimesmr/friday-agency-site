/**
 * Revenus mensuels affichés en EUR dans l’espace Trackapp (SaaS).
 * Source unique : agrégat Sensor Tower (USD) → conversion EUR à l’affichage.
 * Aucune estimation par rang / formule interne.
 */

import type { IosAggregateAppMetrics } from "@/lib/apple-charts";
import { derivePreciseRevenueDisplayUsd } from "@/lib/tracker-revenue-display";

/** Taux USD → EUR pour l’affichage SaaS (déterministe). */
export const TRACKAPP_USD_TO_EUR = 0.92;

const eurFormatter = new Intl.NumberFormat("fr-FR", {
  style: "currency",
  currency: "EUR",
  maximumFractionDigits: 0,
  minimumFractionDigits: 0,
});

/** Libellé « 0 € » pour revenus négatifs ST (pas « — »). */
export function formatTrackappZeroRevenueEur(): string {
  return eurFormatter.format(0);
}

function isNegativeRevenueLabel(label: string): boolean {
  const s = label.trim();
  if (!s || s === "—") return false;
  if (/^-\s*/.test(s)) return true;
  if (/^\(\s*[\d$€]/.test(s)) return true;
  return false;
}

export function usdToTrackappEur(usd: number): number {
  if (!Number.isFinite(usd) || usd <= 0) return 0;
  return Math.round(usd * TRACKAPP_USD_TO_EUR);
}

export function formatEurTrackerPrecise(eur: number): string {
  if (!Number.isFinite(eur)) return "—";
  if (eur < 0) return formatTrackappZeroRevenueEur();
  if (eur <= 0) return "—";
  return eurFormatter.format(eur);
}

/** Convertit un montant USD Sensor Tower en libellé EUR. */
export function formatUsdAsEurForTrackapp(usd: number): string {
  if (!Number.isFinite(usd)) return "—";
  if (usd < 0) return formatTrackappZeroRevenueEur();
  const eur = usdToTrackappEur(usd);
  return formatEurTrackerPrecise(eur);
}

/** Revenu agrégé Sensor Tower → EUR (même ancrage précis que la landing). */
export function formatTrackappAggregateRevenueEur(
  agg: IosAggregateAppMetrics,
  appId: string,
): string {
  if (agg.revenue < 0 || isNegativeRevenueLabel(agg.revenueString)) {
    return formatTrackappZeroRevenueEur();
  }
  if (agg.revenue > 0) {
    const displayUsd = derivePreciseRevenueDisplayUsd(agg.revenue, `ios-agg-rev:${appId}`);
    return formatUsdAsEurForTrackapp(displayUsd);
  }
  const fromString = parseUsdCurrencyLabel(agg.revenueString);
  if (fromString != null && fromString > 0) {
    return formatUsdAsEurForTrackapp(fromString);
  }
  return "—";
}

/** Parse un libellé `formatUsdTrackerPrecise` (ex. « 5 007 483 $US ») → USD. */
function parseUsdCurrencyLabel(label: string): number | null {
  const s = label.trim();
  if (!s || s === "—" || isNegativeRevenueLabel(s)) return null;
  const digits = s.replace(/[^\d]/g, "");
  if (!digits) return null;
  const n = Number.parseInt(digits, 10);
  return Number.isFinite(n) && n > 0 ? n : null;
}

/** Remplace $US par € dans un libellé ST déjà formaté (secours). */
export function normalizeRevenueLabelToEur(label: string): string {
  if (!label || label === "—") return label;
  if (isNegativeRevenueLabel(label)) return formatTrackappZeroRevenueEur();
  const parsed = parseUsdCurrencyLabel(label);
  if (parsed != null) return formatUsdAsEurForTrackapp(parsed);
  return label.replace(/\$US/gi, "€").replace(/\$/g, "€");
}
