"use client";

import { useEffect, useState } from "react";

import { TrackerMobileSaleNotificationBanner } from "@/components/tracker/tracker-mobile-sale-notification-banner";
import { TrackerSaleNotificationsStack } from "@/components/tracker/tracker-sale-notifications-stack";
import { useElementInView } from "@/lib/use-element-in-view";
import { useTouchDevice } from "@/lib/use-touch-device";

type TrackerSaleNotificationsExperienceProps = {
  className?: string;
};

/** Seuil scroll (px) — bannière dès qu’on commence à descendre sur mobile. */
const SCROLL_BANNER_TRIGGER_PX = 40;

/** Pile hero + bannière iOS flottante (mobile) quand on scrolle hors du hero. */
export function TrackerSaleNotificationsExperience({
  className,
}: TrackerSaleNotificationsExperienceProps) {
  const touch = useTouchDevice();
  const { ref: heroRef, inView: heroVisible } = useElementInView<HTMLElement>({
    threshold: 0.05,
    rootMargin: "0px 0px -4% 0px",
  });
  const [hasScrolled, setHasScrolled] = useState(false);

  useEffect(() => {
    if (!touch) return;

    const onScroll = () => {
      setHasScrolled(window.scrollY > SCROLL_BANNER_TRIGGER_PX);
    };

    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [touch]);

  const offHero = hasScrolled || !heroVisible;

  return (
    <>
      <TrackerSaleNotificationsStack ref={heroRef} paused={offHero} className={className} />
      <TrackerMobileSaleNotificationBanner active={offHero} />
    </>
  );
}
