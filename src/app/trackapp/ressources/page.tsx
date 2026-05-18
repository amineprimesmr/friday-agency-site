import type { Metadata } from "next";

import { TrackappResourcesGallery } from "@/components/trackapp/trackapp-resources-gallery";
import { getTrackappDesignFavoriteIds } from "@/lib/trackapp-design-favorites";
import { scanTrackappResources } from "@/lib/trackapp-ressources/scan";

export const metadata: Metadata = {
  title: "Ressources vidéo — Trackapp",
  description: "Lecteur et téléchargements des ressources vidéo Trackapp.",
};

export default async function TrackappRessourcesPage() {
  const { baseDir, items } = await scanTrackappResources();
  const { loggedIn, favoriteIds } = await getTrackappDesignFavoriteIds();

  return (
    <div className="relative z-[1] dashboard-main pb-16">
      <TrackappResourcesGallery
        items={items}
        configured={Boolean(baseDir)}
        favoriteIds={favoriteIds}
        enableFavorites={loggedIn}
      />
    </div>
  );
}
