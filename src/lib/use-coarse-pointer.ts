"use client";

import { useMobilePerf } from "@/components/tracker/tracker-mobile-perf-provider";

export { useMobilePerf };

/** Alias — même logique que useMobilePerf. */
export function useCoarsePointer(): boolean {
  return useMobilePerf();
}
