"use client";

import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";

import { HeartIcon } from "@/components/icons/heart-icon";
import {
  dispatchTrackappFavoritesChanged,
  type TrackappFavoriteAppMeta,
} from "@/lib/trackapp-favorites-events";
import { cn } from "@/lib/utils";

import "@/styles/trackapp-favorite-button.css";

function favoriteErrorMessage(status: number, apiError?: string): string {
  if (apiError?.trim()) return apiError.trim();
  if (status === 401) return "Connectez-vous pour enregistrer vos favoris.";
  if (status === 503) return "Synchronisation indisponible (Supabase).";
  return "Impossible d’enregistrer le favori. Réessaie.";
}

export function TrackappAppFavoriteButton({
  appId,
  initialFavorite,
  enabled,
  className,
  variant = "default",
  appName,
  artworkUrl,
}: Readonly<{
  appId: string;
  initialFavorite: boolean;
  enabled: boolean;
  className?: string;
  variant?: "default" | "page";
  appName?: string;
  artworkUrl?: string | null;
}>) {
  const router = useRouter();
  const [favorite, setFavorite] = useState(initialFavorite);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [justAdded, setJustAdded] = useState(false);
  const busyRef = useRef(false);
  const toastTimerRef = useRef<number | null>(null);

  useEffect(() => {
    setFavorite(initialFavorite);
  }, [initialFavorite]);

  useEffect(
    () => () => {
      if (toastTimerRef.current) window.clearTimeout(toastTimerRef.current);
    },
    [],
  );

  const toggle = useCallback(async () => {
    if (!enabled || busyRef.current) return;
    busyRef.current = true;
    setBusy(true);
    setError(null);
    const previous = favorite;
    const next = !previous;
    setFavorite(next);
    if (next) setJustAdded(true);

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
        setFavorite(previous);
        setJustAdded(false);
        setError(favoriteErrorMessage(res.status, data?.error));
        return;
      }
      const list = Array.isArray(data?.appFavorites) ? data!.appFavorites! : [];
      const isFav = list.includes(appId);
      setFavorite(isFav);

      const appMeta: TrackappFavoriteAppMeta | undefined =
        appName != null
          ? { id: appId, name: appName, artworkUrl: artworkUrl ?? null }
          : undefined;

      dispatchTrackappFavoritesChanged({
        appId,
        favorite: isFav,
        app: isFav ? appMeta : undefined,
      });

      if (isFav) {
        if (toastTimerRef.current) window.clearTimeout(toastTimerRef.current);
        toastTimerRef.current = window.setTimeout(() => setJustAdded(false), 2200);
      } else {
        setJustAdded(false);
      }

      router.refresh();
    } catch {
      setFavorite(previous);
      setJustAdded(false);
      setError("Impossible d’enregistrer le favori. Réessaie.");
    } finally {
      busyRef.current = false;
      setBusy(false);
    }
  }, [appId, appName, artworkUrl, enabled, favorite, router]);

  if (!enabled) return null;

  return (
    <span className="trackapp-fav-btn">
      <button
        type="button"
        className={cn(
          "trackapp-fav-btn__button",
          variant === "page" && "trackapp-fav-btn__button--page",
          favorite && "trackapp-fav-btn__button--active",
          justAdded && favorite && "trackapp-fav-btn__button--pop",
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
        <span className="trackapp-fav-btn__ring" aria-hidden />
        <HeartIcon filled={favorite} className="trackapp-fav-btn__icon" strokeWidth={1.85} />
      </button>
      {justAdded && favorite ? (
        <span className="trackapp-fav-btn__toast" role="status">
          Ajouté aux favoris
        </span>
      ) : null}
      {error ? (
        <span
          role="status"
          className="absolute left-0 top-full z-20 mt-1.5 w-max max-w-[min(16rem,calc(100vw-2rem))] rounded-lg border border-red-200 bg-red-50 px-2 py-1 text-[0.68rem] font-medium leading-snug text-red-800 shadow-sm"
        >
          {error}
        </span>
      ) : null}
    </span>
  );
}
