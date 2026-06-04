import type { CountryCode } from "@/lib/apple-charts";

/** Lien App Store canonique (sans slug — évite les 404 slug LLM). */
export function buildAppStoreUrl(appId: string, country: CountryCode = "fr"): string {
  const cc = country.toLowerCase();
  return `https://apps.apple.com/${cc}/app/id${appId}`;
}

/** Extrait l’ID numérique d’une URL App Store / iTunes. */
export function extractAppStoreId(url: string | null | undefined): string | null {
  if (!url) return null;
  const m = url.match(/\/id(\d{6,12})/i);
  return m?.[1] ?? null;
}

/** Normalise une URL ST ou LLM vers le format apps.apple.com/{country}/app/id{id}. */
export function normalizeAppStoreUrl(
  raw: string | null | undefined,
  appId: string,
  country: CountryCode,
): string {
  const idFromRaw = extractAppStoreId(raw);
  const id = idFromRaw && idFromRaw === appId ? idFromRaw : appId;
  return buildAppStoreUrl(id, country);
}

/** URL Sensor Tower relative → absolue (non utilisée pour ouvrir l’App Store). */
export function sensorTowerAppViewUrl(path: string | null | undefined): string | null {
  if (!path || typeof path !== "string") return null;
  const trimmed = path.trim();
  if (!trimmed) return null;
  if (trimmed.startsWith("http")) return trimmed;
  return `https://app.sensortower.com${trimmed.startsWith("/") ? "" : "/"}${trimmed}`;
}
