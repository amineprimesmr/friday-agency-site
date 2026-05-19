"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import { cn } from "@/lib/utils";

export function TrackappAdsChannelFavoriteButton({
  channelId,
  initialFavorite,
  enabled,
  className,
}: Readonly<{
  channelId: string;
  initialFavorite: boolean;
  enabled: boolean;
  className?: string;
}>) {
  const [favorite, setFavorite] = useState(initialFavorite);
  const [busy, setBusy] = useState(false);
  const busyRef = useRef(false);

  useEffect(() => {
    setFavorite(initialFavorite);
  }, [initialFavorite]);

  const toggle = useCallback(async () => {
    if (!enabled || busyRef.current) return;
    busyRef.current = true;
    setBusy(true);
    try {
      const res = await fetch("/api/trackapp/favorites/toggle", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "ads", adsKey: channelId }),
      });
      const data = (await res.json().catch(() => null)) as { adsFavorites?: string[]; error?: string } | null;
      if (!res.ok) return;
      const list = Array.isArray(data?.adsFavorites) ? data!.adsFavorites! : [];
      setFavorite(list.includes(channelId));
    } finally {
      busyRef.current = false;
      setBusy(false);
    }
  }, [channelId, enabled]);

  if (!enabled) return null;

  return (
    <button
      type="button"
      className={cn(
        "grid h-9 w-9 shrink-0 place-items-center rounded-xl border border-slate-200 bg-white text-slate-600 shadow-sm transition hover:border-slate-300 hover:bg-slate-50",
        favorite && "border-amber-300 bg-amber-50 text-amber-700",
        busy && "opacity-60",
        className,
      )}
      onClick={() => void toggle()}
      aria-pressed={favorite}
      aria-label={favorite ? "Retirer ce canal des favoris" : "Ajouter ce canal aux favoris"}
    >
      <svg viewBox="0 0 24 24" className="h-[17px] w-[17px]" fill={favorite ? "currentColor" : "none"} aria-hidden>
        <path
          d="M12 21s-6.716-4.2-9.05-8.05C1.116 10.8 2.96 7.09 6.2 7.09c1.848 0 3.09 1.107 4.05 2.33a5.85 5.85 0 0 1 1.75-1.51 4.45 4.45 0 0 1 2.3-.82c3.24 0 5.084 3.71 3.25 5.86C16.716 16.8 12 21 12 21Z"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinejoin="round"
        />
      </svg>
    </button>
  );
}
