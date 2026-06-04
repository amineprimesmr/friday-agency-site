import { SELECTION_APP_CATALOG, SELECTION_APP_PUBLIC_DIR } from "@/lib/selection-app/manifest";
import type { AppShowcaseVideoItem, HeroRotatorAppRef } from "@/lib/selection-app/types";

export function isSelectionAppStoreId(appStoreId: string): boolean {
  return /^\d{6,}$/.test(appStoreId);
}

function publicAssetPath(filename: string): string {
  return `${SELECTION_APP_PUBLIC_DIR}/${encodeURIComponent(filename)}`;
}

function entryToItem(entry: (typeof SELECTION_APP_CATALOG)[number]): AppShowcaseVideoItem {
  const posterFile = entry.posterFile?.trim() ?? "";
  const posterSrc = posterFile ? publicAssetPath(posterFile) : "";
  const localArtwork = entry.artworkUrl?.startsWith(SELECTION_APP_PUBLIC_DIR) ? entry.artworkUrl : "";
  const artworkUrl = entry.artworkUrl?.trim() || posterSrc || "";
  const iconSrc = posterSrc || localArtwork || artworkUrl;

  return {
    src: publicAssetPath(entry.videoFile),
    posterSrc,
    iconSrc,
    displayName: entry.displayName,
    appStoreId: entry.appStoreId,
    artworkUrl,
    approxMonthlyRevenueEUR: entry.approxMonthlyRevenueEUR ?? 0,
  };
}

/** Liste synchrone depuis le manifeste (utilisable côté client). */
export function listSelectionAppItemsFromManifest(): AppShowcaseVideoItem[] {
  return [...SELECTION_APP_CATALOG]
    .sort((a, b) => a.sortOrder - b.sortOrder)
    .map(entryToItem);
}

export function listHeroRotatorAppsFromManifest(
  items: readonly AppShowcaseVideoItem[],
): Array<{ id: string; name: string; artworkUrl: string; iconSrc: string }> {
  const heroIds = new Set(
    SELECTION_APP_CATALOG.filter((entry) => entry.heroRotator).map((entry) => entry.appStoreId),
  );
  const heroOrder = SELECTION_APP_CATALOG.filter((entry) => entry.heroRotator).map((entry) => entry.appStoreId);

  const byId = new Map(items.map((item) => [item.appStoreId, item]));
  return heroOrder.flatMap((id) => {
    if (!heroIds.has(id)) return [];
    const item = byId.get(id);
    if (!item) return [];
    return [
      {
        id: item.appStoreId,
        name: item.displayName,
        artworkUrl: item.artworkUrl,
        iconSrc: item.iconSrc,
      },
    ];
  });
}

/** Apps du rotator hero AppLAB — safe côté client. */
export function listHeroRotatorApps(): HeroRotatorAppRef[] {
  return listHeroRotatorAppsFromManifest(listSelectionAppItemsFromManifest());
}
