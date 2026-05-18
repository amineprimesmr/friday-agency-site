"use client";

import { usePathname } from "next/navigation";
import { motion, useReducedMotion } from "framer-motion";

export default function TrackerTemplate({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const reducedMotion = useReducedMotion();

  return (
    <motion.div
      key={pathname}
      initial={
        reducedMotion
          ? false
          : { opacity: 0, y: 6 }
      }
      animate={{
        opacity: 1,
        y: 0,
      }}
      transition={
        reducedMotion
          ? { duration: 0 }
          : { type: "spring", stiffness: 520, damping: 38, mass: 0.85 }
      }
      className="will-change-[opacity,transform]"
    >
      {children}
    </motion.div>
  );
}
