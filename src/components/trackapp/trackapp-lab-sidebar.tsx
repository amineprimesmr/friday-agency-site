"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import {
  IconNavAccueil,
  IconNavBook,
  IconNavChart,
  IconNavFile,
  IconNavHeart,
  IconNavNotes,
} from "@/components/trackapp/trackapp-lab-nav-icons";
import { TrackappLogoMark } from "@/components/trackapp/trackapp-logo-mark";
import { TrackappSidebarFooter } from "@/components/trackapp/trackapp-sidebar-footer";
import type { TrackappNavItem } from "@/lib/trackapp-workspace-nav";
import {
  groupHasActiveItem,
  isNavItemActive,
  TRACKAPP_NAV_GROUPS,
} from "@/lib/trackapp-workspace-nav";
import { cn } from "@/lib/utils";

import type { ComponentType, SVGProps } from "react";

const ITEM_ICONS: Record<string, ComponentType<SVGProps<SVGSVGElement>>> = {
  Accueil: IconNavAccueil,
  Apptracker: IconNavChart,
  "Mes favoris": IconNavHeart,
  "Mes notes": IconNavNotes,
  "Notre sélection": IconNavChart,
  Formation: IconNavBook,
  Ressources: IconNavFile,
};

function NavItemIcon({ label }: { label: string }) {
  const Icon = ITEM_ICONS[label] ?? IconNavFile;
  return (
    <span className="trackapp-lab-nav__item-icon">
      <Icon className="h-[18px] w-[18px]" />
    </span>
  );
}

function NavSubLink({
  item,
  pathname,
  onNavigate,
  onPendingNavigate,
  pending,
}: Readonly<{
  item: TrackappNavItem;
  pathname: string;
  onNavigate?: () => void;
  onPendingNavigate?: (href: string) => void;
  pending?: boolean;
}>) {
  const active = isNavItemActive(pathname, item);
  const className = cn(
    "trackapp-lab-nav__item",
    active && "trackapp-lab-nav__item--active",
    pending && "trackapp-lab-nav__item--pending",
    item.soon && "trackapp-lab-nav__item--soon",
  );

  const body = (
    <>
      <NavItemIcon label={item.label} />
      <span className="trackapp-lab-nav__item-label">{item.label}</span>
    </>
  );

  if (item.soon) {
    return (
      <span className={className} aria-disabled title="Bientôt disponible">
        {body}
      </span>
    );
  }

  return (
    <Link
      href={item.href}
      prefetch
      className={className}
      onClick={() => {
        if (!active) onPendingNavigate?.(item.href);
        onNavigate?.();
      }}
    >
      {body}
    </Link>
  );
}

export function TrackappLabSidebar({
  pathname,
  mobileMenuOpen,
  onNavigate,
  email,
  signOutHref,
}: Readonly<{
  pathname: string;
  mobileMenuOpen: boolean;
  onNavigate?: () => void;
  email?: string;
  signOutHref?: string;
}>) {
  const [pendingHref, setPendingHref] = useState<string | null>(null);
  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>(() => {
    const init: Record<string, boolean> = {};
    for (const g of TRACKAPP_NAV_GROUPS) {
      init[g.id] = Boolean(g.defaultOpen) || groupHasActiveItem(pathname, g);
    }
    return init;
  });

  useEffect(() => {
    setPendingHref(null);
    setOpenGroups((prev) => {
      const next = { ...prev };
      for (const g of TRACKAPP_NAV_GROUPS) {
        if (groupHasActiveItem(pathname, g)) next[g.id] = true;
      }
      return next;
    });
  }, [pathname]);

  return (
    <aside
      id="app-sidebar"
      className={cn(
        "app-sidebar trackapp-lab-sidebar hidden md:flex flex-col fixed left-0 z-[90]",
        mobileMenuOpen && "is-mobile-open",
      )}
      aria-label="Navigation Trackapp"
    >
      <span id="app-business-name" className="app-business-name-hidden" aria-hidden>
        Trackapp
      </span>

      <div className="trackapp-lab-sidebar__brand app-sidebar-brand">
        <Link
          href="/trackapp/accueil"
          className="trackapp-lab-sidebar__logo app-sidebar-logo"
          aria-label="Trackapp"
          onClick={() => onNavigate?.()}
        >
          <TrackappLogoMark size="sm" className="app-sidebar-logo-img app-sidebar-logo-img--brand" decorative />
          <span className="trackapp-lab-sidebar__logo-text app-sidebar-logo-text">Trackapp</span>
        </Link>
      </div>

      <nav className="trackapp-lab-nav app-sidebar-nav flex-1 overflow-y-auto" aria-label="Menu principal">
        {TRACKAPP_NAV_GROUPS.map((group) => {
          const open = openGroups[group.id] ?? false;
          const hasItems = group.items.length > 0;

          return (
            <div key={group.id} className="trackapp-lab-nav__group">
              <button
                type="button"
                className="trackapp-lab-nav__group-btn"
                aria-expanded={hasItems ? open : false}
                onClick={() => {
                  if (!hasItems) return;
                  setOpenGroups((s) => ({ ...s, [group.id]: !s[group.id] }));
                }}
              >
                <span className="trackapp-lab-nav__group-label">{group.label}</span>
                <span className="trackapp-lab-nav__group-toggle" aria-hidden>
                  {hasItems ? (open ? "−" : "+") : "+"}
                </span>
              </button>

              {hasItems && open ? (
                <div className="trackapp-lab-nav__children">
                  {group.items.map((item) => (
                    <NavSubLink
                      key={`${group.id}-${item.label}`}
                      item={item}
                      pathname={pathname}
                      onNavigate={onNavigate}
                      onPendingNavigate={setPendingHref}
                      pending={pendingHref === item.href}
                    />
                  ))}
                </div>
              ) : null}
            </div>
          );
        })}
      </nav>

      <TrackappSidebarFooter
        email={email}
        signOutHref={signOutHref ?? "/trackapp/deconnexion"}
        onNavigate={onNavigate}
      />
    </aside>
  );
}
