"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState, type ReactNode } from "react";

import { TrackerAppArtwork } from "@/components/tracker/tracker-app-artwork";
import { useTrackerNavStart } from "@/components/tracker/tracker-navigation";

import { IconNavHeart } from "@/components/trackapp/trackapp-lab-nav-icons";
import {
  TRACKAPP_FAVORITES_CHANGED,
  TRACKAPP_SIDEBAR_FAVORITES_REFRESH,
  type TrackappFavoriteAppMeta,
  type TrackappFavoritesChangedDetail,
} from "@/lib/trackapp-favorites-events";
import { trackappAccueilAppHref } from "@/lib/trackapp-apptracker-paths";
import { cn } from "@/lib/utils";

type FavoriteResourceMeta = Readonly<{
  id: string;
  title: string;
}>;

function FavoritesSubfolder({
  label,
  count,
  open,
  onToggle,
  emptyLabel,
  children,
}: Readonly<{
  label: string;
  count: number;
  open: boolean;
  onToggle: () => void;
  emptyLabel: string;
  children: ReactNode;
}>) {
  return (
    <div className="trackapp-lab-nav__favorites-subfolder">
      <button
        type="button"
        className={cn(
          "trackapp-lab-nav__favorites-subfolder-btn",
          open && "trackapp-lab-nav__favorites-subfolder-btn--open",
        )}
        aria-expanded={open}
        onClick={onToggle}
      >
        <span className="trackapp-lab-nav__favorites-subfolder-label">{label}</span>
        {count > 0 ? (
          <span className="trackapp-lab-nav__favorites-subfolder-count">{count}</span>
        ) : null}
        <span className={cn("trackapp-lab-nav__favorites-chevron", open && "is-open")} aria-hidden>
          ›
        </span>
      </button>
      {open ? (
        <div className="trackapp-lab-nav__favorites-subfolder-body">
          {count === 0 ? <p className="trackapp-lab-nav__favorites-empty">{emptyLabel}</p> : children}
        </div>
      ) : null}
    </div>
  );
}

export function TrackappLabNavFavoritesFolder({
  pathname,
  loggedIn,
  onNavigate,
}: Readonly<{
  pathname: string;
  loggedIn: boolean;
  onNavigate?: () => void;
}>) {
  const router = useRouter();
  const startNav = useTrackerNavStart();
  const inFavorites = pathname.startsWith("/trackapp/favoris");
  const [open, setOpen] = useState(inFavorites);
  const [appsOpen, setAppsOpen] = useState(true);
  const [resourcesOpen, setResourcesOpen] = useState(inFavorites && pathname.includes("/ressources"));
  const [apps, setApps] = useState<TrackappFavoriteAppMeta[]>([]);
  const [resources, setResources] = useState<FavoriteResourceMeta[]>([]);
  const [loading, setLoading] = useState(false);

  const prefetchHref = useCallback(
    (href: string) => {
      router.prefetch(href);
    },
    [router],
  );

  const loadSidebar = useCallback(async () => {
    if (!loggedIn) {
      setApps([]);
      setResources([]);
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/trackapp/favorites/sidebar", { credentials: "same-origin" });
      if (!res.ok) return;
      const data = (await res.json()) as {
        apps?: TrackappFavoriteAppMeta[];
        resources?: FavoriteResourceMeta[];
      };
      setApps(Array.isArray(data.apps) ? data.apps : []);
      setResources(Array.isArray(data.resources) ? data.resources : []);
    } finally {
      setLoading(false);
    }
  }, [loggedIn]);

  useEffect(() => {
    if (inFavorites) setOpen(true);
    if (pathname.includes("/favoris/ressources")) setResourcesOpen(true);
  }, [inFavorites, pathname]);

  useEffect(() => {
    if (!open || !loggedIn) return;
    const run = () => void loadSidebar();
    if (typeof requestIdleCallback === "function") {
      const id = requestIdleCallback(run, { timeout: 2_000 });
      return () => cancelIdleCallback(id);
    }
    const id = window.setTimeout(run, 0);
    return () => window.clearTimeout(id);
  }, [loadSidebar, loggedIn, open]);

  useEffect(() => {
    const onAppChanged = (event: Event) => {
      const detail = (event as CustomEvent<TrackappFavoritesChangedDetail>).detail;
      if (!detail) return;

      setApps((prev) => {
        const without = prev.filter((a) => a.id !== detail.appId);
        if (!detail.favorite) return without;
        if (detail.app) return [detail.app, ...without.filter((a) => a.id !== detail.app!.id)];
        void loadSidebar();
        return prev;
      });
      setOpen(true);
      setAppsOpen(true);
    };

    const onRefresh = () => {
      void loadSidebar();
      setOpen(true);
    };

    window.addEventListener(TRACKAPP_FAVORITES_CHANGED, onAppChanged);
    window.addEventListener(TRACKAPP_SIDEBAR_FAVORITES_REFRESH, onRefresh);
    return () => {
      window.removeEventListener(TRACKAPP_FAVORITES_CHANGED, onAppChanged);
      window.removeEventListener(TRACKAPP_SIDEBAR_FAVORITES_REFRESH, onRefresh);
    };
  }, [loadSidebar]);

  if (!loggedIn) {
    return (
      <Link
        href="/trackapp/connexion?next=%2Ftrackapp%2Faccueil"
        prefetch
        className={cn(
          "trackapp-lab-nav__item",
          inFavorites && "trackapp-lab-nav__item--active",
        )}
        onClick={() => onNavigate?.()}
      >
        <span className="trackapp-lab-nav__item-icon">
          <IconNavHeart className="h-[18px] w-[18px]" />
        </span>
        <span className="trackapp-lab-nav__item-label">Mes favoris</span>
      </Link>
    );
  }

  const totalCount = apps.length + resources.length;
  const folderActive =
    inFavorites || apps.some((a) => pathname.includes(`/accueil/${a.id}`));

  return (
    <div className="trackapp-lab-nav__favorites-folder">
      <button
        type="button"
        className={cn(
          "trackapp-lab-nav__favorites-folder-btn",
          folderActive && "trackapp-lab-nav__favorites-folder-btn--active",
        )}
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
      >
        <span className="trackapp-lab-nav__item-icon">
          <IconNavHeart className="h-[18px] w-[18px]" />
        </span>
        <span className="trackapp-lab-nav__item-label">Mes favoris</span>
        {totalCount > 0 ? (
          <span className="trackapp-lab-nav__favorites-count">{totalCount}</span>
        ) : null}
        <span className={cn("trackapp-lab-nav__favorites-chevron", open && "is-open")} aria-hidden>
          ›
        </span>
      </button>

      {open ? (
        <div className="trackapp-lab-nav__favorites-tree">
          {loading && totalCount === 0 ? (
            <p className="trackapp-lab-nav__favorites-empty">Chargement…</p>
          ) : null}

          <FavoritesSubfolder
            label="Apps"
            count={apps.length}
            open={appsOpen}
            onToggle={() => setAppsOpen((v) => !v)}
            emptyLabel="Aucune app — ajoute-en avec le cœur."
          >
            <ul className="trackapp-lab-nav__favorites-apps">
              {apps.map((app) => {
                const href = trackappAccueilAppHref(app.id, "fr");
                const active = pathname === href.split("?")[0];
                return (
                  <li key={app.id}>
                    <Link
                      href={href}
                      prefetch
                      className={cn(
                        "trackapp-lab-nav__favorites-app",
                        active && "trackapp-lab-nav__favorites-app--active",
                      )}
                      onPointerEnter={() => prefetchHref(href)}
                      onFocus={() => prefetchHref(href)}
                      onClick={() => {
                        if (!active) startNav?.();
                        onNavigate?.();
                      }}
                      title={app.name}
                    >
                      <span className="trackapp-lab-nav__favorites-app-art">
                        <TrackerAppArtwork
                          url={app.artworkUrl}
                          name={app.name}
                          sizes="28px"
                          letterClassName="text-[0.62rem] font-bold text-white/70"
                        />
                      </span>
                      <span className="trackapp-lab-nav__favorites-app-name">{app.name}</span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </FavoritesSubfolder>

          <FavoritesSubfolder
            label="Ressources"
            count={resources.length}
            open={resourcesOpen}
            onToggle={() => setResourcesOpen((v) => !v)}
            emptyLabel="Aucune ressource — like une vidéo sur Ressources."
          >
            <ul className="trackapp-lab-nav__favorites-apps">
              {resources.map((resource) => {
                const href = "/trackapp/ressources";
                const active = pathname === href;
                return (
                  <li key={resource.id}>
                    <Link
                      href={href}
                      prefetch
                      className={cn(
                        "trackapp-lab-nav__favorites-app",
                        active && "trackapp-lab-nav__favorites-app--active",
                      )}
                      onPointerEnter={() => prefetchHref(href)}
                      onFocus={() => prefetchHref(href)}
                      onClick={() => {
                        if (!active) startNav?.();
                        onNavigate?.();
                      }}
                      title={resource.title}
                    >
                      <span className="trackapp-lab-nav__favorites-app-art trackapp-lab-nav__favorites-resource-art">
                        ▶
                      </span>
                      <span className="trackapp-lab-nav__favorites-app-name">{resource.title}</span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </FavoritesSubfolder>
        </div>
      ) : null}
    </div>
  );
}
