"use client";

import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";

import { HeartIcon } from "@/components/icons/heart-icon";
import { cn } from "@/lib/utils";

function favoriteErrorMessage(status: number, apiError?: string): string {
  if (apiError?.trim()) return apiError.trim();
  if (status === 401) return "Connecte-toi pour enregistrer tes favoris.";
  if (status === 503) return "Synchronisation indisponible (Supabase).";
  return "Impossible d’enregistrer le favori. Réessaie.";
}

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
  const router = useRouter();
  const [favorite, setFavorite] = useState(initialFavorite);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const busyRef = useRef(false);

  useEffect(() => {
    setFavorite(initialFavorite);
  }, [initialFavorite]);

  const toggle = useCallback(async () => {
    if (!enabled || busyRef.current) return;
    busyRef.current = true;
    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/trackapp/favorites/toggle", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "app", appId }),
        credentials: "same-origin",
      });
      const data = (await res.json().catch(() => null)) as {
        appFavorites?: string[];
        error?: string;
      } | null;
      if (!res.ok) {
        setError(favoriteErrorMessage(res.status, data?.error));
        return;
      }
      const list = Array.isArray(data?.appFavorites) ? data!.appFavorites! : [];
      setFavorite(list.includes(appId));
      router.refresh();
    } finally {
      busyRef.current = false;
      setBusy(false);
    }
  }, [appId, enabled, router]);

  if (!enabled) return null;

  return (
    <span className="relative inline-flex flex-col items-center">
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
        disabled={busy}
        aria-pressed={favorite}
        aria-label={favorite ? "Retirer l’app des favoris" : "Ajouter l’app aux favoris"}
        title={error ?? undefined}
      >
        <HeartIcon filled={favorite} className="h-[17px] w-[17px]" strokeWidth={1.75} />
      </button>
      {error ? (
        <span className="sr-only" role="status">
          {error}
        </span>
      ) : null}
    </span>
  );
}
