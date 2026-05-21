"use client";

import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef } from "react";

import { cn } from "@/lib/utils";

const PAYMENT_HREF = "/trackapp/paiement";

/** CTA paiement — prefetch + navigation au toucher pour réactivité iPhone. */
export function TrackerTrackappPaymentCta({
  className,
  children,
}: Readonly<{
  className?: string;
  children: React.ReactNode;
}>) {
  const router = useRouter();
  const navigatingRef = useRef(false);

  useEffect(() => {
    router.prefetch(PAYMENT_HREF);
  }, [router]);

  const goPayment = useCallback(() => {
    if (navigatingRef.current) return;
    navigatingRef.current = true;
    router.push(PAYMENT_HREF);
    window.setTimeout(() => {
      navigatingRef.current = false;
    }, 1200);
  }, [router]);

  return (
    <a
      href={PAYMENT_HREF}
      className={cn(className, "tracker-hero-liquidglass--instant")}
      onPointerDown={(event) => {
        if (event.button !== 0) return;
        goPayment();
      }}
      onClick={(event) => {
        event.preventDefault();
      }}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          goPayment();
        }
      }}
    >
      {children}
    </a>
  );
}
