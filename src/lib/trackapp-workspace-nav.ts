import { isTrackappCreerDepuisAppPath } from "@/lib/trackapp-app-clone-paths";
import {
  isTrackappApptrackerDetailPath,
  TRACKAPP_ACCUEIL_BASE,
} from "@/lib/trackapp-apptracker-paths";

export type TrackappNavItem = Readonly<{
  href: string;
  label: string;
  match?: (pathname: string) => boolean;
  soon?: boolean;
}>;

export type TrackappNavGroup = Readonly<{
  id: string;
  label: string;
  defaultOpen?: boolean;
  items: readonly TrackappNavItem[];
}>;

export const TRACKAPP_NAV_GROUPS: readonly TrackappNavGroup[] = [
  {
    id: "tracker",
    label: "tracker",
    defaultOpen: true,
    items: [
      {
        href: TRACKAPP_ACCUEIL_BASE,
        label: "Accueil",
        match: (p) => p === TRACKAPP_ACCUEIL_BASE,
      },
      {
        href: TRACKAPP_ACCUEIL_BASE,
        label: "Apptracker",
        match: (p) => isTrackappApptrackerDetailPath(p),
      },
      {
        href: "/trackapp/favoris/apps",
        label: "Mes favoris",
        match: (p) => p.startsWith("/trackapp/favoris"),
      },
      { href: "/trackapp/notes", label: "Mes notes", soon: true },
      {
        href: "/trackapp/notre-selection",
        label: "Notre sélection",
        match: (p) => p.startsWith("/trackapp/notre-selection"),
      },
    ],
  },
  {
    id: "applab",
    label: "appLAB",
    defaultOpen: true,
    items: [
      {
        href: "/trackapp/creer-mon-app",
        label: "Formation",
        match: (p) => p.startsWith("/trackapp/creer-mon-app"),
      },
      {
        href: "/trackapp/ressources",
        label: "Ressources",
        match: (p) => p.startsWith("/trackapp/ressources"),
      },
    ],
  },
];

export type TrackappBreadcrumb = Readonly<{
  sectionLabel: string;
  pageLabel: string;
  hubLabel?: string;
  hubHref?: string;
}>;

function matchItem(pathname: string, item: TrackappNavItem): boolean {
  if (item.match) return item.match(pathname);
  return pathname === item.href || pathname.startsWith(`${item.href}/`);
}

export function resolveTrackappBreadcrumb(pathname: string): TrackappBreadcrumb {
  if (isTrackappApptrackerDetailPath(pathname)) {
    return {
      sectionLabel: "tracker",
      hubLabel: "Apptracker",
      hubHref: TRACKAPP_ACCUEIL_BASE,
      pageLabel: "Fiche app",
    };
  }

  if (isTrackappCreerDepuisAppPath(pathname)) {
    return {
      sectionLabel: "appLAB",
      hubLabel: "Formation",
      hubHref: "/trackapp/creer-mon-app",
      pageLabel: "Créer cette app",
    };
  }

  if (pathname === TRACKAPP_ACCUEIL_BASE) {
    return { sectionLabel: "tracker", pageLabel: "Accueil" };
  }

  for (const group of TRACKAPP_NAV_GROUPS) {
    for (const item of group.items) {
      if (item.soon) continue;
      if (matchItem(pathname, item)) {
        return { sectionLabel: group.label, pageLabel: item.label };
      }
    }
  }

  return { sectionLabel: "tracker", pageLabel: "Accueil" };
}

export function isNavItemActive(pathname: string, item: TrackappNavItem): boolean {
  if (item.soon) return false;
  return matchItem(pathname, item);
}

export function groupHasActiveItem(pathname: string, group: TrackappNavGroup): boolean {
  return group.items.some((item) => isNavItemActive(pathname, item));
}
