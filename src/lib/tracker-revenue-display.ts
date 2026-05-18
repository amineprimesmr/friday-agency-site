/**
 * CA mensuel (USD) : ancrage sur la valeur Sensor Tower (humanized + revenue),
 * puis affichage très « précis » (ex. 2 043 483 $US) — déterministe, proche du réel.
 */

const SALT = "trackapp:tracker:revenue-precise-usd:v2";

function fnv1a32(str: string): number {
  let h = 0x811c9dc5;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return h >>> 0;
}

function u32(canonicalKey: string, nonce: number): number {
  return fnv1a32(`${canonicalKey}\0${SALT}:${String(nonce)}`);
}

function pickInSpan(low: number, high: number, u0: number, u1: number): number {
  const span = high - low + 1;
  const mixed = (Math.imul(u0, 1597334677) ^ Math.imul(u1, 3812015801)) >>> 0;
  return low + (mixed % span);
}

function nearRatio(a: number, b: number, rel: number): boolean {
  if (!Number.isFinite(a) || !Number.isFinite(b) || a <= 0 || b <= 0) return false;
  const m = Math.max(a, b);
  return Math.abs(a - b) / m <= rel;
}

/**
 * Parse les libellés Sensor Tower : "$2m", "20k", "$21,5K", "$1,234,567", etc.
 */
export function parseHumanizedRevenueUsdString(raw: string): number | null {
  let s = raw.trim();
  if (!s || s === "—" || /^n\/a$/i.test(s)) return null;
  s = s.replace(/^<\s*/i, "").trim();
  s = s.replace(/^\$\s*/i, "").replace(/\s/g, "");
  if (!s) return null;

  const suffixed = s.match(/^([\d.,]+)\s*([kmbt])$/i);
  if (suffixed) {
    const part = suffixed[1];
    const normalized =
      /^\d+,\d+$/.test(part) && !part.includes(".") ? part.replace(",", ".") : part.replace(/,/g, "");
    const v = Number.parseFloat(normalized);
    if (!Number.isFinite(v)) return null;
    const u = suffixed[2].toLowerCase();
    const mult = u === "k" ? 1e3 : u === "m" ? 1e6 : u === "b" ? 1e9 : 1e12;
    const n = v * mult;
    return Number.isFinite(n) && n > 0 ? n : null;
  }

  const plain = s.replace(/,/g, "").replace(/^\$/, "");
  const n = Number.parseFloat(plain);
  return Number.isFinite(n) && n > 0 ? n : null;
}

/**
 * Retient un scalaire USD cohérent avec l’objet `humanized_worldwide_last_month_revenue`.
 * En cas d’écart API chiffrée vs libellé, on suit le libellé (vérité affichée côté ST).
 */
export function resolveSensorTowerRevenueUsd(
  rev: Record<string, unknown> | undefined,
): number | null {
  if (!rev) return null;

  const strRaw = String(rev.string ?? "").trim();
  const fromString = parseHumanizedRevenueUsdString(strRaw);

  const raw = rev.revenue;
  const rawNum = typeof raw === "number" ? raw : typeof raw === "string" ? Number.parseFloat(raw) : NaN;

  if (Number.isFinite(rawNum) && rawNum > 0 && fromString != null) {
    if (nearRatio(rawNum, fromString, 0.12)) {
      return Math.round(rawNum);
    }
    const cents = rawNum / 100;
    if (nearRatio(cents, fromString, 0.06)) {
      return Math.round(cents);
    }
    return Math.round(fromString);
  }

  if (Number.isFinite(rawNum) && rawNum > 0) {
    return Math.round(rawNum);
  }

  return fromString != null ? Math.round(fromString) : null;
}

/** Variation déterministe serrée autour du montant ST (±~1–2 %). */
export function derivePreciseRevenueDisplayUsd(anchorUsd: number, canonicalKey: string): number {
  if (!Number.isFinite(anchorUsd) || anchorUsd <= 0) return 0;
  if (anchorUsd < 500) return Math.max(0, Math.round(anchorUsd));

  const base = Math.round(anchorUsd);
  const pct = base >= 500_000 ? 0.007 : base >= 50_000 ? 0.01 : base >= 5_000 ? 0.014 : 0.02;
  const low = Math.max(1, Math.floor(base * (1 - pct)));
  const high = Math.max(low + 1, Math.ceil(base * (1 + pct)));

  const u0 = u32(canonicalKey, 0);
  const u1 = u32(canonicalKey, 1);
  let v = pickInSpan(low, high, u0, u1);

  if (base >= 10_000 && (v % 1_000 === 0 || v % 500 === 0)) {
    const bump = Number(u32(canonicalKey, 2) % 97) - 48;
    v = Math.min(high, Math.max(low, v + bump));
  }
  if (base >= 5_000 && v % 10 === 0) {
    const d = 1 + (u32(canonicalKey, 3) % 9);
    v = Math.min(high, Math.max(low, v + d));
  }

  return Math.min(high, Math.max(low, v));
}

export function formatUsdTrackerPrecise(usd: number): string {
  if (!Number.isFinite(usd) || usd <= 0) return "—";
  return new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
    minimumFractionDigits: 0,
  }).format(usd);
}
