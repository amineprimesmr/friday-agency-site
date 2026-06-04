import "server-only";

import { access } from "node:fs/promises";
import path from "node:path";

import { listSelectionAppItemsFromManifest } from "@/lib/selection-app/items";
import { SELECTION_APP_CATALOG } from "@/lib/selection-app/manifest";
import type { AppShowcaseVideoItem } from "@/lib/selection-app/types";

const SELECTION_APP_FS_DIR = path.join(process.cwd(), "public/selection-app");

async function fileExists(relativePath: string): Promise<boolean> {
  try {
    await access(path.join(SELECTION_APP_FS_DIR, relativePath));
    return true;
  } catch {
    return false;
  }
}

/** Liste async — ne retient que les apps dont la vidéo est présente sur disque (serveur uniquement). */
export async function scanSelectionAppItems(): Promise<AppShowcaseVideoItem[]> {
  const byId = new Map(listSelectionAppItemsFromManifest().map((item) => [item.appStoreId, item]));
  const sorted = [...SELECTION_APP_CATALOG].sort((a, b) => a.sortOrder - b.sortOrder);
  const items: AppShowcaseVideoItem[] = [];

  for (const entry of sorted) {
    if (await fileExists(entry.videoFile)) {
      const item = byId.get(entry.appStoreId);
      if (item) items.push(item);
    }
  }

  return items;
}
