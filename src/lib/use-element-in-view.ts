"use client";

import { useCallback, useEffect, useState } from "react";

type Options = {
  threshold?: number | number[];
  rootMargin?: string;
};

/**
 * Observe la visibilité d’un élément. Utilise un callback ref pour éviter le cas
 * où ref.current est encore null au premier useEffect (forwardRef enfant).
 */
export function useElementInView<T extends Element>({
  threshold = 0.12,
  rootMargin = "0px",
}: Options = {}): {
  ref: (node: T | null) => void;
  inView: boolean;
} {
  const [node, setNode] = useState<T | null>(null);
  const [inView, setInView] = useState(true);

  const ref = useCallback((el: T | null) => {
    setNode(el);
  }, []);

  useEffect(() => {
    if (!node) return;

    if (!("IntersectionObserver" in window)) {
      setInView(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => setInView(entry?.isIntersecting ?? false),
      { threshold, rootMargin },
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [node, threshold, rootMargin]);

  return { ref, inView };
}
