"use client";

import type { ReactNode } from "react";

import { TrackappAppFavoriteButton } from "@/components/trackapp/trackapp-app-favorite-button";

export function TrackappAppFavoriteRow({
  appId,
  initialFavorite,
  favoritesEnabled,
  children,
}: Readonly<{
  appId: string;
  initialFavorite: boolean;
  favoritesEnabled: boolean;
  children: ReactNode;
}>) {
  return (
    <div className="relative">
      {children}
      {favoritesEnabled ? (
        <div className="pointer-events-auto absolute right-2 top-2 z-[2] md:right-3 md:top-3">
          <TrackappAppFavoriteButton appId={appId} initialFavorite={initialFavorite} enabled={favoritesEnabled} />
        </div>
      ) : null}
    </div>
  );
}
