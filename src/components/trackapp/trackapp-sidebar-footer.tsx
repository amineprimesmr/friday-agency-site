"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useId, useRef, useState } from "react";

import { displayNameFromEmail } from "@/lib/trackapp-display-name";
import { trackappGuestNavHref } from "@/lib/trackapp-landing-paths";
import { cn } from "@/lib/utils";

import "@/styles/trackapp-sidebar-footer.css";

function formatEarningsEur(amount: number): string {
  return `${amount.toLocaleString("fr-FR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}€`;
}

const AFFILIATION_HREF = "/trackapp/gagner-240";

type Props = Readonly<{
  email?: string;
  signOutHref: string;
  totalEarningsEur?: number;
  onNavigate?: () => void;
  collapsed?: boolean;
  loggedIn?: boolean;
}>;

export function TrackappSidebarFooter({
  email,
  signOutHref,
  totalEarningsEur,
  onNavigate,
  collapsed = false,
  loggedIn = false,
}: Props) {
  const affiliationHref = trackappGuestNavHref(AFFILIATION_HREF, loggedIn);
  const menuId = useId();
  const [menuOpen, setMenuOpen] = useState(false);
  const [earnedCents, setEarnedCents] = useState(totalEarningsEur ?? 0);
  const [affiliateLoaded, setAffiliateLoaded] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);

  const name = displayNameFromEmail(email);
  const earningsLabel = formatEarningsEur(earnedCents / 100);

  const loadAffiliateBalance = () => {
    if (!email || affiliateLoaded) return;
    setAffiliateLoaded(true);
    void fetch("/api/trackapp/affiliate/me", { credentials: "include" })
      .then((r) => (r.ok ? r.json() : null))
      .then((json: { balance?: { totalEarnedCents?: number } } | null) => {
        if (json?.balance?.totalEarnedCents != null) {
          setEarnedCents(json.balance.totalEarnedCents);
        }
      })
      .catch(() => {});
  };

  useEffect(() => {
    if (menuOpen) loadAffiliateBalance();
  }, [menuOpen]);
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

  return (
    <footer className={cn("app-sidebar-footer trackapp-sidebar-footer", collapsed && "trackapp-sidebar-footer--collapsed")}>
      <Link
        href={affiliationHref}
        className="trackapp-sidebar-earnings"
        aria-label="Affiliation — gains totaux"
        onPointerEnter={loadAffiliateBalance}
        onFocus={loadAffiliateBalance}
        onClick={() => onNavigate?.()}
      >
        <span className="trackapp-sidebar-earnings__glow" aria-hidden />
        <span className="trackapp-sidebar-earnings__vignette" aria-hidden />
        <div className="trackapp-sidebar-earnings__content">
          <p className="trackapp-sidebar-earnings__label">Vos gains totaux</p>
          <p className="trackapp-sidebar-earnings__value">{earningsLabel}</p>
        </div>
      </Link>

      <div className="trackapp-sidebar-profile">
        <div className="trackapp-sidebar-profile__avatar" aria-hidden>
          {avatarUrl ? (
            <Image src={avatarUrl} alt="" width={38} height={38} unoptimized />
          ) : (
            <span className="trackapp-sidebar-profile__avatar-fallback">{name.charAt(0)}</span>
          )}
        </div>

        <div className="trackapp-sidebar-profile__meta">
          <p className="trackapp-sidebar-profile__name">{name}</p>
          <p className="trackapp-sidebar-profile__email" title={email}>
            {email ?? "—"}
          </p>
        </div>

        <div className="trackapp-sidebar-profile__menu-wrap" ref={wrapRef}>
          <button
            type="button"
            className="trackapp-sidebar-profile__menu-btn"
            aria-label="Options du compte"
            aria-expanded={menuOpen}
            aria-controls={menuId}
            onClick={() => setMenuOpen((v) => !v)}
          >
            <span className="trackapp-sidebar-profile__menu-dots" aria-hidden>
              <span />
              <span />
              <span />
            </span>
          </button>

          {menuOpen ? (
            <div id={menuId} className="trackapp-sidebar-profile__dropdown" role="menu">
              <a href={signOutHref} role="menuitem" className="danger" onClick={() => setMenuOpen(false)}>
                Déconnexion
              </a>
            </div>
          ) : null}
        </div>
      </div>
    </footer>
  );
}
