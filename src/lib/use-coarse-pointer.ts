"use client";

import { createContext, useContext, useSyncExternalStore, type ReactNode } from "react";

const MobilePerfContext = createContext<boolean | null>(null);

const QUERY = "(hover: none), (pointer: coarse)";

function subscribe(cb: () => void) {
  const mq = window.matchMedia(QUERY);
  mq.addEventListener("change", cb);
  return () => mq.removeEventListener("change", cb);
}

function getSnapshot() {
  return window.matchMedia(QUERY).matches;
}

function getServerSnapshot() {
  return false;
}

export function TrackerMobilePerfProvider({
  initialMobile,
  children,
}: {
  initialMobile: boolean;
  children: ReactNode;
}) {
  return <MobilePerfContext.Provider value={initialMobile}>{children}</MobilePerfContext.Provider>;
}

/** Mode perf (SSR UA sur /tracker, sinon matchMedia tactile). */
export function useMobilePerf(): boolean {
  const ctx = useContext(MobilePerfContext);
  const coarse = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  return ctx !== null ? ctx : coarse;
}

/** Alias — même logique que useMobilePerf. */
export function useCoarsePointer(): boolean {
  return useMobilePerf();
}
