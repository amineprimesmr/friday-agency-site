"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";

import { TrackappPaymentPage } from "@/components/trackapp/trackapp-payment-page";
import { cn } from "@/lib/utils";

import "@/styles/trackapp-saas-pro-payment-page.css";

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
          className="fixed inset-0 z-[600]"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: reduce ? 0.01 : 0.2 }}
        >
          <button
            type="button"
            aria-label="Fermer la fenêtre de paiement"
            className="absolute inset-0 bg-black/70 backdrop-blur-[1px]"
            onClick={onClose}
          />

          <div className="pointer-events-none absolute inset-0 flex items-center justify-center p-4 md:p-6">
            <motion.div
              role="dialog"
              aria-modal="true"
              aria-labelledby="trackapp-payment-dialog-title"
              className={cn(
                "pointer-events-auto flex max-h-[min(92dvh,920px)] w-[min(520px,calc(100vw-2rem))] max-w-full flex-col overflow-hidden rounded-2xl shadow-2xl",
              )}
              initial={reduce ? false : { opacity: 0, scale: 0.9, y: 22 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={
                reduce
                  ? { duration: 0.12 }
                  : { type: "spring", damping: 28, stiffness: 340 }
              }
              onClick={(e) => e.stopPropagation()}
            >
              <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain [scrollbar-gutter:stable]">
                <TrackappPaymentPage embedded onRequestClose={onClose} />
              </div>
            </motion.div>
          </div>
        </motion.div>
      ) : null}
    </AnimatePresence>,
    document.body,
  );
}
