import { readdir, stat } from "node:fs/promises";
import path from "node:path";

import { unstable_cache } from "next/cache";

import {
  buildGalleryRowsFromNames,
  type TrackappResourceRow,
} from "@/lib/trackapp-ressources/build-gallery-rows";
import { resolveResourcesDir } from "@/lib/trackapp-ressources/config";
import generatedGallery from "@/lib/trackapp-ressources/gallery-items.generated.json";

export type { TrackappResourceRow };

const VIDEO_RE = /\.(mp4|mov|webm|m4v)$/i;

async function fileSize(fullPath: string): Promise<number | null> {
  try {
    const s = await stat(fullPath);
    return s.isFile() ? s.size : null;
  } catch {
    return null;
  }
}

async function scanFromFilesystem(): Promise<{
  baseDir: string | null;
  items: TrackappResourceRow[];
}> {
  const baseDir = resolveResourcesDir();
  if (!baseDir) return { baseDir: null, items: [] };

  let names: string[];
  try {
    names = await readdir(baseDir);
  } catch {
    return { baseDir, items: [] };
  }

  const videos = names.filter((n) => !n.startsWith(".") && VIDEO_RE.test(n));
  if (videos.length === 0) {
    return { baseDir, items: [] };
  }

  const bytesByName: Record<string, number> = {};
  for (const name of names) {
    if (name.startsWith(".")) continue;
    const size = await fileSize(path.join(baseDir, name));
    if (size != null) bytesByName[name] = size;
  }

  return {
    baseDir,
    items: buildGalleryRowsFromNames(names, bytesByName),
  };
}

function scanFromGeneratedBuild(): {
  baseDir: string | null;
  items: TrackappResourceRow[];
} {
  const items = generatedGallery.items ?? [];
  if (items.length === 0) {
    return { baseDir: null, items: [] };
  }

  return {
    baseDir: generatedGallery.basePath ?? "public/trackapp-ressources",
    items,
  };
}

async function scanTrackappResourcesUncached(): Promise<{
  baseDir: string | null;
  items: TrackappResourceRow[];
}> {
  // Sur Vercel : pas de scan disque (évite d’embarquer Ressources/ ou des .mp4 dans les lambdas).
  if (process.env.VERCEL) return scanFromGeneratedBuild();

  const fromFs = await scanFromFilesystem();
  if (fromFs.items.length > 0) return fromFs;
  return scanFromGeneratedBuild();
}

const scanTrackappResourcesCached = unstable_cache(
  scanTrackappResourcesUncached,
  ["trackapp-resources-scan-v2"],
  { revalidate: 300 },
);

export async function scanTrackappResources(): Promise<{
  baseDir: string | null;
  items: TrackappResourceRow[];
}> {
  return scanTrackappResourcesCached();
}
