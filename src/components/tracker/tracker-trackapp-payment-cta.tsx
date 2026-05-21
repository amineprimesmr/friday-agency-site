"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

import { useMobilePerf } from "@/lib/use-coarse-pointer";
import { cn } from "@/lib/utils";

const PAYMENT_HREF = "/trackapp/paiement";

/** CTA paiement — navigation native sur mobile ; prefetch sur desktop. */
export function TrackerTrackappPaymentCta({
  className,
  children,
}: Readonly<{
  className?: string;
  children: React.ReactNode;
}>) {
  const router = useRouter();
  const mobilePerf = useMobilePerf();

  useEffect(() => {
    if (!mobilePerf) router.prefetch(PAYMENT_HREF);
  }, [router, mobilePerf]);

  if (mobilePerf) {
    return (
      <Link href={PAYMENT_HREF} className={cn(className, "tracker-hero-liquidglass--instant")}>
        {children}
      </Link>
    );
  }

  return (
    <Link href={PAYMENT_HREF} className={cn(className, "tracker-hero-liquidglass--instant")} prefetch>
      {children}
    </Link>
  );
}
