"use client";

import Image from "next/image";
import { useEffect, useState } from "react";

import { useCoarsePointer } from "@/lib/use-coarse-pointer";
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
  const coarsePointer = useCoarsePointer();
  const pool = apps.length > 0 ? apps : [{ id: "placeholder", name: "App", artworkUrl: undefined }];
  const [index, setIndex] = useState(0);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    if (coarsePointer || pool.length < 2) return;
    const id = window.setInterval(() => {
      setVisible(false);
      window.setTimeout(() => {
        setIndex((i) => (i + 1) % pool.length);
        setVisible(true);
      }, 180);
    }, INTERVAL_MS);
    return () => window.clearInterval(id);
  }, [pool.length, coarsePointer]);

  const current = pool[coarsePointer ? 0 : index];

  return (
    <span
      className={cn(
        "relative ml-1 mr-[0.55rem] inline-flex align-middle sm:mr-2.5 md:mr-3 [--hero-icon:2.35rem] sm:[--hero-icon:2.65rem] md:[--hero-icon:2.9rem]",
        className,
      )}
      aria-hidden
    >
      <span className="relative inline-flex h-[var(--hero-icon)] w-[var(--hero-icon)] items-center justify-center">
        <span
          className={cn(
            "relative flex h-full w-full items-center justify-center overflow-hidden rounded-[22%] bg-neutral-950 shadow-[0_4px_18px_rgba(0,0,0,0.45),0_0_0_1px_rgba(255,255,255,0.14)] transition-opacity duration-200 ease-out",
            visible ? "opacity-100" : "opacity-0",
          )}
        >
          {current.artworkUrl ? (
            <Image
              src={current.artworkUrl}
              alt=""
              fill
              className="object-cover"
              sizes="120px"
              priority
            />
          ) : (
            <span className="select-none text-[clamp(1.1rem,4vw,1.65rem)] font-bold text-white/35">
              {current.name.slice(0, 1).toUpperCase()}
            </span>
          )}
          <span
            aria-hidden
            className="pointer-events-none absolute inset-0 rounded-[22%] bg-gradient-to-br from-white/12 via-transparent to-transparent opacity-30"
          />
        </span>
      </span>
    </span>
  );
}
