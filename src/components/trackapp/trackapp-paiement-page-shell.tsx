"use client";

import { useLayoutEffect, useRef } from "react";

import { TRACKAPP_PAIEMENT_SLIDE_UP_KEY } from "@/lib/trackapp-paiement-navigation";

/** Mobile : entrée type feuille depuis le bas (clic « Commencer maintenant » → sessionStorage). */
export function TrackappPaiementPageShell({ children }: Readonly<{ children: React.ReactNode }>) {
  const rootRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const el = rootRef.current;
    if (!el) return;
    try {
      if (window.matchMedia("(min-width: 1024px)").matches) {
        sessionStorage.removeItem(TRACKAPP_PAIEMENT_SLIDE_UP_KEY);
        return;
      }
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
        sessionStorage.removeItem(TRACKAPP_PAIEMENT_SLIDE_UP_KEY);
        return;
      }
      if (sessionStorage.getItem(TRACKAPP_PAIEMENT_SLIDE_UP_KEY) !== "1") return;
      sessionStorage.removeItem(TRACKAPP_PAIEMENT_SLIDE_UP_KEY);
    } catch {
      return;
    }

    el.classList.add("tpl-paiement-page--slide-enter");

    const clear = () => {
      el.classList.remove("tpl-paiement-page--slide-enter");
      el.removeEventListener("animationend", clear);
    };
    el.addEventListener("animationend", clear, { once: true });
  }, []);

  return (
    <div ref={rootRef} className="tpl-paiement-page">
      {children}
    </div>
  );
}
