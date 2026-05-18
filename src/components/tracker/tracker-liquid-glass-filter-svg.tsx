import { TRACKER_LIQUID_GLASS_FILTER_INNER } from "@/lib/tracker-liquid-glass-filter-inner";

/**
 * Définitions SVG pour `backdrop-filter: url(#tracker-liquid-glass-fr)` (feDisplacementMap).
 * Doit être monté une fois dans le document (layout tracker / header).
 */
export function TrackerLiquidGlassFilterSvg() {
  return (
    <svg
      aria-hidden
      xmlns="http://www.w3.org/2000/svg"
      className="tracker-liquid-glass-filter-svg"
      width={0}
      height={0}
    >
      <defs dangerouslySetInnerHTML={{ __html: TRACKER_LIQUID_GLASS_FILTER_INNER }} />
    </svg>
  );
}
