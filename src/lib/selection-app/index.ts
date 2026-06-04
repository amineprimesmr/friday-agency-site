export type {
  AppShowcaseVideoItem,
  HeroRotatorAppRef,
  SelectionAppEntry,
} from "@/lib/selection-app/types";

export {
  HERO_ROTATOR_APP_STORE_IDS,
  SELECTION_APP_CATALOG,
  SELECTION_APP_PUBLIC_DIR,
} from "@/lib/selection-app/manifest";

export {
  isSelectionAppStoreId,
  listHeroRotatorApps,
  listHeroRotatorAppsFromManifest,
  listSelectionAppItemsFromManifest,
} from "@/lib/selection-app/items";

import { listSelectionAppItemsFromManifest } from "@/lib/selection-app/items";

/** @deprecated Préférer `listSelectionAppItemsFromManifest`. */
export function listSelectionAppItems() {
  return listSelectionAppItemsFromManifest();
}
