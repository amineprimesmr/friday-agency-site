/** Paramètres d’iframe « classements par pays » (/embed/countries/[id]). */

export type EmbedCountriesOptions = {
  theme?: "dark" | "light" | "system" | "auto";
  view?: "list" | "globe";
  /** Storefront pour la fiche (défaut : France, `fr`). */
  country?: string;
};

export function normalizeEmbedTheme(raw: string | undefined): "dark" | "light" | "system" {
  const v = (raw ?? "system").toLowerCase();
  if (v === "dark") return "dark";
  if (v === "light") return "light";
  if (v === "system" || v === "auto") return "system";
  return "system";
}

export function normalizeEmbedView(raw: string | undefined): "list" | "globe" {
  return raw?.toLowerCase() === "globe" ? "globe" : "list";
}

/** Origine publique sans slash final — pour snippets iframe. */
export function canonicalSiteOrigin(): string {
  const raw = process.env.NEXT_PUBLIC_APP_URL?.trim();
  const fallback = "http://localhost:3000";
  if (!raw) return fallback.replace(/\/$/, "");
  try {
    const u = new URL(/^https?:\/\//i.test(raw) ? raw : `https://${raw}`);
    return u.origin;
  } catch {
    return fallback.replace(/\/$/, "");
  }
}

export function buildEmbedCountriesIframeSrc(appId: string, opts: EmbedCountriesOptions): string {
  const origin = canonicalSiteOrigin();
  const theme = normalizeEmbedTheme(opts.theme);
  const view = normalizeEmbedView(opts.view);
  const u = new URL(`${origin}/embed/countries/${appId}`);
  u.searchParams.set("theme", theme);
  if (opts.country) u.searchParams.set("country", opts.country);
  if (view === "globe") u.searchParams.set("view", "globe");
  return u.toString();
}

export type EmbedSimilarMarketOptions = {
  country?: string;
  theme?: "dark" | "light" | "system" | "auto";
};

export function buildEmbedSimilarIframeSrc(appId: string, opts: EmbedSimilarMarketOptions = {}): string {
  const origin = canonicalSiteOrigin();
  const theme = normalizeEmbedTheme(opts.theme);
  const u = new URL(`${origin}/embed/similar/${appId}`);
  u.searchParams.set("theme", theme);
  if (opts.country) u.searchParams.set("country", opts.country);
  return u.toString();
}

/** Origine publique pour l’embed « similar » — utiliser le host **www** : l’apex `appstoretracker.com` renvoie une 308 vers www, ce qui casse souvent le chargement dans un iframe (ex. Safari). */
export function appStoreTrackerEmbedOrigin(): string {
  const raw = process.env.NEXT_PUBLIC_APPSTORETRACKER_EMBED_ORIGIN?.trim();
  const fallback = "https://www.appstoretracker.com";
  if (!raw) return fallback;
  try {
    const u = new URL(/^https?:\/\//i.test(raw) ? raw : `https://${raw}`);
    if (u.hostname === "appstoretracker.com") {
      return "https://www.appstoretracker.com";
    }
    return u.origin;
  } catch {
    return fallback;
  }
}

/** URL iframe `…/embed/similar/{appId}?country=&theme=` — même contrat que le snippet officiel, `appId` dynamique. */
export function buildAppStoreTrackerSimilarEmbedSrc(
  appId: string,
  opts: EmbedSimilarMarketOptions = {},
): string {
  const origin = appStoreTrackerEmbedOrigin();
  const theme = normalizeEmbedTheme(opts.theme);
  const u = new URL(`${origin}/embed/similar/${encodeURIComponent(appId)}`);
  u.searchParams.set("theme", theme);
  if (opts.country) u.searchParams.set("country", opts.country);
  return u.toString();
}

export function buildEmbedMarketIframeSrc(appId: string, opts: EmbedSimilarMarketOptions = {}): string {
  const origin = canonicalSiteOrigin();
  const theme = normalizeEmbedTheme(opts.theme);
  const u = new URL(`${origin}/embed/market/${appId}`);
  u.searchParams.set("theme", theme);
  if (opts.country) u.searchParams.set("country", opts.country);
  return u.toString();
}
