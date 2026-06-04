"use client";

import Image from "next/image";
import { useState } from "react";

import { cn } from "@/lib/utils";

function normalizeAppleArtworkUrl(url: string): string {
  const trimmed = url.trim();
  if (trimmed.startsWith("http://")) return `https://${trimmed.slice(7)}`;
  return trimmed;
}

/** Icône App Store — `unoptimized` + repli initiale (URLs Apple souvent cassées par l’optimizer Next). */
export function TrackerAppArtwork({
  url,
  name,
  className,
  sizes = "48px",
  priority = false,
  letterClassName,
}: Readonly<{
  url?: string | null;
  name: string;
  className?: string;
  sizes?: string;
  priority?: boolean;
  letterClassName?: string;
}>) {
  const [failed, setFailed] = useState(false);
  const src = url ? normalizeAppleArtworkUrl(url) : "";

  if (!src || failed) {
    return (
      <span
        className={cn(
          "flex h-full w-full items-center justify-center font-bold text-white/40",
          letterClassName,
        )}
        aria-hidden
      >
        {name.charAt(0) || "?"}
      </span>
    );
  }

  return (
    <Image
      src={src}
      alt=""
      fill
      className={cn("object-cover", className)}
      sizes={sizes}
      unoptimized
      priority={priority}
      onError={() => setFailed(true)}
    />
  );
}
