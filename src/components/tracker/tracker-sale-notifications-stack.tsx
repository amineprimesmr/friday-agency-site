"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import { useCoarsePointer } from "@/lib/use-coarse-pointer";
import { TRACKAPP_FAVICON_SRC } from "@/lib/trackapp-brand";
import { cn } from "@/lib/utils";

import "@/styles/tracker-sale-notifications.css";

export const TRACKER_SALE_NOTIF_ICON_SRC = TRACKAPP_FAVICON_SRC;

type SaleDemo = {
  id: string;
  brand: string;
  line: string;
  accent: "" | "notif-accent-a" | "notif-accent-b";
};

const DEMO_SALES: Omit<SaleDemo, "id">[] = [
  { brand: "Nouvelle vente 🎉", line: "Abonnement mensuel : +7,99 € MRR", accent: "" },
  { brand: "Nouvelle vente ✨", line: "Vente à l’unité : 12,99 € encaissée", accent: "notif-accent-a" },
  { brand: "Nouvelle vente 🎉", line: "Renouvellement : 29,99 € / mois confirmé", accent: "notif-accent-b" },
  { brand: "Nouvelle vente ✨", line: "Offre annuelle : +49,99 € (Facture 12 mois)", accent: "notif-accent-a" },
  { brand: "Nouvelle vente 🎉", line: "Achat in-app : module Pro · 9,99 €", accent: "" },
  { brand: "Nouvelle vente ✨", line: "Essai → abonnement : 4,99 € / mois activé", accent: "notif-accent-b" },
  { brand: "Nouvelle vente 🎉", line: "Panier complété : 24,90 € · paiement réussi", accent: "notif-accent-a" },
];

const SLOT_COUNT = 4;
const NEW_SALE_INTERVAL_MS = 4000;

const DEPTH_Y_PX = [0, 28, 54, 78] as const;

function shellScale(depth: number): number {
  return Number((1 - depth * 0.032).toFixed(4));
}

function shellOpacity(depth: number): number {
  return Number((1 - depth * 0.07).toFixed(3));
}

function timeLabel(depth: number): string {
  if (depth === 0) return "maintenant";
  if (depth === 1) return "1 min";
  return `${depth} min`;
}

function seedSlots(): SaleDemo[] {
  return DEMO_SALES.slice(0, SLOT_COUNT)
    .map((sale, i) => ({ ...sale, id: `seed-${i}` }))
    .reverse();
}

function SaleNotificationCard({
  sale,
  depth,
  pulse,
}: Readonly<{
  sale: SaleDemo;
  depth: number;
  pulse?: boolean;
}>) {
  const y = DEPTH_Y_PX[depth] ?? DEPTH_Y_PX[DEPTH_Y_PX.length - 1];

  return (
    <div
      data-depth={String(depth)}
      className={cn("tracker-sale-notif-shell", sale.accent, pulse && "tracker-sale-notif-shell--pulse")}
      style={{
        zIndex: 40 - depth,
        top: y,
        transform: `scale(${shellScale(depth)})`,
        opacity: shellOpacity(depth),
      }}
    >
      <div className="tracker-sale-notif">
        <div className="tracker-sale-notif-icon-wrap" aria-hidden>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={TRACKER_SALE_NOTIF_ICON_SRC}
            alt=""
            width={44}
            height={44}
            className="tracker-sale-notif-icon-img"
            decoding="async"
            loading={depth === 0 ? "eager" : "lazy"}
          />
        </div>
        <div className="tracker-sale-notif-body">
          <div className="tracker-sale-notif-head-row">
            <div className="tracker-sale-notif-head">{sale.brand}</div>
            <span className="tracker-sale-notif-time">{timeLabel(depth)}</span>
          </div>
          <p className="tracker-sale-notif-sub">{sale.line}</p>
        </div>
      </div>
    </div>
  );
}

export function TrackerSaleNotificationsStack({ className }: { className?: string }) {
  const coarsePointer = useCoarsePointer();
  const [slots, setSlots] = useState<SaleDemo[]>(seedSlots);
  const [pulse, setPulse] = useState(false);
  const saleIndexRef = useRef(SLOT_COUNT);
  const coarseRef = useRef(coarsePointer);
  coarseRef.current = coarsePointer;

  const pushSale = useCallback(() => {
    const i = saleIndexRef.current;
    const template = DEMO_SALES[i % DEMO_SALES.length];
    const entry: SaleDemo = { ...template, id: `live-${i}` };
    saleIndexRef.current = i + 1;

    setSlots((current) => [entry, current[0], current[1], current[2]]);

    if (!coarseRef.current) {
      setPulse(true);
      window.setTimeout(() => setPulse(false), 320);
    }
  }, []);

  useEffect(() => {
    const interval = window.setInterval(pushSale, NEW_SALE_INTERVAL_MS);
    return () => window.clearInterval(interval);
  }, [pushSale]);

  return (
    <figure
      className={cn(
        "tracker-sale-notifs mx-auto pb-10 pt-1",
        coarsePointer && "tracker-sale-notifs--static",
        className,
      )}
    >
      <figcaption className="sr-only">
        Notifications de ventes en direct : de nouvelles alertes s’ajoutent en continu.
      </figcaption>
      <div className="tracker-sale-notifs-stack">
        {slots.map((sale, depth) => (
          <SaleNotificationCard
            key={`slot-${depth}`}
            sale={sale}
            depth={depth}
            pulse={!coarsePointer && pulse && depth === 0}
          />
        ))}
      </div>
    </figure>
  );
}
