/**
 * Sélection d’apps Trackapp — réexport du module canonique `selection-app`.
 * @see src/lib/selection-app/manifest.ts pour ajouter une app.
 */

import {
  listHeroRotatorApps,
  listSelectionAppItems,
} from "@/lib/selection-app";

export type { AppShowcaseVideoItem, HeroRotatorAppRef } from "@/lib/selection-app/types";

export {
  HERO_ROTATOR_APP_STORE_IDS,
  listHeroRotatorApps,
  listSelectionAppItems,
} from "@/lib/selection-app";

/** @deprecated Utiliser `listSelectionAppItems`. */
export const listAppShowcaseVideoItems = listSelectionAppItems;

/** @deprecated Utiliser `listSelectionAppItems().map(v => v.src)`. */
export function listAppShowcaseVideos(): string[] {
  return listSelectionAppItems().map((v) => v.src);
}
