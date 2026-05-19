/**
 * CA mensuel showcase : à partir d’un macro éditorial (ex. 30 000 €),
 * produit un montant très « précis » — déterministe, même entrée ⇒ même valeur partout.
 */

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

/** Libellé CA mensuel showcase — toujours en EUR, jamais en $US. */
export function formatShowcaseEurMonthlyLabel(eur: number): string {
  const n = Math.max(0, Math.round(eur));
  if (n <= 0) return "—";
  const amount = new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 0,
    minimumFractionDigits: 0,
  }).format(n);
  return `${amount} / mois`;
}
