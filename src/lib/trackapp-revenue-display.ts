/**
 * Revenus mensuels affichés en EUR dans l’espace Trackapp (SaaS).
 * Source unique : agrégat Sensor Tower (USD) → conversion EUR à l’affichage.
 * Aucune estimation par rang / formule interne.
 */

import type { IosAggregateAppMetrics } from "@/lib/apple-charts";
import { derivePreciseRevenueDisplayUsd } from "@/lib/tracker-revenue-display";

/** Taux USD → EUR pour l’affichage SaaS (déterministe). */
export const TRACKAPP_USD_TO_EUR = 0.92;

/**
 * Sensor Tower utilise souvent un plancher ~5 000 $ pour « pas de revenu ».
 * Tout montant ≤ ce seuil (USD ou EUR affiché) = 0 €.
 */
export const TRACKAPP_ZERO_REVENUE_MAX_USD = 5_000;
export const TRACKAPP_ZERO_REVENUE_MAX_EUR = 5_000;

const eurFormatter = new Intl.NumberFormat("fr-FR", {
  style: "currency",
  currency: "EUR",
  maximumFractionDigits: 0,
  minimumFractionDigits: 0,
});

/** Libellé « 0 € » (revenu nul ou plancher ST). */
export function formatTrackappZeroRevenueEur(): string {
  return eurFormatter.format(0);
}

export function isTrackappSentinelOrZeroRevenueUsd(usd: number): boolean {
  return !Number.isFinite(usd) || usd <= TRACKAPP_ZERO_REVENUE_MAX_USD;
}

export function isTrackappSentinelOrZeroRevenueEur(eur: number): boolean {
  return !Number.isFinite(eur) || eur <= TRACKAPP_ZERO_REVENUE_MAX_EUR;
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
  if (isTrackappSentinelOrZeroRevenueEur(eur)) return formatTrackappZeroRevenueEur();
  return eurFormatter.format(eur);
}

/** Convertit un montant USD Sensor Tower en libellé EUR. */
export function formatUsdAsEurForTrackapp(usd: number): string {
  if (!Number.isFinite(usd)) return "—";
  if (isTrackappSentinelOrZeroRevenueUsd(usd)) return formatTrackappZeroRevenueEur();
  const eur = usdToTrackappEur(usd);
  return formatEurTrackerPrecise(eur);
}

/** Parse un libellé ST / formatUsdTrackerPrecise → USD (sans suffixe k/m). */
function parseUsdCurrencyLabel(label: string): number | null {
  const s = label.trim();
  if (!s || s === "—" || isNegativeRevenueLabel(s)) return null;
  const digits = s.replace(/[^\d]/g, "");
  if (!digits) return null;
  const n = Number.parseInt(digits, 10);
  return Number.isFinite(n) && n > 0 ? n : null;
}

/** Revenu agrégé Sensor Tower → EUR (plancher ≤5k$ traité comme 0). */
function formatTrackappRevenueFromUsdAnchor(usd: number, appId: string): string {
  if (!Number.isFinite(usd) || usd <= 0) return "—";
  if (isTrackappSentinelOrZeroRevenueUsd(usd)) return formatTrackappZeroRevenueEur();
  const displayUsd = derivePreciseRevenueDisplayUsd(usd, `ios-agg-rev:${appId}`);
  if (isTrackappSentinelOrZeroRevenueUsd(displayUsd)) return formatTrackappZeroRevenueEur();
  return formatUsdAsEurForTrackapp(displayUsd);
}

export function formatTrackappAggregateRevenueEur(
  agg: IosAggregateAppMetrics,
  appId: string,
): string {
  if (agg.revenue < 0 || isNegativeRevenueLabel(agg.revenueString)) {
    return formatTrackappZeroRevenueEur();
  }

  if (agg.revenue > 0) {
    return formatTrackappRevenueFromUsdAnchor(agg.revenue, appId);
  }

  const fromString = parseUsdCurrencyLabel(agg.revenueString);
  if (fromString != null) {
    if (/€|eur/i.test(agg.revenueString) && isTrackappSentinelOrZeroRevenueEur(fromString)) {
      return formatTrackappZeroRevenueEur();
    }
    return formatTrackappRevenueFromUsdAnchor(fromString, appId);
  }

  if (agg.revenue === 0) return formatTrackappZeroRevenueEur();
  return "—";
}

/** Au moins un signal ST (téléchargements ou revenus). */
export function hasAnyTrackerAggregateSignal(
  agg: IosAggregateAppMetrics | null | undefined,
): agg is IosAggregateAppMetrics {
  if (!agg) return false;
  const hasDl =
    agg.downloads > 0 ||
    (agg.downloadsString.trim() !== "" && agg.downloadsString !== "—");
  const hasRev =
    agg.revenue > 0 ||
    (agg.revenueString.trim() !== "" && agg.revenueString !== "—");
  return hasDl || hasRev;
}

/** Recherche live + fiches : revenu affichable même si ST ne renvoie que les téléchargements. */
export function formatTrackappLiveSearchRevenueEur(
  agg: IosAggregateAppMetrics | null,
  appId: string,
): string {
  if (!agg) return "—";
  const formatted = formatTrackappAggregateRevenueEur(agg, appId);
  if (formatted !== "—") return finalizeTrackappRevenueEurLabel(formatted);
  if (agg.revenue === 0) return formatTrackappZeroRevenueEur();
  const hasDl =
    agg.downloads > 0 ||
    (agg.downloadsString.trim() !== "" && agg.downloadsString !== "—");
  if (hasDl) return formatTrackappZeroRevenueEur();
  return "—";
}

/** Filet de sécurité : tout libellé ≤ 5 000 € affiché (ex. cache ancien « 4 639 € ») → 0 €. */
export function finalizeTrackappRevenueEurLabel(label: string): string {
  if (!label || label === "—") return label;
  const digits = label.replace(/[^\d]/g, "");
  if (!digits) return label;
  const n = Number.parseInt(digits, 10);
  if (Number.isFinite(n) && isTrackappSentinelOrZeroRevenueEur(n)) {
    return formatTrackappZeroRevenueEur();
  }
  return label;
}

/** Remplace $US par € dans un libellé ST déjà formaté (secours). */
export function normalizeRevenueLabelToEur(label: string): string {
  if (!label || label === "—") return label;
  if (isNegativeRevenueLabel(label)) return formatTrackappZeroRevenueEur();
  const parsed = parseUsdCurrencyLabel(label);
  if (parsed != null) return formatUsdAsEurForTrackapp(parsed);
  return label.replace(/\$US/gi, "€").replace(/\$/g, "€");
}
