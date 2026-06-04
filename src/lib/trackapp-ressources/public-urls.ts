import type { TrackappResourceCatalogEntry } from "@/lib/trackapp-ressources/catalog";
import { resourceZipFilename } from "@/lib/trackapp-ressources/match-for-prompt";

export const TRACKAPP_RESOURCES_PUBLIC_PREFIX = "/trackapp-ressources";

export function trackappSiteOrigin(): string {
  const fromEnv = process.env.NEXT_PUBLIC_APP_URL?.trim();
  if (fromEnv) return fromEnv.replace(/\/$/, "");
  return "https://www.trackapp.fr";
}

export function resourcePublicPath(filename: string): string {
  return `${TRACKAPP_RESOURCES_PUBLIC_PREFIX}/${encodeURIComponent(filename).replace(/%2F/g, "/")}`;
}

export function resourcePublicUrl(filename: string, origin?: string): string {
  const base = (origin ?? trackappSiteOrigin()).replace(/\/$/, "");
  return `${base}${resourcePublicPath(filename)}`;
}

export function resourceZipPublicUrl(
  entry: TrackappResourceCatalogEntry,
  origin?: string,
): string {
  return resourcePublicUrl(resourceZipFilename(entry), origin);
}

export function resourceVideoPublicUrl(
  entry: TrackappResourceCatalogEntry,
  origin?: string,
): string {
  return resourcePublicUrl(`${entry.stem}.mp4`, origin);
}

export function resourcesManifestPublicUrl(origin?: string): string {
  return resourcePublicUrl("manifest.json", origin);
}
