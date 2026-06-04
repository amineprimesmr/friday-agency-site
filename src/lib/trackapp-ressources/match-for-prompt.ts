import type { ClientFunnelStage } from "@/lib/trackapp-ressources/client-funnel";
import {
  TRACKAPP_RESOURCE_CATALOG,
  type TrackappResourceCatalogEntry,
} from "@/lib/trackapp-ressources/catalog";
import { resourcePublicPath } from "@/lib/trackapp-ressources/public-urls";

const FUNNEL_DEFAULTS: Readonly<Record<ClientFunnelStage, string>> = {
  welcome: "custom_splash",
  onboarding: "ios_onboarding",
  paywall: "minimal_paywall",
  winback_game: "awc_animation",
  main_app: "custom_bottom_bar",
};

function scoreEntry(entry: TrackappResourceCatalogEntry, haystack: string): number {
  let score = 0;
  for (const tag of entry.tags) {
    if (haystack.includes(tag.toLowerCase())) score += 2;
  }
  if (haystack.includes(entry.title.toLowerCase())) score += 3;
  for (const cat of entry.categories) {
    if (haystack.includes(cat)) score += 1;
  }
  return score;
}

/** Sélectionne les ressources Trackapp pertinentes pour le concept + funnel obligatoire. */
export function matchTrackappResourcesForPrompt(input: {
  concept: string;
  niche?: string;
  mvpFeatures?: readonly string[];
  maxExtra?: number;
}): readonly TrackappResourceCatalogEntry[] {
  const haystack = [input.concept, input.niche ?? "", ...(input.mvpFeatures ?? [])]
    .join(" ")
    .toLowerCase();

  const pickedIds = new Set<string>();
  const result: TrackappResourceCatalogEntry[] = [];

  for (const [stage, defaultId] of Object.entries(FUNNEL_DEFAULTS) as [ClientFunnelStage, string][]) {
    const stageEntries = TRACKAPP_RESOURCE_CATALOG.filter((e) => e.funnelStages.includes(stage));
    const scored = stageEntries
      .map((e) => ({ e, score: scoreEntry(e, haystack) }))
      .sort((a, b) => b.score - a.score);
    const best =
      scored[0]?.e ??
      stageEntries.find((e) => e.id === defaultId) ??
      TRACKAPP_RESOURCE_CATALOG.find((e) => e.id === defaultId);
    if (best && !pickedIds.has(best.id)) {
      result.push(best);
      pickedIds.add(best.id);
    }
  }

  const maxExtra = input.maxExtra ?? 4;
  const extras = TRACKAPP_RESOURCE_CATALOG.filter((e) => !pickedIds.has(e.id))
    .map((e) => ({ e, score: scoreEntry(e, haystack) }))
    .filter((x) => x.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, maxExtra);

  for (const { e } of extras) {
    result.push(e);
    pickedIds.add(e.id);
  }

  return result;
}

export function resourceZipFilename(entry: TrackappResourceCatalogEntry): string {
  return `${entry.zipStem}.zip`;
}

export function resourceDownloadPath(entry: TrackappResourceCatalogEntry): string {
  return resourcePublicPath(resourceZipFilename(entry));
}
