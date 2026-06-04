/** URL canonique AppLAB / landing SaaS. */
export const TRACKAPP_APP_STUDIO_PATH = "/trackapp";

/** Alias historique — redirige vers `/trackapp`. */
export const TRACKAPP_CREER_UNE_APP_PATH = "/trackapp/creer-une-app";

export function isTrackappCreerUneAppPath(pathname: string): boolean {
  const path = pathname.split("?")[0] ?? pathname;
  return (
    path === TRACKAPP_APP_STUDIO_PATH
    || path === TRACKAPP_CREER_UNE_APP_PATH
    || path.startsWith(`${TRACKAPP_CREER_UNE_APP_PATH}/`)
  );
}
