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
 * Sensor Tower utilise souvent un plancher ~5 000 $ / ~5 000 téléchargements pour « quasi nul ».
 * Tout montant ≤ ce seuil → libellés bas `<100€` / `<100` (plus lisible que 0 € ou 1K).
 */
export const TRACKAPP_ZERO_REVENUE_MAX_USD = 5_000;
export const TRACKAPP_ZERO_REVENUE_MAX_EUR = 5_000;
export const TRACKAPP_LOW_DOWNLOADS_MAX = 5_000;

export const TRACKAPP_LOW_REVENUE_LABEL = "<100€";
export const TRACKAPP_LOW_DOWNLOADS_LABEL = "<100";

/** Valeur de tri pour les apps sous le seuil (groupe en bas, ordre stable). */
export const TRACKAPP_LOW_METRICS_SORT_VALUE = 50;

const eurFormatter = new Intl.NumberFormat("fr-FR", {
  style: "currency",
  currency: "EUR",
  maximumFractionDigits: 0,
  minimumFractionDigits: 0,
});

/** Revenu nul ou plancher ST (≤ 5k$) — affichage SaaS. */
export function formatTrackappLowRevenueEur(): string {
  return TRACKAPP_LOW_REVENUE_LABEL;
}

/** @deprecated Alias — préférer `formatTrackappLowRevenueEur`. */
export function formatTrackappZeroRevenueEur(): string {
  return formatTrackappLowRevenueEur();
}

export function isTrackappLowDownloads(downloads: number): boolean {
  return !Number.isFinite(downloads) || downloads <= TRACKAPP_LOW_DOWNLOADS_MAX;
}

/** Parse un libellé ST type « 1K », « 2.5M », « 1200 » → scalaire. */
export function parseTrackappDownloadsScalar(label: string): number | null {
  const s = label.trim().toUpperCase();
  if (!s || s === "—") return null;
  if (s === TRACKAPP_LOW_DOWNLOADS_LABEL) return TRACKAPP_LOW_METRICS_SORT_VALUE;
  const m = s.match(/([\d.]+)\s*([KMB])?/);
  if (!m) return null;
  let n = Number(m[1]);
  if (!Number.isFinite(n)) return null;
  const unit = m[2];
  if (unit === "K") n *= 1000;
  else if (unit === "M") n *= 1_000_000;
  else if (unit === "B") n *= 1_000_000_000;
  return n;
}

export function isTrackappLowDownloadsLabel(label: string): boolean {
  if (label.trim() === TRACKAPP_LOW_DOWNLOADS_LABEL) return true;
  const n = parseTrackappDownloadsScalar(label);
  return n != null && n <= TRACKAPP_LOW_DOWNLOADS_MAX;
}

export function formatTrackappDownloadsDisplay(
  downloads: number,
  downloadsString: string,
): string {
  if (downloads > 0 && isTrackappLowDownloads(downloads)) {
    return TRACKAPP_LOW_DOWNLOADS_LABEL;
  }
  const parsed = parseTrackappDownloadsScalar(downloadsString);
  if (parsed != null && parsed <= TRACKAPP_LOW_DOWNLOADS_MAX) {
    return TRACKAPP_LOW_DOWNLOADS_LABEL;
  }
  const raw = downloadsString.trim();
  if (!raw || raw === "—") return "—";
  return raw.toUpperCase();
}

export function finalizeTrackappDownloadsLabel(label: string): string {
  if (!label || label === "—") return label;
  if (isTrackappLowDownloadsLabel(label)) return TRACKAPP_LOW_DOWNLOADS_LABEL;
  return label;
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
  if (isTrackappSentinelOrZeroRevenueEur(eur)) return formatTrackappLowRevenueEur();
  return eurFormatter.format(eur);
}

/** Convertit un montant USD Sensor Tower en libellé EUR. */
export function formatUsdAsEurForTrackapp(usd: number): string {
  if (!Number.isFinite(usd)) return "—";
  if (isTrackappSentinelOrZeroRevenueUsd(usd)) return formatTrackappLowRevenueEur();
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

/** Revenu agrégé Sensor Tower → EUR (plancher ≤5k$ → `<100€`). */
function formatTrackappRevenueFromUsdAnchor(usd: number, appId: string): string {
  if (!Number.isFinite(usd) || usd <= 0) return "—";
  if (isTrackappSentinelOrZeroRevenueUsd(usd)) return formatTrackappLowRevenueEur();
  const displayUsd = derivePreciseRevenueDisplayUsd(usd, `ios-agg-rev:${appId}`);
  if (isTrackappSentinelOrZeroRevenueUsd(displayUsd)) return formatTrackappLowRevenueEur();
  return formatUsdAsEurForTrackapp(displayUsd);
}

export function formatTrackappAggregateRevenueEur(
  agg: IosAggregateAppMetrics,
  appId: string,
): string {
  if (agg.revenue < 0 || isNegativeRevenueLabel(agg.revenueString)) {
    return formatTrackappLowRevenueEur();
  }

  if (agg.revenue > 0) {
    return formatTrackappRevenueFromUsdAnchor(agg.revenue, appId);
  }

  const fromString = parseUsdCurrencyLabel(agg.revenueString);
  if (fromString != null) {
    if (/€|eur/i.test(agg.revenueString) && isTrackappSentinelOrZeroRevenueEur(fromString)) {
      return formatTrackappLowRevenueEur();
    }
    return formatTrackappRevenueFromUsdAnchor(fromString, appId);
  }

  if (agg.revenue === 0) return formatTrackappLowRevenueEur();
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
  if (agg.revenue === 0) return formatTrackappLowRevenueEur();
  const hasDl =
    agg.downloads > 0 ||
    (agg.downloadsString.trim() !== "" && agg.downloadsString !== "—");
  if (hasDl) return formatTrackappLowRevenueEur();
  return "—";
}

function isLegacyZeroRevenueLabel(label: string): boolean {
  const compact = label.replace(/\s/g, "").toLowerCase();
  return compact === "0€" || compact === "0eur" || compact === "0$" || compact === "0usd";
}

/** Filet de sécurité : cache ancien (0 €, 4 639 €, plancher ST) → `<100€`. */
export function finalizeTrackappRevenueEurLabel(label: string): string {
  if (!label || label === "—") return label;
  if (label.trim() === TRACKAPP_LOW_REVENUE_LABEL) return TRACKAPP_LOW_REVENUE_LABEL;
  if (isLegacyZeroRevenueLabel(label)) return formatTrackappLowRevenueEur();
  const digits = label.replace(/[^\d]/g, "");
  if (!digits) return label;
  const n = Number.parseInt(digits, 10);
  if (Number.isFinite(n) && isTrackappSentinelOrZeroRevenueEur(n)) {
    return formatTrackappLowRevenueEur();
  }
  return label;
}

/** Remplace $US par € dans un libellé ST déjà formaté (secours). */
export function normalizeRevenueLabelToEur(label: string): string {
  if (!label || label === "—") return label;
  if (isNegativeRevenueLabel(label)) return formatTrackappLowRevenueEur();
  const parsed = parseUsdCurrencyLabel(label);
  if (parsed != null) return formatUsdAsEurForTrackapp(parsed);
  return label.replace(/\$US/gi, "€").replace(/\$/g, "€");
}
