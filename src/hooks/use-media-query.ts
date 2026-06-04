"use client";

import { useEffect, useState } from "react";

type UseMediaQueryOptions = {
  /** Valeur initiale (SSR + 1er paint). `true` = mode mobile-first pour éviter d’activer les animations lourdes avant hydratation. */
  defaultMatches?: boolean;
};

/**
 * `matches` reflète `window.matchMedia(query)` après hydratation.
 */
export function useMediaQuery(query: string, options?: UseMediaQueryOptions): boolean {
  const [matches, setMatches] = useState(options?.defaultMatches ?? false);

  useEffect(() => {
    const mq = window.matchMedia(query);
    const update = () => setMatches(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, [query]);

  return matches;
}
