"use client";

import type { ReactNode } from "react";

import { TrackappAppFavoriteButton } from "@/components/trackapp/trackapp-app-favorite-button";

export function TrackappAppFavoriteRow({
  appId,
  initialFavorite,
  favoritesEnabled,
  appName,
  artworkUrl,
  children,
}: Readonly<{
  appId: string;
  initialFavorite: boolean;
  favoritesEnabled: boolean;
  appName?: string;
  artworkUrl?: string | null;
  children: ReactNode;
}>) {
  return (
    <div className="flex w-full min-w-0 items-stretch gap-2">
      <div className="min-w-0 flex-1">{children}</div>
      {favoritesEnabled ? (
        <div className="flex shrink-0 items-start pt-3 pr-0.5">
          <TrackappAppFavoriteButton
            appId={appId}
            initialFavorite={initialFavorite}
            enabled={favoritesEnabled}
            appName={appName}
            artworkUrl={artworkUrl}
          />
        </div>
      ) : null}
    </div>
  );
}
