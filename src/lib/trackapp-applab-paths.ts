import type { CountryCode } from "@/lib/apple-charts";
import { trackappAccueilAppHref } from "@/lib/trackapp-apptracker-paths";

export const TRACKAPP_APPLAB_BASE = "/trackapp/applab";

const APP_ID_PATTERN = /^\d{6,12}$/;

/** Lien canonique AppLAB — fiche app avec ancre section. */
export function trackappApplabAppHref(
  appId: string,
  country: string,
  options?: { tab?: "report" | "export"; stack?: string; angle?: string },
): string {
  const url = new URL(trackappAccueilAppHref(appId, country), "http://local");
  if (options?.tab === "export") url.searchParams.set("export", "1");
  if (options?.stack) url.searchParams.set("stack", options.stack);
  if (options?.angle) url.searchParams.set("angle", options.angle);
  const hash = options?.tab === "export" ? "#trackapp-applab-export" : "#trackapp-applab";
  return `${url.pathname}?${url.searchParams.toString()}${hash}`;
}

export function isTrackappApplabAppPath(pathname: string): boolean {
  const path = pathname.split("?")[0] ?? pathname;
  const prefix = `${TRACKAPP_APPLAB_BASE}/`;
  if (!path.startsWith(prefix)) return false;
  const id = path.slice(prefix.length);
  return APP_ID_PATTERN.test(id);
}

export function isTrackappApplabPath(pathname: string): boolean {
  return pathname === TRACKAPP_APPLAB_BASE || isTrackappApplabAppPath(pathname);
}

export function normalizeApplabCountry(country: string | undefined): CountryCode {
  const c = (country ?? "fr").trim().toLowerCase();
  if (c.length === 2) return c as CountryCode;
  return "fr";
}
