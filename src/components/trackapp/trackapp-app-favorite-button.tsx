"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import { cn } from "@/lib/utils";

export function TrackappAppFavoriteButton({
  appId,
  initialFavorite,
  enabled,
  className,
}: Readonly<{
  appId: string;
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
        body: JSON.stringify({ type: "app", appId }),
      });
      const data = (await res.json().catch(() => null)) as { appFavorites?: string[]; error?: string } | null;
      if (!res.ok) return;
      const list = Array.isArray(data?.appFavorites) ? data!.appFavorites! : [];
      setFavorite(list.includes(appId));
    } finally {
      busyRef.current = false;
      setBusy(false);
    }
  }, [appId, enabled]);

  if (!enabled) return null;

  return (
    <button
      type="button"
      className={cn(
        "grid h-9 w-9 shrink-0 place-items-center rounded-xl border border-white/12 bg-black/55 text-white/88 backdrop-blur-sm transition hover:bg-black/65",
        favorite && "border-amber-400/45 bg-amber-500/18 text-amber-100",
        busy && "opacity-60",
        className,
      )}
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        void toggle();
      }}
      aria-pressed={favorite}
      aria-label={favorite ? "Retirer l’app des favoris" : "Ajouter l’app aux favoris"}
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
