const MONTHS_FR = [
  "janvier",
  "février",
  "mars",
  "avril",
  "mai",
  "juin",
  "juillet",
  "août",
  "septembre",
  "octobre",
  "novembre",
  "décembre",
] as const;

/** Nom du mois civil précédent (ex. en mai → « avril »). */
export function previousMonthNameFr(reference = new Date()): string {
  const d = new Date(reference.getFullYear(), reference.getMonth() - 1, 1);
  return MONTHS_FR[d.getMonth()] ?? "";
}

/** Sous-titre métriques téléchargements / revenus (ex. « en avril »). */
export function previousMonthCaptionFr(reference = new Date()): string {
  const name = previousMonthNameFr(reference);
  return name ? `en ${name}` : "";
}
