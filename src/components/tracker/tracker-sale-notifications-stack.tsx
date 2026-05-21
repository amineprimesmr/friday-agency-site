"use client";

import { forwardRef, useCallback, useEffect, useRef, useState } from "react";

import { useTouchDevice } from "@/lib/use-touch-device";
import {
  playSaleNotificationFeedback,
  unlockSaleNotificationFeedback,
} from "@/lib/sale-notification-feedback";
import {
  nextSaleDemo,
  seedSaleDemoSlots,
  type SaleDemo,
} from "@/lib/tracker-sale-demo-data";
import { nextIrregularSaleDelayMs } from "@/lib/sale-notification-schedule";
import { cn } from "@/lib/utils";

import { SaleNotificationCard } from "@/components/tracker/sale-notification-card";

import "@/styles/tracker-sale-notifications.css";

const SLOT_COUNT = 4;

type TrackerSaleNotificationsStackProps = {
  className?: string;
  /** Pause les nouvelles notifs quand la pile n’est plus visible (ex. scroll). */
  paused?: boolean;
};

export const TrackerSaleNotificationsStack = forwardRef<
  HTMLElement,
  TrackerSaleNotificationsStackProps
>(function TrackerSaleNotificationsStack({ className, paused = false }, ref) {
  const touch = useTouchDevice();
  const [slots, setSlots] = useState<SaleDemo[]>(() => seedSaleDemoSlots(SLOT_COUNT));
  const [enterPulse, setEnterPulse] = useState(false);
  const saleIndexRef = useRef(SLOT_COUNT);
  const touchRef = useRef(touch);
  const pausedRef = useRef(paused);
  touchRef.current = touch;
  pausedRef.current = paused;

  const pushSale = useCallback(() => {
    const i = saleIndexRef.current;
    const entry = nextSaleDemo(i, "live");
    saleIndexRef.current = i + 1;
    setSlots((current) => [entry, current[0], current[1], current[2]]);
    setEnterPulse(true);
    playSaleNotificationFeedback({ touch: touchRef.current });
    window.setTimeout(() => setEnterPulse(false), touchRef.current ? 420 : 520);
  }, []);

  useEffect(() => {
    const unlock = () => unlockSaleNotificationFeedback();
    window.addEventListener("pointerdown", unlock, { once: true, passive: true });
    window.addEventListener("keydown", unlock, { once: true });
    return () => {
      window.removeEventListener("pointerdown", unlock);
      window.removeEventListener("keydown", unlock);
    };
  }, []);

  useEffect(() => {
    if (paused) return;

    let timeoutId = 0;

    const scheduleNext = () => {
      timeoutId = window.setTimeout(() => {
        if (pausedRef.current || document.visibilityState === "hidden") {
          scheduleNext();
          return;
        }
        pushSale();
        scheduleNext();
      }, nextIrregularSaleDelayMs("hero"));
    };

    scheduleNext();
    return () => window.clearTimeout(timeoutId);
  }, [paused, pushSale]);

  return (
    <figure
      ref={ref}
      id="tracker-hero-sale-notifs"
      className={cn("tracker-sale-notifs mx-auto pb-10 pt-1", className)}
    >
      <figcaption className="sr-only">
        Notifications de ventes en direct : de nouvelles alertes s’ajoutent en continu.
      </figcaption>
      <div className="tracker-sale-notifs-stack">
        {slots.map((sale, depth) => (
          <SaleNotificationCard
            key={depth === 0 ? sale.id : `slot-${depth}`}
            sale={sale}
            depth={depth}
            enterPulse={enterPulse}
          />
        ))}
      </div>
    </figure>
  );
});
