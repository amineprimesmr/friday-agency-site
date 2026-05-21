"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

import { cn } from "@/lib/utils";

const PAYMENT_HREF = "/trackapp/paiement";

export function TrackerTrackappPaymentCta({
  className,
  children,
}: Readonly<{
  className?: string;
  children: React.ReactNode;
}>) {
  const router = useRouter();

  useEffect(() => {
    router.prefetch(PAYMENT_HREF);
  }, [router]);

  return (
    <Link href={PAYMENT_HREF} className={cn(className, "tracker-hero-liquidglass--instant")} prefetch>
      {children}
    </Link>
  );
}
