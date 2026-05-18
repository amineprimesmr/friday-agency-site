"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { useCallback, useState } from "react";

import { prepareTrackappPaiementSlideEnter } from "@/lib/trackapp-paiement-navigation";
import { cn } from "@/lib/utils";

const TrackappPaymentOverlay = dynamic(
  () => import("@/components/trackapp/trackapp-payment-overlay").then((mod) => mod.TrackappPaymentOverlay),
  { ssr: false },
);

/**
 * Depuis la page Tracker : bureau ouvre une modale ; mobile / tablette suit le lien vers la page
 * pleine `/trackapp/paiement` (parcours détaillé + checkout).
 */
export function TrackerTrackappPaymentCta({
  className,
  children,
}: Readonly<{
  className?: string;
  children: React.ReactNode;
}>) {
  const [open, setOpen] = useState(false);

  const handleClick = useCallback((e: React.MouseEvent<HTMLAnchorElement>) => {
    if (typeof window === "undefined") return;
    if (!window.matchMedia("(min-width: 1024px)").matches) {
      prepareTrackappPaiementSlideEnter();
      return;
    }
    e.preventDefault();
    setOpen(true);
  }, []);

  return (
    <>
      <Link
        href="/trackapp/paiement"
        scroll
        className={cn(className)}
        onClick={handleClick}
        aria-haspopup="dialog"
        aria-expanded={open}
      >
        {children}
      </Link>
      <TrackappPaymentOverlay open={open} onClose={() => setOpen(false)} />
    </>
  );
}
