import { TRACKAPP_LANDING_PATH } from "@/lib/trackapp-landing-paths";

export const ONBOARDING_OVERLAY_PARAM = "onboarding";

export function isOnboardingOverlayOpen(
  searchParams: URLSearchParams | Readonly<Record<string, string | string[] | undefined>>,
): boolean {
  const raw =
    searchParams instanceof URLSearchParams ?
      searchParams.get(ONBOARDING_OVERLAY_PARAM)
    : searchParams[ONBOARDING_OVERLAY_PARAM];
  const value = Array.isArray(raw) ? raw[0] : raw;
  return value === "1" || value === "true";
}

export function resolveOnboardingReturnHref(
  searchParams: URLSearchParams | Readonly<Record<string, string | string[] | undefined>>,
  fallback = TRACKAPP_LANDING_PATH,
): string {
  const raw =
    searchParams instanceof URLSearchParams ? searchParams.get("next") : searchParams.next;
  const value = (Array.isArray(raw) ? raw[0] : raw)?.trim();
  if (!value || !value.startsWith("/trackapp/")) return fallback;
  const pathOnly = value.split("?")[0]?.split("#")[0] ?? value;
  if (
    pathOnly === "/trackapp/onboarding"
    || pathOnly === "/trackapp/creer-une-app"
    || pathOnly === "/trackapp/creer-mon-app"
  ) {
    return fallback;
  }
  return value;
}

/** Ouvre l’onboarding en overlay sur la page courante (sans changer de route). */
export function trackappOnboardingOverlayHref(
  basePath: string,
  returnPath: string = basePath,
): string {
  const path = basePath.split("?")[0]?.split("#")[0] ?? TRACKAPP_LANDING_PATH;
  const params = new URLSearchParams({ [ONBOARDING_OVERLAY_PARAM]: "1" });
  const next = returnPath.startsWith("/") ? returnPath : `/${returnPath}`;
  params.set("next", next);
  return `${path}?${params.toString()}`;
}

export function stripOnboardingOverlayParams(search: string): string {
  const params = new URLSearchParams(search.startsWith("?") ? search.slice(1) : search);
  params.delete(ONBOARDING_OVERLAY_PARAM);
  params.delete("next");
  const q = params.toString();
  return q ? `?${q}` : "";
}
