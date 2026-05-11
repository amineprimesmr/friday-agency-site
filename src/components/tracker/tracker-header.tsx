import type { TrackerSearchSurface } from "@/components/tracker/tracker-search-bar";
import { TrackerSearchBar } from "@/components/tracker/tracker-search-bar";

export function TrackerHeader({
  searchSurface,
}: {
  searchSurface?: TrackerSearchSurface;
}) {
  return <TrackerSearchBar searchSurface={searchSurface} />;
}
