"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";

import { APPLAB_DRAFT_CHANGE_EVENT, readApplabProjectNav } from "@/lib/trackapp-applab-create/storage";
import { TRACKAPP_LANDING_PATH } from "@/lib/trackapp-landing-paths";
import { cn } from "@/lib/utils";

export function TrackappApplabProjectNavLink({
  pathname,
  onNavigate,
  onPendingNavigate,
  pending,
  rail = false,
}: Readonly<{
  pathname: string;
  onNavigate?: () => void;
  onPendingNavigate?: (href: string) => void;
  pending?: boolean;
  rail?: boolean;
}>) {
  const [project, setProject] = useState(() => readApplabProjectNav());

  const refresh = useCallback(() => {
    setProject(readApplabProjectNav());
  }, []);

  useEffect(() => {
    refresh();
    window.addEventListener(APPLAB_DRAFT_CHANGE_EVENT, refresh);
    window.addEventListener("storage", refresh);
    return () => {
      window.removeEventListener(APPLAB_DRAFT_CHANGE_EVENT, refresh);
      window.removeEventListener("storage", refresh);
    };
  }, [refresh]);

  if (!project) return null;

  const active = pathname === TRACKAPP_LANDING_PATH || pathname.startsWith(`${TRACKAPP_LANDING_PATH}?`);

  return (
    <Link
      href={TRACKAPP_LANDING_PATH}
      prefetch
      title={project.name}
      className={cn(
        rail ? "trackapp-lab-rail__item trackapp-lab-rail__item--project" : "trackapp-lab-nav__item trackapp-lab-nav__item--project",
        active && (rail ? "trackapp-lab-rail__item--active" : "trackapp-lab-nav__item--active"),
        pending && (rail ? "trackapp-lab-rail__item--pending" : "trackapp-lab-nav__item--pending"),
      )}
      onClick={() => {
        if (!active) onPendingNavigate?.(TRACKAPP_LANDING_PATH);
        onNavigate?.();
      }}
    >
      {rail ? (
        <span className="trackapp-lab-rail__glyph trackapp-lab-rail__glyph--project">
          <span className="trackapp-lab-rail__icon trackapp-lab-rail__icon--project" aria-hidden>
            ✦
          </span>
        </span>
      ) : (
        <span className="trackapp-lab-nav__item-icon trackapp-lab-nav__item-icon--project" aria-hidden>
          ✦
        </span>
      )}
      <span className={rail ? "trackapp-lab-rail__label" : "trackapp-lab-nav__item-label"}>{project.name}</span>
      {project.inProgress ? (
        <span className={rail ? "trackapp-lab-rail__badge" : "trackapp-lab-nav__item-badge"} aria-label="En cours">
          ···
        </span>
      ) : null}
    </Link>
  );
}
