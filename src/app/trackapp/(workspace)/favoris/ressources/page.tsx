import type { Metadata } from "next";

import { TrackappResourcesGallery } from "@/components/trackapp/trackapp-resources-gallery";
import { getTrackappProfileFavorites } from "@/lib/trackapp-profile-favorites";
import { scanTrackappResources } from "@/lib/trackapp-ressources/scan";

export const metadata: Metadata = {
  title: "Favoris — Ressources",
  description: "Vidéos et ressources que tu as mises en favori.",
};

export default async function TrackappFavoriteRessourcesPage() {
  const { baseDir, items } = await scanTrackappResources();
  const { loggedIn, designIds } = await getTrackappProfileFavorites();

  return (
    <div className="relative z-[1] dashboard-main pb-16">
      <section className="dashboard-section">
        <p className="trackapp-workspace-hero-kicker">Favoris</p>
        <h1 className="trackapp-workspace-hero-title">Ressources</h1>
        <p className="trackapp-workspace-hero-desc max-w-[68ch]">
          Uniquement les vidéos que tu as likées. Utilise le cœur sur la page Ressources pour en ajouter.
        </p>
      </section>

      <TrackappResourcesGallery
        items={items}
        configured={Boolean(baseDir)}
        favoriteIds={designIds}
        enableFavorites={loggedIn}
        initialFavoritesOnly
      />
    </div>
  );
}
