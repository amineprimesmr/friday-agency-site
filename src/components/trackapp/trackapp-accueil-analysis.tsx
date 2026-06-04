"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";

import { cn } from "@/lib/utils";

import "@/styles/trackapp-accueil-analysis.css";

export const TRACKAPP_ANALYSIS_STEPS = [
  { id: "hero", label: "Identité de l'app" },
  { id: "applab", label: "Intelligence AppLAB" },
  { id: "metrics", label: "Métriques & performance" },
  { id: "iap", label: "Achats intégrés App Store" },
  { id: "social", label: "Réseaux sociaux & présence officielle" },
  { id: "rankings", label: "Classements par pays" },
  { id: "screenshots", label: "Captures App Store" },
  { id: "competitors", label: "Analyse concurrentielle IA" },
] as const;

export type TrackappAnalysisStepId = (typeof TRACKAPP_ANALYSIS_STEPS)[number]["id"];

type AnalysisContextValue = {
  appName: string;
  loadedSteps: ReadonlySet<TrackappAnalysisStepId>;
  markLoaded: (stepId: TrackappAnalysisStepId) => void;
};

const AnalysisContext = createContext<AnalysisContextValue | null>(null);

function useAnalysisContext(): AnalysisContextValue {
  const ctx = useContext(AnalysisContext);
  if (!ctx) {
    throw new Error("TrackappAccueilAnalysisRoot required");
  }
  return ctx;
}

export function TrackappAccueilAnalysisRoot({
  appName,
  children,
}: Readonly<{
  appName: string;
  children: ReactNode;
}>) {
  const [loadedSteps, setLoadedSteps] = useState<ReadonlySet<TrackappAnalysisStepId>>(() => new Set());

  const markLoaded = useCallback((stepId: TrackappAnalysisStepId) => {
    setLoadedSteps((prev) => {
      if (prev.has(stepId)) return prev;
      const next = new Set(prev);
      next.add(stepId);
      return next;
    });
  }, []);

  const value = useMemo(
    () => ({ appName, loadedSteps, markLoaded }),
    [appName, loadedSteps, markLoaded],
  );

  return (
    <AnalysisContext.Provider value={value}>
      <div className="trackapp-analysis-root">{children}</div>
    </AnalysisContext.Provider>
  );
}

function stepLabel(stepId: TrackappAnalysisStepId): string {
  return TRACKAPP_ANALYSIS_STEPS.find((s) => s.id === stepId)?.label ?? "Analyse en cours";
}

export function TrackappAnalysisStatusBar() {
  const reduce = useReducedMotion();
  const { appName, loadedSteps } = useAnalysisContext();
  const [dismissed, setDismissed] = useState(false);

  const total = TRACKAPP_ANALYSIS_STEPS.length;
  const doneCount = loadedSteps.size;
  const allDone = doneCount >= total;
  const activeStep =
    TRACKAPP_ANALYSIS_STEPS.find((step) => !loadedSteps.has(step.id))?.id ?? null;

  useEffect(() => {
    if (!allDone || dismissed) return undefined;
    const timer = window.setTimeout(() => setDismissed(true), 2400);
    return () => window.clearTimeout(timer);
  }, [allDone, dismissed]);

  if (reduce || dismissed) return null;

  const statusLabel = allDone
    ? "Analyse complète — toutes les données sont prêtes"
    : activeStep
      ? `${stepLabel(activeStep)}…`
      : "Initialisation de l'analyse…";

  return (
    <AnimatePresence>
      <motion.div
        className="trackapp-analysis-status"
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -6 }}
        transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
        role="status"
        aria-live="polite"
        aria-atomic="true"
      >
        <div className="trackapp-analysis-status__inner">
          <span
            className={cn(
              "trackapp-analysis-status__icon",
              allDone && "trackapp-analysis-status__icon--done",
            )}
            aria-hidden
          >
            {allDone ? "✓" : "◆"}
          </span>
          <div className="trackapp-analysis-status__body">
            <p className="trackapp-analysis-status__kicker">Trackapp AI</p>
            <p className="trackapp-analysis-status__label">
              {allDone ? (
                <>
                  Analyse de <strong>{appName}</strong> terminée
                </>
              ) : (
                <>
                  Analyse de <strong>{appName}</strong> — {statusLabel}
                </>
              )}
            </p>
          </div>
          <div className="trackapp-analysis-status__progress" aria-hidden>
            {TRACKAPP_ANALYSIS_STEPS.map((step) => (
              <span
                key={step.id}
                className={cn(
                  "trackapp-analysis-status__dot",
                  loadedSteps.has(step.id) && "trackapp-analysis-status__dot--done",
                  !loadedSteps.has(step.id) && step.id === activeStep && "trackapp-analysis-status__dot--active",
                )}
              />
            ))}
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}

const revealTransition = { duration: 0.52, ease: [0.22, 1, 0.36, 1] as const };

export function TrackappAnalysisSection({
  stepId,
  children,
  className,
}: Readonly<{
  stepId: TrackappAnalysisStepId;
  children: ReactNode;
  className?: string;
}>) {
  const reduce = useReducedMotion();
  const { markLoaded } = useAnalysisContext();

  useEffect(() => {
    markLoaded(stepId);
  }, [markLoaded, stepId]);

  if (reduce) {
    return <div className={className}>{children}</div>;
  }

  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: 22, filter: "blur(8px)" }}
      animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
      transition={revealTransition}
    >
      {children}
    </motion.div>
  );
}

function AnalysisBlockHeader({ label }: Readonly<{ label: string }>) {
  return (
    <div className="trackapp-analysis-block__header">
      <span className="trackapp-analysis-block__spinner" aria-hidden />
      <p className="trackapp-analysis-block__title">Trackapp AI — {label}</p>
    </div>
  );
}

function Shimmer({ className }: Readonly<{ className?: string }>) {
  return <div className={cn("trackapp-analysis-shimmer", className)} aria-hidden />;
}

export function TrackappAnalysisLoading({
  stepId,
  className,
}: Readonly<{
  stepId: TrackappAnalysisStepId;
  className?: string;
}>) {
  const label = stepLabel(stepId);

  if (stepId === "applab") {
    return (
      <section
        className={cn(
          "trackapp-analysis-block mt-5 overflow-hidden rounded-[28px] border border-[var(--dash-border)] bg-white shadow-[var(--dash-shadow-lg)] trackapp-analysis-block__scan",
          className,
        )}
        aria-busy="true"
        aria-label={`${label} en cours`}
      >
        <AnalysisBlockHeader label={label} />
        <Shimmer className="h-28 w-full rounded-2xl" />
        <div className="mt-4 grid gap-3 lg:grid-cols-3">
          {Array.from({ length: 3 }, (_, i) => (
            <Shimmer key={i} className="h-40 rounded-2xl" />
          ))}
        </div>
      </section>
    );
  }

  if (stepId === "metrics") {
    return (
      <section
        className={cn("trackapp-analysis-block mt-5 trackapp-analysis-block__scan", className)}
        aria-busy="true"
        aria-label={`${label} en cours`}
      >
        <AnalysisBlockHeader label={label} />
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-6">
          {Array.from({ length: 6 }, (_, i) => (
            <div
              key={i}
              className="rounded-[20px] border border-[var(--dash-border)] bg-white p-4 shadow-[var(--dash-shadow)]"
              style={{ animationDelay: `${i * 70}ms` }}
            >
              <Shimmer className="h-3 w-24" />
              <Shimmer className="mt-3 h-8 w-32" />
              <Shimmer className="mt-2 h-3 w-40" />
            </div>
          ))}
        </div>
      </section>
    );
  }

  if (stepId === "iap" || stepId === "rankings") {
    return (
      <section
        className={cn(
          "trackapp-analysis-block overflow-hidden rounded-[28px] border border-[var(--dash-border)] bg-white p-6 shadow-[var(--dash-shadow-lg)] trackapp-analysis-block__scan",
          stepId === "iap" ? "mt-5" : "mt-5",
          className,
        )}
        aria-busy="true"
        aria-label={`${label} en cours`}
      >
        <AnalysisBlockHeader label={label} />
        <Shimmer className="h-3 w-32" />
        <Shimmer className="mt-3 h-7 w-56" />
        <div className="mt-5 grid gap-3 sm:grid-cols-2">
          {Array.from({ length: stepId === "rankings" ? 1 : 4 }, (_, i) => (
            <Shimmer key={i} className={stepId === "rankings" ? "h-64 rounded-2xl" : "h-16 rounded-2xl"} />
          ))}
        </div>
      </section>
    );
  }

  if (stepId === "social") {
    return (
      <section
        className={cn(
          "trackapp-analysis-block mt-5 overflow-hidden rounded-[28px] border border-[var(--dash-border)] bg-white shadow-[var(--dash-shadow-lg)] trackapp-analysis-block__scan",
          className,
        )}
        aria-busy="true"
        aria-label={`${label} en cours`}
      >
        <div className="border-b border-[var(--dash-border)] px-5 py-5 sm:px-6">
          <AnalysisBlockHeader label={label} />
          <Shimmer className="mt-2 h-7 w-48" />
        </div>
        <div className="p-5 sm:p-6">
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }, (_, i) => (
              <Shimmer key={i} className="h-[118px] rounded-[20px]" />
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (stepId === "screenshots") {
    return (
      <section
        className={cn(
          "trackapp-analysis-block mt-5 rounded-[24px] border border-[var(--dash-border)] bg-white p-5 shadow-[var(--dash-shadow)] trackapp-analysis-block__scan",
          className,
        )}
        aria-busy="true"
        aria-label={`${label} en cours`}
      >
        <AnalysisBlockHeader label={label} />
        <div className="mt-4 flex gap-3 overflow-hidden">
          {Array.from({ length: 5 }, (_, i) => (
            <Shimmer key={i} className="h-[168px] w-[78px] shrink-0 rounded-xl" />
          ))}
        </div>
      </section>
    );
  }

  if (stepId === "competitors") {
    return (
      <section
        className={cn(
          "trackapp-analysis-block trackapp-competitors mt-5 rounded-[24px] border border-[var(--dash-border)] bg-white p-5 trackapp-analysis-block__scan",
          className,
        )}
        aria-busy="true"
        aria-label={`${label} en cours`}
      >
        <AnalysisBlockHeader label={label} />
        <Shimmer className="mt-2 h-8 w-72" />
        <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 3 }, (_, i) => (
            <Shimmer key={i} className="h-28 rounded-2xl" />
          ))}
        </div>
      </section>
    );
  }

  return (
    <section
      className={cn("trackapp-analysis-block mt-5 trackapp-analysis-block__scan", className)}
      aria-busy="true"
      aria-label={`${label} en cours`}
    >
      <AnalysisBlockHeader label={label} />
      <Shimmer className="h-24 w-full rounded-2xl" />
    </section>
  );
}

export function TrackappAnalysisStepMarker({
  stepId,
}: Readonly<{
  stepId: TrackappAnalysisStepId;
}>) {
  const { markLoaded } = useAnalysisContext();

  useEffect(() => {
    markLoaded(stepId);
  }, [markLoaded, stepId]);

  return null;
}

export function TrackappAnalysisStagger({
  children,
  className,
}: Readonly<{
  children: ReactNode;
  className?: string;
}>) {
  const reduce = useReducedMotion();

  if (reduce) {
    return <div className={className}>{children}</div>;
  }

  return (
    <motion.div
      className={className}
      initial="hidden"
      animate="show"
      variants={{
        hidden: {},
        show: {
          transition: { staggerChildren: 0.07, delayChildren: 0.06 },
        },
      }}
    >
      {children}
    </motion.div>
  );
}

export function TrackappAnalysisStaggerItem({
  children,
  className,
}: Readonly<{
  children: ReactNode;
  className?: string;
}>) {
  const reduce = useReducedMotion();

  if (reduce) {
    return <div className={className}>{children}</div>;
  }

  return (
    <motion.div
      className={className}
      variants={{
        hidden: { opacity: 0, y: 16, scale: 0.98 },
        show: {
          opacity: 1,
          y: 0,
          scale: 1,
          transition: { duration: 0.42, ease: [0.22, 1, 0.36, 1] },
        },
      }}
    >
      {children}
    </motion.div>
  );
}

/** Alias sémantique pour grilles de métriques (même comportement que Stagger). */
export const TrackappAnalysisStaggerGrid = TrackappAnalysisStagger;
