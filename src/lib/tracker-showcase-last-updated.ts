/** Ligne type « 11 mai 2026 · 22:46 » (client + J−2 j, heure aléatoire) pour showcases tracker. */

export function formatShowcaseLastUpdatedLine() {
  const d = new Date();
  d.setDate(d.getDate() - 2);
  const dateStr = new Intl.DateTimeFormat("fr-FR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(d);
  const hour = Math.floor(Math.random() * 24);
  const minute = Math.floor(Math.random() * 60);
  const timeStr = new Intl.DateTimeFormat("fr-FR", {
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(2000, 0, 1, hour, minute));
  return `${dateStr} · ${timeStr}`;
}
