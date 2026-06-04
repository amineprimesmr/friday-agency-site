"use client";

import { AnimatePresence, LayoutGroup, motion, useReducedMotion } from "framer-motion";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { TrackappApplabGlassComposer } from "@/components/trackapp/applab-create/trackapp-applab-glass-composer";
import { TrackappApplabHeroHeading } from "@/components/trackapp/applab-create/trackapp-applab-hero-heading";
import { TrackappApplabQuestionField } from "@/components/trackapp/applab-create/trackapp-applab-question-field";
import { TrackappApplabStudioGallery } from "@/components/trackapp/applab-create/trackapp-applab-studio-gallery";
import { TrackappApplabSynthesisStep } from "@/components/trackapp/applab-create/trackapp-applab-synthesis-step";
import { TrackerHeroSocialProofBadge } from "@/components/tracker/tracker-hero-social-proof-badge";
import { listHeroRotatorApps } from "@/lib/selection-app/items";
import {
  canSubmitInputStep,
  createQuestionsForApi,
  getQuestionField,
  isAnswerStep,
  migrateCreateAnswers,
} from "@/lib/trackapp-applab-create/create-questions";
import {
  defaultApplabCreateDraft,
  hasPassedNameStep,
  nextStepId,
  prevStepId,
  readApplabCreateDraft,
  writeApplabCreateDraft,
} from "@/lib/trackapp-applab-create/storage";
import { useApplabDraftSync } from "@/lib/trackapp-applab-create/use-applab-draft-sync";
import { applabBelowMotion, applabMotionTransition } from "@/lib/trackapp-applab-create/step-motion";
import type { ApplabCreateDraft, ApplabCreateStepId } from "@/lib/trackapp-applab-create/types";
import type { AppShowcaseVideoItemEnriched } from "@/lib/showcase-app-videos-types";
import { cn } from "@/lib/utils";

type Props = Readonly<{
  initialName?: string;
  initialConcept?: string;
  showcaseVideos?: AppShowcaseVideoItemEnriched[];
}>;

const STEP_HERO: Record<ApplabCreateStepId, { title: string; sub: string }> = {
  name: { title: "", sub: "" },
  concept: { title: "", sub: "" },
  audience: { title: "", sub: "" },
  problem: { title: "", sub: "" },
  v1_features: { title: "", sub: "" },
  pricing: { title: "", sub: "" },
  synthesis: { title: "", sub: "" },
};

function StudioBackButton({
  onBack,
  disabled,
  className,
}: Readonly<{ onBack: () => void; disabled?: boolean; className?: string }>) {
  return (
    <button type="button" className={cn("ta-applab-studio__back-btn", className)} onClick={onBack} disabled={disabled}>
      <span className="ta-applab-studio__back-btn-icon" aria-hidden>
        ←
      </span>
      Retour
    </button>
  );
}

function HomeHub({ showcaseVideos }: Readonly<{ showcaseVideos: AppShowcaseVideoItemEnriched[] }>) {
  return <TrackappApplabStudioGallery videos={showcaseVideos} />;
}

export function TrackappApplabCreateFlow({
  initialName = "",
  initialConcept = "",
  showcaseVideos = [],
}: Props) {
  const [draft, setDraft] = useState<ApplabCreateDraft>(() =>
    defaultApplabCreateDraft({ name: initialName, concept: initialConcept }),
  );
  const [hydrated, setHydrated] = useState(false);
  const [intelBusy, setIntelBusy] = useState(false);
  const [answerDraft, setAnswerDraft] = useState("");
  const [helpOpen, setHelpOpen] = useState(false);
  const [synthesisPhase, setSynthesisPhase] = useState<"analyzing" | "reveal">("analyzing");
  const reduceMotion = useReducedMotion();
  const stageRef = useRef<HTMLDivElement>(null);
  const belowExitTransition = applabMotionTransition(reduceMotion, 0.64);

  const currentStep = draft.currentStep;
  const hero = STEP_HERO[currentStep];
  const answers = useMemo(() => migrateCreateAnswers(draft.clarifyingAnswers), [draft.clarifyingAnswers]);
  const questionCtx = useMemo(
    () => ({ name: draft.name, concept: draft.concept, answers }),
    [answers, draft.concept, draft.name],
  );
  const questionField = isAnswerStep(currentStep) ? getQuestionField(currentStep, questionCtx) : null;
  const heroRotatorApps = useMemo(() => listHeroRotatorApps(), []);

  useEffect(() => {
    const saved = readApplabCreateDraft();
    if (saved) setDraft(saved);
    else if (initialName || initialConcept) {
      setDraft((d) => ({ ...d, name: initialName || d.name, concept: initialConcept || d.concept }));
    }
    setHydrated(true);
  }, [initialName, initialConcept]);

  const persist = useCallback((next: ApplabCreateDraft) => {
    setDraft(next);
    writeApplabCreateDraft(next);
  }, []);

  const { pushDraft, pushPromptVersion } = useApplabDraftSync(draft, (remote) => {
    setDraft(remote);
    writeApplabCreateDraft(remote);
  });

  useEffect(() => {
    pushDraft(draft);
  }, [draft, pushDraft]);

  useEffect(() => {
    if (!isAnswerStep(currentStep)) return;
    const saved = answers[currentStep] ?? "";
    setAnswerDraft(saved);
    setHelpOpen(false);
  }, [answers, currentStep]);

  const showBackNav = hasPassedNameStep(currentStep) || draft.setupComplete;
  const isInputStep = currentStep !== "synthesis";
  const isGlassExpanded = currentStep !== "name";
  const isGlassArea = currentStep === "concept" || isAnswerStep(currentStep);

  const continueLabel = "Continuer";

  const canContinue = useMemo(() => {
    if (intelBusy) return false;
    if (isAnswerStep(currentStep)) {
      return canSubmitInputStep(currentStep, {
        ...draft,
        clarifyingAnswers: { ...answers, [currentStep]: answerDraft },
      });
    }
    return canSubmitInputStep(currentStep, draft);
  }, [answerDraft, answers, currentStep, draft, intelBusy]);

  const goNext = useCallback(() => {
    if (currentStep === "concept") {
      persist({
        ...draft,
        currentStep: "audience",
        clarifyingAnswers: {},
        clarifyingQuestions: createQuestionsForApi({ name: draft.name, concept: draft.concept, answers: {} }),
        understanding: null,
        assessment: null,
        referenceAppId: null,
        referenceAppName: null,
        referenceAppArtworkUrl: null,
        promptVersions: [],
        activePromptVersionId: null,
      });
      return;
    }

    if (isAnswerStep(currentStep)) {
      if (!canSubmitInputStep(currentStep, { ...draft, clarifyingAnswers: { ...answers, [currentStep]: answerDraft } }))
        return;
      const nextAnswers = { ...answers, [currentStep]: answerDraft.trim() };
      const nextStep = nextStepId(currentStep);
      if (!nextStep) return;

      if (nextStep === "synthesis") {
        persist({
          ...draft,
          clarifyingAnswers: nextAnswers,
          clarifyingQuestions: createQuestionsForApi({ name: draft.name, concept: draft.concept, answers: nextAnswers }),
          currentStep: "synthesis",
          understanding: null,
          assessment: null,
          referenceAppId: null,
          referenceAppName: null,
          referenceAppArtworkUrl: null,
          promptVersions: [],
          activePromptVersionId: null,
        });
        setSynthesisPhase("analyzing");
        return;
      }

      persist({
        ...draft,
        clarifyingAnswers: nextAnswers,
        clarifyingQuestions: createQuestionsForApi({ name: draft.name, concept: draft.concept, answers: nextAnswers }),
        currentStep: nextStep,
      });
      setAnswerDraft("");
      return;
    }

    const next = nextStepId(currentStep);
    if (!next) return;
    persist({ ...draft, currentStep: next });
  }, [answerDraft, answers, currentStep, draft, persist]);

  const goBack = useCallback(() => {
    const prev = prevStepId(currentStep);
    if (!prev) return;
    persist({ ...draft, currentStep: prev });
  }, [currentStep, draft, persist]);

  useEffect(() => {
    const stage = stageRef.current;
    if (!stage || reduceMotion) return;
    stage.scrollTo({ top: 0, behavior: "smooth" });
  }, [currentStep, reduceMotion]);

  useEffect(() => {
    if (currentStep !== "synthesis" || synthesisPhase !== "reveal" || draft.setupComplete) return;
    persist({ ...draft, setupComplete: true });
  }, [currentStep, draft, persist, synthesisPhase]);

  if (!hydrated) return null;

  return (
    <div className="ta-applab-studio__frame">
      <LayoutGroup id="applab-create-flow">
        <motion.div ref={stageRef} layout className="ta-applab-studio__stage">
          {showBackNav ? (
            <div className="ta-applab-studio__back-row">
              <StudioBackButton
                onBack={goBack}
                disabled={intelBusy || (currentStep === "synthesis" && synthesisPhase === "analyzing")}
              />
            </div>
          ) : null}

          <div className="ta-applab-studio__hero ta-applab-studio__hero--animated">
            {currentStep !== "synthesis" ? (
              <TrackerHeroSocialProofBadge className="ta-applab-studio__social-proof" />
            ) : null}
            <TrackappApplabHeroHeading
              step={currentStep}
              appName={draft.name}
              hero={hero}
              synthesisPhase={currentStep === "synthesis" ? synthesisPhase : null}
              reduceMotion={reduceMotion}
              heroRotatorApps={heroRotatorApps}
            />
          </div>

          {isInputStep ? (
            <TrackappApplabGlassComposer
              expanded={isGlassExpanded}
              area={isGlassArea}
              fieldKey={currentStep}
              canContinue={canContinue}
              onContinue={goNext}
              continueLabel={continueLabel}
              busy={intelBusy}
              reduceMotion={reduceMotion}
            >
              {currentStep === "name" ? (
                <input
                  id="applab-name"
                  className="ta-applab-glass-panel__field"
                  value={draft.name}
                  onChange={(e) => persist({ ...draft, name: e.target.value })}
                  placeholder="Le nom de votre app..."
                  maxLength={80}
                  autoFocus
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey && canContinue) {
                      e.preventDefault();
                      goNext();
                    }
                  }}
                />
              ) : null}

              {currentStep === "concept" ? (
                <textarea
                  id="applab-concept"
                  className="ta-applab-glass-panel__field ta-applab-glass-panel__field--area"
                  value={draft.concept}
                  onChange={(e) => persist({ ...draft, concept: e.target.value })}
                  placeholder="Ex. App d'apprentissage de l'arabe pour francophones — leçons courtes, quiz, streaks."
                  maxLength={280}
                  rows={3}
                  autoFocus
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && canContinue) {
                      e.preventDefault();
                      goNext();
                    }
                  }}
                />
              ) : null}

              {questionField ? (
                <TrackappApplabQuestionField
                  field={questionField}
                  draft={answerDraft}
                  onDraftChange={setAnswerDraft}
                  helpOpen={helpOpen}
                  onHelpToggle={() => setHelpOpen((v) => !v)}
                  onSubmit={goNext}
                  canSubmit={canContinue}
                />
              ) : null}
            </TrackappApplabGlassComposer>
          ) : (
            <TrackappApplabSynthesisStep
              draft={draft}
              onDraftChange={persist}
              onBusyChange={setIntelBusy}
              onPhaseChange={setSynthesisPhase}
              onSyncPromptVersion={(version) => void pushPromptVersion(version)}
            />
          )}

          <AnimatePresence initial={false}>
            {currentStep === "name" ? (
              <motion.div
                key="applab-below"
                layout
                className="ta-applab-studio__below"
                initial={false}
                animate={{ opacity: 1, y: 0 }}
                exit={applabBelowMotion.exit}
                transition={belowExitTransition}
              >
                <HomeHub showcaseVideos={showcaseVideos} />
              </motion.div>
            ) : null}
          </AnimatePresence>
        </motion.div>
      </LayoutGroup>
    </div>
  );
}
