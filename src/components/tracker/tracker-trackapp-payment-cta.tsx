"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect } from "react";

import { cn } from "@/lib/utils";

/** CTA paiement depuis la landing Tracker → page pleine `/trackapp/paiement`. */
export function TrackerTrackappPaymentCta({
  className,
  children,
}: Readonly<{
  className?: string;
  children: React.ReactNode;
}>) {
  const router = useRouter();

  useEffect(() => {
    router.prefetch("/trackapp/paiement");
  }, [router]);

  const prefetchPayment = useCallback(() => {
    router.prefetch("/trackapp/paiement");
  }, [router]);

  return (
    <Link
      href="/trackapp/paiement"
      scroll
      className={cn(className)}
      onPointerEnter={prefetchPayment}
      onPointerDown={prefetchPayment}
      onTouchStart={prefetchPayment}
    >
      {children}
    </Link>
  );
}
