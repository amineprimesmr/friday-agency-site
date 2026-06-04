"use client";

import { AnimatePresence, motion } from "framer-motion";

import {
  applabFieldLayerMotion,
  applabFieldTransition,
  applabLayoutTransition,
} from "@/lib/trackapp-applab-create/step-motion";
import { cn } from "@/lib/utils";

export function TrackappApplabGlassComposer({
  expanded = false,
  area = false,
  stacked = false,
  fieldKey,
  canContinue,
  onContinue,
  continueLabel = "Continuer",
  busy = false,
  reduceMotion,
  footer,
  children,
}: Readonly<{
  expanded?: boolean;
  area?: boolean;
  stacked?: boolean;
  fieldKey?: string;
  canContinue: boolean;
  onContinue: () => void;
  continueLabel?: string;
  busy?: boolean;
  reduceMotion: boolean | null;
  footer?: React.ReactNode;
  children: React.ReactNode;
}>) {
  const layoutT = applabLayoutTransition(reduceMotion);
  const fieldTransition = applabFieldTransition(reduceMotion);
  const layerKey = fieldKey ?? "glass-field";

  return (
    <motion.div layout className="ta-applab-composer-slot" transition={layoutT}>
      <motion.div
        layout
        className={cn(
          "ta-applab-glass-panel",
          expanded ? "ta-applab-glass-panel--expanded" : "ta-applab-glass-panel--compact",
          stacked && "ta-applab-glass-panel--stacked",
        )}
        transition={layoutT}
      >
        <div className={cn("ta-applab-glass-panel__row", stacked && "ta-applab-glass-panel__row--stack")}>
          <div
            className={cn(
              "ta-applab-glass-panel__editor",
              "ta-applab-glass-panel__editor--morph",
              (area || expanded) && "ta-applab-glass-panel__editor--area",
              stacked && "ta-applab-glass-panel__editor--scroll",
            )}
          >
            <AnimatePresence mode="sync" initial={false}>
              <motion.div
                key={layerKey}
                className="ta-applab-glass-panel__field-layer"
                {...applabFieldLayerMotion}
                transition={fieldTransition}
              >
                {children}
              </motion.div>
            </AnimatePresence>
          </div>

          <aside className={cn("ta-applab-glass-panel__aside", stacked && "ta-applab-glass-panel__aside--stack")}>
            <button
              type="button"
              className="ta-applab-glass-panel__cta"
              disabled={!canContinue || busy}
              onClick={onContinue}
            >
              <span className="ta-applab-glass-panel__cta-label">{busy ? "…" : continueLabel}</span>
            </button>
          </aside>
        </div>

        {footer ? <div className="ta-applab-glass-panel__footer">{footer}</div> : null}
      </motion.div>
    </motion.div>
  );
}
