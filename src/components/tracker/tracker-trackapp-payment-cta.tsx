"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

import { TRACKAPP_LANDING_PATH } from "@/lib/trackapp-landing-paths";
import { cn } from "@/lib/utils";

export function TrackerTrackappPaymentCta({
  className,
  children,
}: Readonly<{
  className?: string;
  children: React.ReactNode;
}>) {
  const router = useRouter();

  useEffect(() => {
    router.prefetch(TRACKAPP_LANDING_PATH);
  }, [router]);

  return (
    <Link href={TRACKAPP_LANDING_PATH} className={cn(className, "tracker-hero-liquidglass--instant")} prefetch>
      {children}
    </Link>
  );
}
