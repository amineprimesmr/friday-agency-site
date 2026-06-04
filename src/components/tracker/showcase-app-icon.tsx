"use client";

import { useEffect, useState } from "react";

import { cn } from "@/lib/utils";

/** Icône app showcase — artwork iTunes avec repli local (`/selection-app/*.jpg`). */
export function ShowcaseAppIcon({
  artworkUrl,
  iconSrc,
  name,
  className,
  priority = false,
}: Readonly<{
  artworkUrl?: string | null;
  iconSrc?: string | null;
  name: string;
  className?: string;
  priority?: boolean;
}>) {
  const primary = artworkUrl?.trim() || iconSrc?.trim() || "";
  const fallback = iconSrc?.trim() && iconSrc !== primary ? iconSrc.trim() : artworkUrl?.trim() || "";
  const [src, setSrc] = useState(primary);

  useEffect(() => {
    setSrc(primary);
  }, [primary]);

  if (!primary && !fallback) {
    return (
      <span className={cn("flex h-full w-full items-center justify-center bg-white/[0.06] text-white/35", className)}>
        {name.slice(0, 1).toUpperCase()}
      </span>
    );
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element -- artwork iTunes : repli local sans optimizer Next
    <img
      src={src || fallback}
      alt=""
      decoding="async"
      loading={priority ? "eager" : "lazy"}
      className={cn("h-full w-full object-cover", className)}
      onError={() => {
        if (fallback && src !== fallback) setSrc(fallback);
      }}
    />
  );
}
