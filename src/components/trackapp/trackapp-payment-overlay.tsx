"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";

import { TrackappPaymentFlow } from "@/components/trackapp/trackapp-payment-flow";

/** Modale bureau uniquement — le mobile va sur `/trackapp/paiement` (page pleine). */
export function TrackappPaymentOverlay({
  open,
  onClose,
}: Readonly<{
  open: boolean;
  onClose: () => void;
}>) {
  const [mounted, setMounted] = useState(false);
  const reduce = useReducedMotion();

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (!open) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!mounted) return null;

  return createPortal(
    <AnimatePresence>
      {open ? (
        <motion.div
          key="trackapp-payment-overlay"
          className="fixed inset-0 z-[960]"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: reduce ? 0.01 : 0.2 }}
        >
          <button
            type="button"
            aria-label="Fermer la fenêtre de paiement"
            className="absolute inset-0 bg-black/55 backdrop-blur-md md:bg-black/60 md:backdrop-blur-lg lg:backdrop-blur-xl"
            onClick={onClose}
          />

          <motion.div
            role="dialog"
            aria-modal="true"
            aria-labelledby="trackapp-payment-dialog-title"
            className="pointer-events-none absolute inset-0 flex items-center justify-center p-4 md:p-8 lg:p-10"
            initial={reduce ? false : { opacity: 0, scale: 0.96, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={reduce ? undefined : { opacity: 0, scale: 0.98, y: 10 }}
            transition={reduce ? { duration: 0.12 } : { type: "spring", damping: 28, stiffness: 340 }}
          >
            <motion.div
              className="pointer-events-auto w-[min(88rem,calc(100vw-2rem))] max-w-full"
              onClick={(e) => e.stopPropagation()}
            >
              <TrackappPaymentFlow onClose={onClose} />
            </motion.div>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>,
    document.body,
  );
}
