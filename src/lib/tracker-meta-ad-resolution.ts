import type { DetectedSocialProfile } from "@/lib/social-presence";
import type { TrackerMetaAdLibraryContext } from "@/lib/tracker-meta-ad-library-context";
import { resolveBrandFootprint } from "@/lib/brand-intelligence/resolve-brand-footprint";

/**
 * Construit le contexte Ad Library page-only.
 * Le mot-clé reste disponible uniquement comme lien manuel, jamais comme source de fetch ads.
 */
export async function buildTrackerMetaAdLibraryContext(args: {
  appName: string;
  developerName: string;
  genre: string;
  description: string;
  releaseNotes: string;
  socialFromStore: DetectedSocialProfile[];
  country?: string;
}): Promise<TrackerMetaAdLibraryContext> {
  return resolveBrandFootprint(args);
}
