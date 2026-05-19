"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import Image from "next/image";
import { useEffect, useState } from "react";

import { cn } from "@/lib/utils";

export type HeroRotatorApp = {
  id: string;
  name: string;
  artworkUrl?: string;
};

const INTERVAL_MS = 3000;

export function HeroAppIconRotator({
  apps,
  className,
}: {
  apps: HeroRotatorApp[];
  className?: string;
}) {
  const reduceMotion = useReducedMotion();
  const pool = apps.length > 0 ? apps : [{ id: "placeholder", name: "App", artworkUrl: undefined }];
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (reduceMotion || pool.length < 2) return;
    const id = window.setInterval(() => {
      setIndex((i) => (i + 1) % pool.length);
    }, INTERVAL_MS);
    return () => window.clearInterval(id);
  }, [pool.length, reduceMotion]);

  const current = pool[index];

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
        <span className="relative flex h-full w-full items-center justify-center overflow-hidden rounded-[22%] bg-neutral-950 shadow-[0_4px_18px_rgba(0,0,0,0.45),0_0_0_1px_rgba(255,255,255,0.14)]">
          <AnimatePresence mode="wait" initial={false}>
            <motion.span
              key={`${current.id}-${index}`}
              className="absolute inset-0 flex items-center justify-center"
              initial={
                reduceMotion
                  ? { opacity: 1 }
                  : {
                      opacity: 0,
                      rotateY: -42,
                      scale: 0.82,
                    }
              }
              animate={{
                opacity: 1,
                rotateY: 0,
                scale: 1,
              }}
              exit={
                reduceMotion
                  ? { opacity: 0 }
                  : {
                      opacity: 0,
                      rotateY: 42,
                      scale: 0.82,
                    }
              }
              transition={{
                duration: 0.42,
                ease: [0.16, 1, 0.3, 1],
              }}
              style={{ transformStyle: "preserve-3d", backfaceVisibility: "hidden" }}
            >
              {current.artworkUrl ? (
                <Image
                  src={current.artworkUrl}
                  alt=""
                  fill
                  className="object-cover"
                  sizes="120px"
                />
              ) : (
                <span className="select-none text-[clamp(1.1rem,4vw,1.65rem)] font-bold text-white/35">
                  {current.name.slice(0, 1).toUpperCase()}
                </span>
              )}
            </motion.span>
          </AnimatePresence>

          {/* Reflet vitré léger */}
          <span
            aria-hidden
            className="pointer-events-none absolute inset-0 rounded-[22%] bg-gradient-to-br from-white/12 via-transparent to-transparent opacity-30"
          />
        </span>
      </span>
    </span>
  );
}
