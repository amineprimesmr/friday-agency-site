"use client";

import { motion } from "framer-motion";

import { HeroAppIconRotator, type HeroRotatorApp } from "@/components/tracker/hero-app-icon-rotator";
import { TrackerLandingHeroTitle } from "@/components/tracker/tracker-landing-hero-title";
import { heroTitleForStep, getStepInputProgress } from "@/lib/trackapp-applab-create/create-questions";
import type { ApplabCreateStepId } from "@/lib/trackapp-applab-create/types";
import { applabLayoutTransition } from "@/lib/trackapp-applab-create/step-motion";
import { cn } from "@/lib/utils";

type HeroCopy = Readonly<{
  title: string;
  sub: string;
}>;

export function TrackappApplabHeroHeading({
  step,
  appName,
  hero,
  synthesisPhase,
  reduceMotion,
  heroRotatorApps = [],
}: Readonly<{
  step: ApplabCreateStepId;
  appName: string;
  hero: HeroCopy;
  synthesisPhase?: "analyzing" | "reveal" | null;
  reduceMotion: boolean | null;
  heroRotatorApps?: readonly HeroRotatorApp[];
}>) {
  const layoutT = applabLayoutTransition(reduceMotion);
  const name = appName.trim() || "votre app";
  const isNameStep = step === "name";
  const isConcept = step === "concept";
  const progress = getStepInputProgress(step);

  const title =
    step === "synthesis" ?
      synthesisPhase === "reveal" ?
        `Votre bilan AppLAB est prêt`
      : `Analyse de ${name}`
    : step === "concept" ?
      null
    : isNameStep ?
      null
    : heroTitleForStep(step, name);

  const titleKey = step === "synthesis" ? `synthesis-${synthesisPhase ?? "run"}` : step;

  return (
    <motion.div layout className="ta-applab-studio__hero-copy" transition={layoutT}>
      {isNameStep ? (
        <motion.div layout key={titleKey} transition={layoutT} initial={reduceMotion ? false : { opacity: 0.72 }} animate={{ opacity: 1 }}>
          <TrackerLandingHeroTitle className="ta-applab-studio__hero-landing-title">
            Créez votre prochaine
            <br />
            <span className="ta-applab-studio__hero-landing-title-line2">
              <span>app</span>
              <HeroAppIconRotator apps={heroRotatorApps} className="ta-applab-studio__hero-landing-icon" />
              <span>maintenant</span>
            </span>
          </TrackerLandingHeroTitle>
        </motion.div>
      ) : (
        <motion.h1
          layout
          key={titleKey}
          className={cn(
            "ta-applab-studio__hero-title",
            "ta-applab-studio__hero-title--concept",
          )}
          transition={layoutT}
          initial={reduceMotion ? false : { opacity: 0.72 }}
          animate={{ opacity: 1 }}
        >
          {isConcept ? (
            <>
              Décris le concept de{" "}
              <motion.span layout="position" className="ta-applab-studio__hero-app-name" transition={layoutT}>
                {name}
              </motion.span>{" "}
              en une phrase
            </>
          ) : (
            title
          )}
        </motion.h1>
      )}

      {progress ? (
        <motion.p layout className="ta-applab-studio__hero-sub ta-applab-studio__hero-sub--progress" transition={layoutT}>
          Question {progress.current} sur {progress.total}
        </motion.p>
      ) : step === "synthesis" && synthesisPhase === "analyzing" ? (
        <motion.p layout className="ta-applab-studio__hero-sub" transition={layoutT}>
          Concurrents, synthèse produit et prompt Xcode — tout est généré automatiquement.
        </motion.p>
      ) : hero.sub ? (
        <motion.p layout className="ta-applab-studio__hero-sub" transition={layoutT}>
          {hero.sub}
        </motion.p>
      ) : null}
    </motion.div>
  );
}
