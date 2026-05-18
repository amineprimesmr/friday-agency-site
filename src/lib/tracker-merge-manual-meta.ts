import type { TrackerMetaAdLibraryContext, MetaAdPageResolutionEntry } from "@/lib/tracker-meta-ad-library-context";

/** Fusionne des Page IDs ajoutées manuellement (localStorage) avec le contexte serveur. */
export function mergeManualMetaPageIds(
  ctx: TrackerMetaAdLibraryContext,
  manualIdsRaw: string[],
): TrackerMetaAdLibraryContext {
  const manualIds = manualIdsRaw
    .map((s) => s.trim())
    .filter((id) => /^\d+$/.test(id))
    .slice(0, 10);

  const seen = new Set<string>();
  const mergedEntries: MetaAdPageResolutionEntry[] = [];

  for (const entry of ctx.entries) {
    if (seen.has(entry.pageId)) continue;
    seen.add(entry.pageId);
    mergedEntries.push(entry);
    if (mergedEntries.length >= 10) break;
  }

  for (const pageId of manualIds) {
    if (mergedEntries.length >= 10) break;
    if (seen.has(pageId)) continue;
    seen.add(pageId);
    mergedEntries.push({
      pageId,
      sourceUrl: "",
      source: "manual_local",
      confidence: 1,
    });
  }

  const searchPageIds = mergedEntries.map((e) => e.pageId);
  const hasPages = searchPageIds.length > 0;

  return {
    ...ctx,
    entries: mergedEntries,
    searchPageIds,
    allMetaPageIds: searchPageIds,
    primaryMetaPageId: searchPageIds[0] ?? null,
    mode: hasPages ? "page" : ctx.mode,
    resolutionStatus: hasPages ? "resolved" : ctx.resolutionStatus,
    confidence:
      hasPages
        ? Math.max(ctx.confidence, ...mergedEntries.map((e) => e.confidence ?? 0))
        : ctx.confidence,
  };
}
