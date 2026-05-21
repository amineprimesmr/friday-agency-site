"use client";

import { useCallback, useEffect, useRef, useState, type CSSProperties } from "react";

import { TRACKAPP_FAVICON_SRC } from "@/lib/trackapp-brand";
import { cn } from "@/lib/utils";

import "@/styles/tracker-sale-notifications.css";

/** Icône légère pour les notifications (évite le PNG 1254px sur iOS). */
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

const VISIBLE_COUNT = 4;
const NEW_SALE_INTERVAL_MS = 3600;
const EXIT_MS = 280;

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

function seedInitialStack(): SaleDemo[] {
  return DEMO_SALES.slice(0, VISIBLE_COUNT)
    .map((sale, i) => ({ ...sale, id: `seed-${i}` }))
    .reverse();
}

function SaleNotificationCard({
  sale,
  depth,
  entering,
  leaving,
}: Readonly<{
  sale: SaleDemo;
  depth: number;
  entering?: boolean;
  leaving?: boolean;
}>) {
  const y = DEPTH_Y_PX[depth] ?? DEPTH_Y_PX[DEPTH_Y_PX.length - 1];
  const scale = shellScale(depth);
  const opacity = shellOpacity(depth);

  return (
    <div
      data-depth={String(depth)}
      data-entering={entering ? "true" : undefined}
      data-leaving={leaving ? "true" : undefined}
      className={cn(
        "tracker-sale-notif-shell",
        sale.accent,
        entering && "tracker-sale-notif-shell--entering",
        leaving && "tracker-sale-notif-shell--leaving",
      )}
      style={
        {
          zIndex: 40 - depth,
          "--notif-y": `${y}px`,
          "--notif-scale": String(scale),
          "--notif-opacity": String(opacity),
        } as CSSProperties
      }
    >
      <div className="tracker-sale-notif">
        <div className="tracker-sale-notif-icon-wrap" aria-hidden>
          {/* eslint-disable-next-line @next/next/no-img-element -- favicon 32px, pas de decode lourd */}
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
  const [stack, setStack] = useState<SaleDemo[]>(seedInitialStack);
  const [enteringId, setEnteringId] = useState<string | null>(null);
  const [leaving, setLeaving] = useState<SaleDemo | null>(null);
  const saleIndexRef = useRef(VISIBLE_COUNT);
  const reducedMotionRef = useRef(false);

  useEffect(() => {
    reducedMotionRef.current = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  }, []);

  const clearEntering = useCallback((id: string) => {
    requestAnimationFrame(() => {
      requestAnimationFrame(() => setEnteringId((current) => (current === id ? null : current)));
    });
  }, []);

  const pushSale = useCallback(() => {
    const i = saleIndexRef.current;
    const template = DEMO_SALES[i % DEMO_SALES.length];
    const entry: SaleDemo = { ...template, id: `live-${i}` };
    saleIndexRef.current = i + 1;

    setStack((current) => {
      const dropped = current[VISIBLE_COUNT - 1];
      if (dropped && !reducedMotionRef.current) {
        setLeaving(dropped);
        window.setTimeout(() => setLeaving(null), EXIT_MS);
      }
      setEnteringId(entry.id);
      clearEntering(entry.id);
      return [entry, ...current.slice(0, VISIBLE_COUNT - 1)];
    });
  }, [clearEntering]);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const onChange = () => {
      reducedMotionRef.current = mq.matches;
    };
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  useEffect(() => {
    if (reducedMotionRef.current) return;
    const interval = window.setInterval(pushSale, NEW_SALE_INTERVAL_MS);
    return () => window.clearInterval(interval);
  }, [pushSale]);

  return (
    <figure className={cn("tracker-sale-notifs mx-auto pb-10 pt-1", className)}>
      <figcaption className="sr-only">
        Notifications de ventes en direct : de nouvelles alertes s’ajoutent en continu.
      </figcaption>
      <div className="tracker-sale-notifs-stack">
        {leaving ? (
          <SaleNotificationCard
            key={`leaving-${leaving.id}`}
            sale={leaving}
            depth={VISIBLE_COUNT - 1}
            leaving
          />
        ) : null}
        {stack.map((sale, depth) => (
          <SaleNotificationCard
            key={sale.id}
            sale={sale}
            depth={depth}
            entering={sale.id === enteringId}
          />
        ))}
      </div>
    </figure>
  );
}
