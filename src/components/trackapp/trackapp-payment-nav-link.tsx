"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback } from "react";

import { cn } from "@/lib/utils";

/** Lien « Choisir un plan » → page pleine `/trackapp/paiement`. */
export function TrackappPaymentNavLink({
  children,
  className,
  onBeforeOpen,
}: Readonly<{
  children: React.ReactNode;
  className?: string;
  onBeforeOpen?: () => void;
}>) {
  const router = useRouter();

  const prefetch = useCallback(() => {
    router.prefetch("/trackapp/paiement");
  }, [router]);

  return (
    <Link
      href="/trackapp/paiement"
      prefetch={false}
      className={cn(className)}
      onClick={() => onBeforeOpen?.()}
      onPointerEnter={prefetch}
    >
      {children}
    </Link>
  );
}
