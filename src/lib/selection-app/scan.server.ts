import "server-only";

import { listSelectionAppItemsFromManifest } from "@/lib/selection-app/items";
import type { AppShowcaseVideoItem } from "@/lib/selection-app/types";

/**
 * Apps « Notre sélection » — liste depuis le manifest (fichiers servis sous /selection-app).
 * Pas de scan disque : évite d’embarquer les .mp4 dans les Serverless Functions Vercel.
 */
export async function scanSelectionAppItems(): Promise<AppShowcaseVideoItem[]> {
  return listSelectionAppItemsFromManifest();
}
