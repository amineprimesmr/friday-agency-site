"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useId, useRef, useState } from "react";

import { useTrackappUser } from "@/components/trackapp/trackapp-user-context";
import { displayNameFromEmail } from "@/lib/trackapp-display-name";
import { cn } from "@/lib/utils";

import "@/styles/trackapp-user-chip.css";

type Props = Readonly<{
  className?: string;
  /** AppLAB studio | pied de sidebar studio */
  variant?: "studio-topbar" | "studio-sidebar";
  onNavigate?: () => void;
}>;

export function TrackappUserChip({ className, variant = "studio-sidebar", onNavigate }: Props) {
  const { email, signOutHref, loggedIn } = useTrackappUser();
  const menuId = useId();
  const [menuOpen, setMenuOpen] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);

  const name = displayNameFromEmail(email);
  const avatarUrl = email
    ? `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=1e293b&color=fff&size=96`
    : null;

  useEffect(() => {
    if (!menuOpen) return;
    function onPointerDown(e: MouseEvent) {
      if (!wrapRef.current?.contains(e.target as Node)) setMenuOpen(false);
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setMenuOpen(false);
    }
    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [menuOpen]);

  const closeMenu = () => setMenuOpen(false);

  return (
    <div
      ref={wrapRef}
      className={cn(
        "trackapp-user-chip",
        variant === "studio-topbar" && "trackapp-user-chip--studio-topbar",
        variant === "studio-sidebar" && "trackapp-user-chip--studio-sidebar",
        className,
      )}
    >
      <button
        type="button"
        className="trackapp-user-chip__trigger"
        aria-label={loggedIn ? `Compte ${name}` : "Compte — se connecter"}
        aria-expanded={menuOpen}
        aria-controls={menuId}
        onClick={() => setMenuOpen((v) => !v)}
      >
        <span className="trackapp-user-chip__avatar" aria-hidden>
          {avatarUrl ? (
            <Image src={avatarUrl} alt="" width={32} height={32} unoptimized />
          ) : (
            <span className="trackapp-user-chip__avatar-fallback">{name.charAt(0)}</span>
          )}
        </span>
        {variant !== "studio-topbar" ? (
          <span className="trackapp-user-chip__meta">
            <span className="trackapp-user-chip__name">{name}</span>
            {email ? (
              <span className="trackapp-user-chip__email" title={email}>
                {email}
              </span>
            ) : (
              <span className="trackapp-user-chip__email trackapp-user-chip__email--muted">
                {loggedIn ? "—" : "Invité"}
              </span>
            )}
          </span>
        ) : (
          <span className="trackapp-user-chip__name trackapp-user-chip__name--compact">{name}</span>
        )}
        <span className="trackapp-user-chip__chevron" aria-hidden />
      </button>

      {menuOpen ? (
        <div id={menuId} className="trackapp-user-chip__dropdown" role="menu">
          {loggedIn ? (
            <>
              <Link href="/trackapp/gagner-240" role="menuitem" onClick={() => { closeMenu(); onNavigate?.(); }}>
                Affiliation
              </Link>
              <a href={signOutHref} role="menuitem" className="danger" onClick={() => { closeMenu(); onNavigate?.(); }}>
                Déconnexion
              </a>
            </>
          ) : (
            <Link href="/trackapp/connexion" role="menuitem" onClick={() => { closeMenu(); onNavigate?.(); }}>
              Se connecter
            </Link>
          )}
        </div>
      ) : null}
    </div>
  );
}
