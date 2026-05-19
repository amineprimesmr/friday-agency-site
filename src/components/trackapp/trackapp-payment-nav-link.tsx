"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useState } from "react";

import { cn } from "@/lib/utils";

const TrackappPaymentOverlay = dynamic(
  () => import("@/components/trackapp/trackapp-payment-overlay").then((mod) => mod.TrackappPaymentOverlay),
  { ssr: false },
);

const DESKTOP_PAYMENT_MQ = "(min-width: 1024px)";

function isDesktopPayment(): boolean {
  return typeof window !== "undefined" && window.matchMedia(DESKTOP_PAYMENT_MQ).matches;
}

/** Lien « Choisir un plan » : page pleine mobile, modale bureau. */
export function TrackappPaymentNavLink({
  children,
  className,
  onBeforeOpen,
}: Readonly<{
  children: React.ReactNode;
  className?: string;
  onBeforeOpen?: () => void;
}>) {
  const [open, setOpen] = useState(false);
  const router = useRouter();

  const prefetch = useCallback(() => {
    router.prefetch("/trackapp/paiement");
  }, [router]);

  const handleClick = useCallback(
    (e: React.MouseEvent<HTMLAnchorElement>) => {
      if (!isDesktopPayment()) return;
      e.preventDefault();
      onBeforeOpen?.();
      setOpen(true);
    },
    [onBeforeOpen],
  );

  return (
    <>
      <Link
        href="/trackapp/paiement"
        prefetch={false}
        className={cn(className)}
        onClick={handleClick}
        onPointerEnter={prefetch}
        aria-haspopup="dialog"
        aria-expanded={open}
      >
        {children}
      </Link>
      {open ? <TrackappPaymentOverlay open={open} onClose={() => setOpen(false)} /> : null}
    </>
  );
}

export { DESKTOP_PAYMENT_MQ, isDesktopPayment };
