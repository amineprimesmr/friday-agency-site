"use client";

/**
 * Copie logique fidelity/frontend/src/landing-cinematic/ScrollReveal.jsx
 * + vérif géométrie au montage pour éviter un titre bloqué en opacity:0 si déjà dans le viewport (React Strict Mode / scroll restauré).
 */
import { motion, useReducedMotion, useInView, type Transition } from "framer-motion";
import { type ReactNode, useEffect, useLayoutEffect, useRef, useState } from "react";

import { useMobilePerf } from "@/lib/use-coarse-pointer";

const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];

const VARIANTS = {
  "fade-up": {
    hidden: { opacity: 0, y: 28 },
    show: { opacity: 1, y: 0 },
  },
  "fade-in": {
    hidden: { opacity: 0 },
    show: { opacity: 1 },
  },
  "scale-up": {
    hidden: { opacity: 0, scale: 0.96 },
    show: { opacity: 1, scale: 1 },
  },
  "slide-left": {
    hidden: { opacity: 0, x: -32 },
    show: { opacity: 1, x: 0 },
  },
  "slide-right": {
    hidden: { opacity: 0, x: 32 },
    show: { opacity: 1, x: 0 },
  },
} as const;

export type ScrollRevealVariant = keyof typeof VARIANTS;

type ScrollRevealTag = "div" | "article" | "li" | "section";

const MOTION_TAGS: Record<ScrollRevealTag, typeof motion.div> = {
  div: motion.div,
  article: motion.article as unknown as typeof motion.div,
  li: motion.li as unknown as typeof motion.div,
  section: motion.section as unknown as typeof motion.div,
};

function snapIntoViewVisible(el: HTMLElement | null): boolean {
  if (!el) return false;
  const r = el.getBoundingClientRect();
  const h = window.innerHeight || 1;
  return r.top < h * 0.95 && r.bottom > h * 0.05;
}

export function ScrollReveal({
  children,
  className,
  delay = 0,
  variant = "fade-up",
  tag = "div",
}: {
  children: ReactNode;
  className?: string;
  delay?: number;
  variant?: ScrollRevealVariant;
  tag?: ScrollRevealTag;
}) {
  const reduce = useReducedMotion();
  const mobilePerf = useMobilePerf();
  const ref = useRef<HTMLDivElement | null>(null);
  const inView = useInView(ref, { amount: 0.15, margin: "0px 0px -8% 0px" });
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (reduce) return;
    if (inView) setVisible(true);
  }, [inView, reduce]);

  useLayoutEffect(() => {
    if (reduce) return;
    requestAnimationFrame(() => {
      if (snapIntoViewVisible(ref.current)) setVisible(true);
    });
  }, [reduce]);

  useEffect(() => {
    if (reduce) return;
    const snap = () => {
      if (document.visibilityState !== "visible") return;
      requestAnimationFrame(() => {
        if (snapIntoViewVisible(ref.current)) setVisible(true);
      });
    };
    document.addEventListener("visibilitychange", snap);
    window.addEventListener("pageshow", snap);
    return () => {
      document.removeEventListener("visibilitychange", snap);
      window.removeEventListener("pageshow", snap);
    };
  }, [reduce]);

  const vars = VARIANTS[variant] ?? VARIANTS["fade-up"];
  const transition: Transition = { duration: 0.7, ease: EASE, delay: visible ? delay : 0 };

  if (reduce || mobilePerf) {
    const Plain = tag;
    return <Plain className={className}>{children}</Plain>;
  }

  const Tag = MOTION_TAGS[tag] ?? motion.div;

  return (
    <Tag ref={ref} className={className} variants={vars} initial="hidden" animate={visible ? "show" : "hidden"} transition={transition}>
      {children}
    </Tag>
  );
}
