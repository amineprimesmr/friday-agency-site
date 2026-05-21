"use client";

import { useSyncExternalStore } from "react";

const QUERY = "(hover: none), (pointer: coarse)";

function subscribe(cb: () => void) {
  const mq = window.matchMedia(QUERY);
  mq.addEventListener("change", cb);
  return () => mq.removeEventListener("change", cb);
}

function getSnapshot() {
  return window.matchMedia(QUERY).matches;
}

/** iPhone / Android — optimisations landing sans couper les animations. */
export function useTouchDevice(): boolean {
  return useSyncExternalStore(subscribe, getSnapshot, () => false);
}
