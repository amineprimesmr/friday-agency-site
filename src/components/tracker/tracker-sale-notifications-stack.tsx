"use client";

import Image from "next/image";
import { motion, useReducedMotion } from "framer-motion";
import { useCallback, useEffect, useRef, useState } from "react";

import { TRACKAPP_ICON_SRC } from "@/lib/trackapp-brand";
import { cn } from "@/lib/utils";

import "@/styles/tracker-sale-notifications.css";

/** Logo notification — icône officielle Trackapp. */
export const TRACKER_SALE_NOTIF_ICON_SRC = TRACKAPP_ICON_SRC;

type SaleDemo = {
  id: string;
  brand: string;
  line: string;
  accent: "" | "notif-accent-a" | "notif-accent-b";
};

const DEMO_SALES: Omit<SaleDemo, "id">[] = [
  {
    brand: "Nouvelle vente 🎉",
    line: "Abonnement mensuel : +7,99 € MRR",
    accent: "",
  },
  {
    brand: "Nouvelle vente ✨",
    line: "Vente à l’unité : 12,99 € encaissée",
    accent: "notif-accent-a",
  },
  {
    brand: "Nouvelle vente 🎉",
    line: "Renouvellement : 29,99 € / mois confirmé",
    accent: "notif-accent-b",
  },
  {
    brand: "Nouvelle vente ✨",
    line: "Offre annuelle : +49,99 € (Facture 12 mois)",
    accent: "notif-accent-a",
  },
  {
    brand: "Nouvelle vente 🎉",
    line: "Achat in-app : module Pro · 9,99 €",
    accent: "",
  },
  {
    brand: "Nouvelle vente ✨",
    line: "Essai → abonnement : 4,99 € / mois activé",
    accent: "notif-accent-b",
  },
  {
    brand: "Nouvelle vente 🎉",
    line: "Panier complété : 24,90 € · paiement réussi",
    accent: "notif-accent-a",
  },
];

const VISIBLE_COUNT = 4;
const NEW_SALE_INTERVAL_MS = 3800;

/** Décalage vertical par profondeur (pile iOS). */
const DEPTH_Y_PX = [0, 28, 54, 78] as const;

const SPRING = { type: "spring" as const, stiffness: 380, damping: 32, mass: 0.82 };

function shellScale(depth: number): number {
  return Number((1 - depth * 0.032).toFixed(4));
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
  rm,
  isNew,
}: Readonly<{
  sale: SaleDemo;
  depth: number;
  rm: boolean;
  isNew: boolean;
}>) {
  const y = DEPTH_Y_PX[depth] ?? DEPTH_Y_PX[DEPTH_Y_PX.length - 1];
  const scale = shellScale(depth);

  return (
    <motion.div
      data-depth={String(depth)}
      className={cn("tracker-sale-notif-shell", sale.accent)}
      style={{
        position: "absolute",
        insetInline: 0,
        top: 0,
        zIndex: 40 - depth,
        pointerEvents: "none",
      }}
      initial={
        isNew && !rm
          ? { opacity: 0, y: y - 32, scale: scale * 0.96 }
          : { opacity: 1, y, scale }
      }
      animate={{ opacity: 1, y, scale }}
      transition={rm ? { duration: 0.1 } : SPRING}
    >
      <div className="tracker-sale-notif">
        <div className="tracker-sale-notif-icon-wrap" aria-hidden>
          <Image
            src={TRACKER_SALE_NOTIF_ICON_SRC}
            alt=""
            fill
            className="tracker-sale-notif-icon-img"
            sizes="44px"
            priority={depth === 0}
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
    </motion.div>
  );
}

export function TrackerSaleNotificationsStack({ className }: { className?: string }) {
  const rm = useReducedMotion();
  const [stack, setStack] = useState<SaleDemo[]>(seedInitialStack);
  const [enteringId, setEnteringId] = useState<string | null>(null);
  const saleIndexRef = useRef(VISIBLE_COUNT);

  const pushSale = useCallback(() => {
    const i = saleIndexRef.current;
    const template = DEMO_SALES[i % DEMO_SALES.length];
    const entry: SaleDemo = {
      ...template,
      id: `live-${i}`,
    };

    saleIndexRef.current = i + 1;
    setEnteringId(entry.id);
    setStack((current) => [entry, ...current.slice(0, VISIBLE_COUNT - 1)]);
  }, []);

  useEffect(() => {
    if (!enteringId) return;
    const timer = window.setTimeout(() => setEnteringId(null), 700);
    return () => window.clearTimeout(timer);
  }, [enteringId]);

  useEffect(() => {
    if (rm) return;
    const interval = window.setInterval(pushSale, NEW_SALE_INTERVAL_MS);
    return () => window.clearInterval(interval);
  }, [rm, pushSale]);

  return (
    <figure className={cn("tracker-sale-notifs mx-auto pb-10 pt-1", className)}>
      <figcaption className="sr-only">
        Notifications de ventes en direct : de nouvelles alertes s’ajoutent en continu.
      </figcaption>
      <div className="tracker-sale-notifs-stack">
        {stack.map((sale, depth) => (
          <SaleNotificationCard
            key={sale.id}
            sale={sale}
            depth={depth}
            rm={Boolean(rm)}
            isNew={sale.id === enteringId}
          />
        ))}
      </div>
    </figure>
  );
}
