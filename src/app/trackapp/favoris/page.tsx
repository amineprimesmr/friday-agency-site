import type { Metadata } from "next";

import { TrackappFavoritesEmpty } from "@/components/trackapp/trackapp-favorites-empty";
import { TrackappFavoritesShell } from "@/components/trackapp/trackapp-favorites-shell";
import { TrackappResourcesGallery } from "@/components/trackapp/trackapp-resources-gallery";
import { getTrackappDesignFavoriteIds } from "@/lib/trackapp-design-favorites";
import { scanTrackappResources } from "@/lib/trackapp-ressources/scan";

export const metadata: Metadata = {
  title: "Mes favoris — Trackapp",
  description: "Designs et ressources vidéo sauvegardés.",
};

export default async function TrackappFavorisPage() {
  const { baseDir, items } = await scanTrackappResources();
  const { loggedIn, favoriteIds } = await getTrackappDesignFavoriteIds();

  const favSet = new Set(favoriteIds);
  const favItems = items.filter((row) => favSet.has(row.id));

  if (favItems.length === 0) {
    return (
      <div className="relative z-[1] dashboard-main pb-10">
        <TrackappFavoritesEmpty />
      </div>
    );
  }

  return (
    <div className="relative z-[1] dashboard-main pb-16">
      <TrackappFavoritesShell>
        <div className="mt-10">
          <TrackappResourcesGallery
            items={favItems}
            configured={Boolean(baseDir)}
            favoriteIds={favoriteIds}
            enableFavorites={loggedIn}
            variant="favorites"
          />
        </div>
      </TrackappFavoritesShell>
    </div>
  );
}
