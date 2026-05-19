/**
 * Revenus mensuels affichés en EUR dans l’espace Trackapp (SaaS).
 * Les montants sources restent en USD (Sensor Tower / modèle interne) ; conversion fixe à l’affichage.
 */

import {
  estimateMonthlyRevenueUsd,
  type CountryCode,
} from "@/lib/apple-charts";
import type { IosAggregateAppMetrics } from "@/lib/apple-charts";
import { derivePreciseRevenueDisplayUsd } from "@/lib/tracker-revenue-display";

/** Taux USD → EUR pour l’affichage SaaS (déterministe). */
export const TRACKAPP_USD_TO_EUR = 0.92;

export function usdToTrackappEur(usd: number): number {
  if (!Number.isFinite(usd) || usd <= 0) return 0;
  return Math.round(usd * TRACKAPP_USD_TO_EUR);
}

export function formatEurTrackerPrecise(eur: number): string {
  if (!Number.isFinite(eur) || eur <= 0) return "—";
  return new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 0,
    minimumFractionDigits: 0,
  }).format(eur);
}

/** Convertit un montant USD (scalaire ou « précis ») en libellé EUR. */
export function formatUsdAsEurForTrackapp(usd: number): string {
  const eur = usdToTrackappEur(usd);
  return formatEurTrackerPrecise(eur);
}

/** Revenu agrégé Sensor Tower → EUR (même ancrage que `revenueString` côté tracker). */
export function formatTrackappAggregateRevenueEur(
  agg: IosAggregateAppMetrics,
  appId: string,
): string {
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

/** Estimation mensuelle (hors agrégat ST) en EUR. */
export function formatEstimatedMonthlyRevenuePreciseEur(
  rank: number,
  price: number,
  categoryId: string,
  country: CountryCode,
  stableKey: string,
): string {
  const usd = estimateMonthlyRevenueUsd(rank, price, categoryId, country);
  if (!usd || usd <= 0) return "—";
  const displayUsd = derivePreciseRevenueDisplayUsd(usd, `est-rev:${stableKey}`);
  return formatUsdAsEurForTrackapp(displayUsd);
}

/** Parse un libellé `formatUsdTrackerPrecise` (ex. « 5 007 483 $US ») → USD. */
function parseUsdCurrencyLabel(label: string): number | null {
  const s = label.trim();
  if (!s || s === "—") return null;
  const digits = s.replace(/[^\d]/g, "");
  if (!digits) return null;
  const n = Number.parseInt(digits, 10);
  return Number.isFinite(n) && n > 0 ? n : null;
}

/** Remplace $US par € dans un libellé déjà formaté (secours). */
export function normalizeRevenueLabelToEur(label: string): string {
  if (!label || label === "—") return label;
  const parsed = parseUsdCurrencyLabel(label);
  if (parsed != null) return formatUsdAsEurForTrackapp(parsed);
  return label.replace(/\$US/gi, "€").replace(/\$/g, "€");
}
