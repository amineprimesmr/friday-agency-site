"use client";

import Image from "next/image";
import { motion, useReducedMotion } from "framer-motion";

import { cn } from "@/lib/utils";

import "@/styles/tracker-sale-notifications.css";

/** Logo notification (PNG fond transparent) — `public/assets/RClogo.png`. */
export const TRACKER_SALE_NOTIF_ICON_SRC = "/assets/RClogo.png";

type SaleDemo = {
  id: string;
  brand: string;
  line: string;
  accent: "" | "notif-accent-a" | "notif-accent-b";
};

const DEMO_SALES: SaleDemo[] = [
  {
    id: "s1",
    brand: "Nouvelle vente 🎉",
    line: "Abonnement mensuel : +7,99 € MRR",
    accent: "",
  },
  {
    id: "s2",
    brand: "Nouvelle vente ✨",
    line: "Vente à l’unité : 12,99 € encaissée",
    accent: "notif-accent-a",
  },
  {
    id: "s3",
    brand: "Nouvelle vente 🎉",
    line: "Renouvellement : 29,99 € / mois confirmé",
    accent: "notif-accent-b",
  },
  {
    id: "s4",
    brand: "Nouvelle vente ✨",
    line: "Offre annuelle : +49,99 € (Facture 12 mois)",
    accent: "notif-accent-a",
  },
  {
    id: "s5",
    brand: "Nouvelle vente 🎉",
    line: "Achat in-app : module Pro · 9,99 €",
    accent: "",
  },
  {
    id: "s6",
    brand: "Nouvelle vente ✨",
    line: "Essai → abonnement : 4,99 € / mois activé",
    accent: "notif-accent-b",
  },
  {
    id: "s7",
    brand: "Nouvelle vente 🎉",
    line: "Panier complété : 24,90 € · paiement réussi",
    accent: "notif-accent-a",
  },
];

function overlapMarginRem(depth: number): string {
  if (depth <= 0) return "0";
  const base = -1.78 - depth * 0.46;
  return `${base.toFixed(2)}rem`;
}

/** Les coques restent pleinement opaques : la pile ne doit pas disparaître en transparence. */
function shellOpacity(): number {
  return 1;
}

function shellScale(depth: number): number {
  return Number((1 - depth * 0.036).toFixed(4));
}

export function TrackerSaleNotificationsStack({ className }: { className?: string }) {
  const rm = useReducedMotion();

  const stack = [...DEMO_SALES].reverse();

  return (
    <figure className={cn("tracker-sale-notifs mx-auto pb-10 pt-1", className)}>
      <figcaption className="sr-only">
        Exemple décoratif : plusieurs notifications de ventes empilées avec effet verre.
      </figcaption>
      <div className="tracker-sale-notifs-stack">
        {stack.map((sale, idx) => {
          const depth = idx;
          const scale = shellScale(depth);
          const faded = shellOpacity();

          const restingBlur = "blur(0px)";
          const enterBlur = "blur(0px)";

          return (
            <motion.div
              key={sale.id}
              data-depth={String(depth)}
              className={`tracker-sale-notif-shell ${sale.accent}`}
              style={{
                marginTop: depth === 0 ? undefined : overlapMarginRem(depth),
                zIndex: 30 - depth,
              }}
              initial={
                rm
                  ? false
                  : {
                      opacity: 0,
                      y: 28 + idx * 8,
                      rotateX: -3 + idx * 1.05,
                      filter: enterBlur,
                    }
              }
              animate={
                rm
                  ? { opacity: faded, y: 0, rotateX: 0, filter: "blur(0px)" }
                  : {
                      opacity: faded,
                      y: 0,
                      rotateX: 0,
                      filter: restingBlur,
                    }
              }
              transition={
                rm
                  ? { duration: 0.14 }
                  : {
                      delay: idx * 0.058,
                      type: "spring",
                      stiffness: 360 + depth * 10,
                      damping: 31,
                      mass: 0.68,
                    }
              }
            >
              {!rm && depth === 0 ? (
                <motion.div
                  aria-hidden
                  className="absolute inset-x-6 -bottom-2 z-0 h-4 rounded-[50%]"
                  style={{
                    background: "rgba(0,0,0,0.22)",
                    filter: "blur(12px)",
                  }}
                  initial={{ scale: 0.85, opacity: 0 }}
                  animate={{ scale: [0.9, 1, 1], opacity: [0.12, 0.52, 0.4] }}
                  transition={{
                    delay: 0.5,
                    duration: 0.65,
                    ease: [0.22, 1, 0.36, 1],
                  }}
                />
              ) : null}

              <div
                className="tracker-sale-notif-visual"
                style={{
                  transform: `scale(${String(scale)})`,
                  transformOrigin: "50% 0%",
                }}
              >
                <div className="tracker-sale-notif">
                  <div className="tracker-sale-notif-icon-wrap">
                    <div className="tracker-sale-notif-icon-surface tracker-sale-notif-icon-surface--brand">
                      <Image
                        src={TRACKER_SALE_NOTIF_ICON_SRC}
                        alt=""
                        fill
                        className="tracker-sale-notif-icon-img object-contain select-none pointer-events-none"
                        sizes="48px"
                        unoptimized
                      />
                    </div>
                  </div>
                  <div className="tracker-sale-notif-body">
                    <div className="tracker-sale-notif-head">{sale.brand}</div>
                    <p className="tracker-sale-notif-sub">{sale.line}</p>
                  </div>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </figure>
  );
}
