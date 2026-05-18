/** Marque la prochaine visite de `/trackapp/paiement` pour une entrée animée (mobile). */
export const TRACKAPP_PAIEMENT_SLIDE_UP_KEY = "trackapp:paiement-slide-enter";

export function prepareTrackappPaiementSlideEnter(): void {
  if (typeof window === "undefined") return;
  try {
    if (!window.matchMedia("(min-width: 1024px)").matches) {
      sessionStorage.setItem(TRACKAPP_PAIEMENT_SLIDE_UP_KEY, "1");
    }
  } catch {
    /* private mode / quota */
  }
}
