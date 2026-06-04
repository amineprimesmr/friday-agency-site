"use client";

import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";

import { HeartIcon } from "@/components/icons/heart-icon";
import { dispatchTrackappSidebarFavoritesRefresh } from "@/lib/trackapp-favorites-events";
import { cn } from "@/lib/utils";

export function TrackappResourceFavoriteButton({
  designId,
  initialFavorite,
}: Readonly<{
  designId: string;
  initialFavorite: boolean;
}>) {
  const router = useRouter();
  const [favorite, setFavorite] = useState(initialFavorite);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    setFavorite(initialFavorite);
  }, [initialFavorite]);

  const toggle = useCallback(async () => {
    setBusy(true);
    try {
      const res = await fetch("/api/trackapp/favorites/toggle", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "design", designId }),
        credentials: "same-origin",
      });
      const data = (await res.json().catch(() => null)) as { favorites?: string[]; error?: string } | null;
      if (!res.ok) {
        setFavorite(initialFavorite);
        return;
      }
      const list = Array.isArray(data?.favorites) ? data!.favorites! : [];
      setFavorite(list.includes(designId));
      dispatchTrackappSidebarFavoritesRefresh();
      router.refresh();
    } finally {
      setBusy(false);
    }
  }, [designId, initialFavorite, router]);

  return (
    <button
      type="button"
      onClick={(e) => {
        e.preventDefault();
        void toggle();
      }}
      disabled={busy}
      aria-pressed={favorite}
      aria-label={favorite ? "Retirer des favoris" : "Ajouter aux favoris"}
      className={cn(
        "flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-white/[0.14] bg-black/55 text-white shadow-lg backdrop-blur-md transition hover:bg-black/70 hover:border-white/25 disabled:opacity-60",
        favorite && "border-red-400/35 bg-red-500/15 text-red-100",
      )}
    >
      <HeartIcon filled={favorite} className="h-[18px] w-[18px]" strokeWidth={1.75} />
    </button>
  );
}
