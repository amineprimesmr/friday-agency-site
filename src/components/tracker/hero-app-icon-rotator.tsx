"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useCallback, useEffect, useRef, useState } from "react";

import { ShowcaseAppIcon } from "@/components/tracker/showcase-app-icon";
import { useTouchDevice } from "@/lib/use-touch-device";
import { cn } from "@/lib/utils";

import "@/styles/hero-app-icon-rotator.css";

export type HeroRotatorApp = {
  id: string;
  name: string;
  artworkUrl?: string;
  iconSrc?: string;
};

const INTERVAL_MS = 3000;
const CROSSFADE_MS = 360;

function HeroIconFrame({
  app,
  priority = false,
}: {
  app: HeroRotatorApp;
  priority?: boolean;
}) {
  return (
    <ShowcaseAppIcon
      artworkUrl={app.artworkUrl}
      iconSrc={app.iconSrc}
      name={app.name}
      priority={priority}
    />
  );
}

export function HeroAppIconRotator({
  apps,
  className,
}: {
  apps: readonly HeroRotatorApp[];
  className?: string;
}) {
  const reduceMotion = useReducedMotion();
  const touch = useTouchDevice();
  const pool = apps.length > 0 ? apps : [{ id: "placeholder", name: "App", artworkUrl: undefined }];
  const [index, setIndex] = useState(0);
  const [outgoingIndex, setOutgoingIndex] = useState<number | null>(null);
  const [crossfading, setCrossfading] = useState(false);
  const crossfadeTimerRef = useRef<number | null>(null);
  const use3D = !reduceMotion && !touch;

  const advance = useCallback(() => {
    if (pool.length < 2 || reduceMotion) return;

    setIndex((current) => {
      const next = (current + 1) % pool.length;
      if (touch) {
        setOutgoingIndex(current);
        setCrossfading(true);
        if (crossfadeTimerRef.current) window.clearTimeout(crossfadeTimerRef.current);
        crossfadeTimerRef.current = window.setTimeout(() => {
          setCrossfading(false);
          setOutgoingIndex(null);
        }, CROSSFADE_MS);
      }
      return next;
    });
  }, [pool.length, reduceMotion, touch]);

  useEffect(() => {
    if (reduceMotion || pool.length < 2) return;
    const id = window.setInterval(advance, INTERVAL_MS);
    return () => window.clearInterval(id);
  }, [advance, pool.length, reduceMotion]);

  useEffect(
    () => () => {
      if (crossfadeTimerRef.current) window.clearTimeout(crossfadeTimerRef.current);
    },
    [],
  );

  const current = pool[index];
  const outgoing = outgoingIndex != null ? pool[outgoingIndex] : null;

  const shellClass =
    "relative flex h-full w-full items-center justify-center overflow-hidden rounded-[22%] bg-neutral-950 shadow-[0_4px_18px_rgba(0,0,0,0.45),0_0_0_1px_rgba(255,255,255,0.14)]";

  if (!use3D) {
    return (
      <span
        className={cn(
          "relative ml-1 mr-[0.55rem] inline-flex align-middle sm:mr-2.5 md:mr-3 [--hero-icon:2.35rem] sm:[--hero-icon:2.65rem] md:[--hero-icon:2.9rem]",
          className,
        )}
        aria-hidden
      >
        <span className="relative inline-flex h-[var(--hero-icon)] w-[var(--hero-icon)] items-center justify-center">
          {outgoing ? (
            <span
              className={cn(
                "hero-app-icon-layer absolute inset-0",
                crossfading && "hero-app-icon-layer--out",
              )}
            >
              <span className={shellClass}>
                <HeroIconFrame app={outgoing} />
              </span>
            </span>
          ) : null}
          <span
            key={`${current.id}-${index}`}
            className={cn(
              "hero-app-icon-layer absolute inset-0 hero-app-icon-layer--in-from",
              crossfading && "hero-app-icon-layer--in",
            )}
          >
            <span className={shellClass}>
              <HeroIconFrame app={current} priority />
            </span>
          </span>
        </span>
      </span>
    );
  }

  return (
    <span
      className={cn(
        "relative ml-1 mr-[0.55rem] inline-flex align-middle sm:mr-2.5 md:mr-3 [--hero-icon:2.35rem] sm:[--hero-icon:2.65rem] md:[--hero-icon:2.9rem]",
        className,
      )}
      style={{ perspective: "960px" }}
      aria-hidden
    >
      <span
        className="relative inline-flex h-[var(--hero-icon)] w-[var(--hero-icon)] items-center justify-center"
        style={{ transformStyle: "preserve-3d" }}
      >
        <span className={shellClass}>
          <AnimatePresence mode="wait" initial={false}>
            <motion.span
              key={`${current.id}-${index}`}
              className="absolute inset-0 flex items-center justify-center"
              initial={{ opacity: 0, rotateY: -42, scale: 0.82 }}
              animate={{ opacity: 1, rotateY: 0, scale: 1 }}
              exit={{ opacity: 0, rotateY: 42, scale: 0.82 }}
              transition={{ duration: 0.42, ease: [0.16, 1, 0.3, 1] }}
              style={{ transformStyle: "preserve-3d", backfaceVisibility: "hidden" }}
            >
              <HeroIconFrame app={current} />
            </motion.span>
          </AnimatePresence>
          <span
            aria-hidden
            className="pointer-events-none absolute inset-0 rounded-[22%] bg-gradient-to-br from-white/12 via-transparent to-transparent opacity-30"
          />
        </span>
      </span>
    </span>
  );
}
