/**
 * CA mensuel showcase : format compact K / M (EUR), déterministe côté montant entier.
 */

import { TRACKAPP_LOW_REVENUE_LABEL } from "@/lib/trackapp-revenue-display";
import { derivePreciseRevenueDisplayUsd } from "@/lib/tracker-revenue-display";

/** Clé stable : le chemin `src` de la vidéo est unique ; le nom reste lisible pour debug. */
export function showcaseMonthlyRevenueCanonicalKey(displayName: string, videoSrcPath: string): string {
  return `${videoSrcPath}\n${displayName}`;
}

export function deriveShowcaseMonthlyRevenueEUR(approxEUR: number, canonicalKey: string): number {
  if (!Number.isFinite(approxEUR) || approxEUR < 500) {
    return Math.max(0, Math.round(approxEUR));
  }
  return derivePreciseRevenueDisplayUsd(approxEUR, `showcase-eur:${canonicalKey}`);
}

function formatCompactMultiplier(value: number, suffix: "K" | "M"): string {
  const rounded = Math.round(value * 10) / 10;
  if (rounded >= 10 || suffix === "K") {
    return `${Math.round(rounded)}${suffix}`;
  }
  const whole = Math.floor(rounded);
  const frac = Math.round((rounded - whole) * 10);
  if (frac === 0) return `${whole}${suffix}`;
  return `${whole},${frac}${suffix}`;
}

/** Montant EUR → libellé compact (ex. 738K €, 34M €). */
export function formatShowcaseRevenueEurCompact(eur: number): string {
  const n = Math.max(0, Math.round(eur));
  if (n <= 0) return "—";
  if (n < 100) return TRACKAPP_LOW_REVENUE_LABEL;

  if (n >= 1_000_000) {
    return `${formatCompactMultiplier(n / 1_000_000, "M")} €`;
  }

  if (n >= 1_000) {
    return `${formatCompactMultiplier(n / 1_000, "K")} €`;
  }

  return `${n} €`;
}

/** Parse un libellé EUR Trackapp (ex. « 737 540 € ») puis format compact. */
export function formatShowcaseRevenueEurCompactFromLabel(eurLabel: string): string {
  const trimmed = eurLabel.trim();
  if (!trimmed || trimmed === "—") return "—";
  if (trimmed === TRACKAPP_LOW_REVENUE_LABEL || trimmed.startsWith("<")) return TRACKAPP_LOW_REVENUE_LABEL;

  const digits = trimmed.replace(/[^\d]/g, "");
  const parsed = Number.parseInt(digits, 10);
  if (!Number.isFinite(parsed) || parsed <= 0) return trimmed;

  return formatShowcaseRevenueEurCompact(parsed);
}

/** Libellé CA mensuel showcase — EUR compact, jamais en $US. */
export function formatShowcaseEurMonthlyLabel(eur: number): string {
  const amount = formatShowcaseRevenueEurCompact(eur);
  if (amount === "—") return "—";
  return `${amount} / mois`;
}
