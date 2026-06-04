import type { Metadata } from "next";

import { TrackappResourcesGallery } from "@/components/trackapp/trackapp-resources-gallery";
import { scanTrackappResources } from "@/lib/trackapp-ressources/scan";

export const metadata: Metadata = {
  title: "Ressources — Trackapp",
  description: "Démos UI et packs sources pour builder votre app avec l'IA.",
};

export default async function TrackappRessourcesPage() {
  const resourcesScan = await scanTrackappResources();

  return (
    <div className="relative z-[1] dashboard-main pb-16">
      <TrackappResourcesGallery
        items={resourcesScan.items}
        configured={resourcesScan.items.length > 0 || Boolean(resourcesScan.baseDir)}
      />
    </div>
  );
}
