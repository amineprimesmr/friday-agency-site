/** Paramètres d’iframe « classements par pays » (/embed/countries/[id]). */

export type EmbedCountriesOptions = {
  theme?: "dark" | "light" | "system" | "auto";
  view?: "list" | "globe";
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
  if (view === "globe") u.searchParams.set("view", "globe");
  return u.toString();
}
