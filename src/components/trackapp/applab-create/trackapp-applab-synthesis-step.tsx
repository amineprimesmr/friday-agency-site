"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { TrackappApplabMvpPromptExport } from "@/components/trackapp/applab-create/trackapp-applab-mvp-prompt-export";
import type { ReferenceSuggestion } from "@/components/trackapp/applab-create/trackapp-applab-reference-suggestions";
import {
  appendPromptVersion,
} from "@/lib/trackapp-applab-create/storage";
import type { ApplabCreateDraft } from "@/lib/trackapp-applab-create/types";
import {
  buildUnderstandingFromCreateAnswers,
  createQuestionsForApi,
  migrateCreateAnswers,
} from "@/lib/trackapp-applab-create/create-questions";
import {
  TRACKAPP_APPLAB_AUTO_DECISIONS,
  TRACKAPP_APPLAB_DEFAULT_CONSTRAINTS,
} from "@/lib/trackapp-applab-create/trackapp-auto-decisions";
import { trackappAccueilAppHref } from "@/lib/trackapp-apptracker-paths";
import type {
  ApplabConceptAssessment,
  ApplabConceptUnderstanding,
} from "@/lib/trackapp-applab-project/types";
import { cn } from "@/lib/utils";

type PipelineId = "answers" | "understanding" | "assessment" | "competitors" | "prompt";

const PIPELINE_STEPS: readonly { id: PipelineId; label: string }[] = [
  { id: "answers", label: "Lecture de vos réponses" },
  { id: "understanding", label: "Structuration du concept" },
  { id: "assessment", label: "Synthèse produit & monétisation" },
  { id: "competitors", label: "Recherche des concurrents App Store" },
  { id: "prompt", label: "Génération du prompt Xcode" },
];

type Props = Readonly<{
  draft: ApplabCreateDraft;
  onDraftChange: (next: ApplabCreateDraft) => void;
  onBusyChange?: (busy: boolean) => void;
  onReadyChange?: (ready: boolean) => void;
  onPhaseChange?: (phase: "analyzing" | "reveal") => void;
  onSyncPromptVersion?: (version: ApplabCreateDraft["promptVersions"][number]) => void;
}>;

export function TrackappApplabSynthesisStep({
  draft,
  onDraftChange,
  onBusyChange,
  onReadyChange,
  onPhaseChange,
  onSyncPromptVersion,
}: Props) {
  const startedRef = useRef(false);
  const [phase, setPhase] = useState<"analyzing" | "reveal">("analyzing");
  const [activePipeline, setActivePipeline] = useState(0);
  const [donePipeline, setDonePipeline] = useState<readonly PipelineId[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [competitors, setCompetitors] = useState<ReferenceSuggestion[]>([]);

  const answers = useMemo(() => migrateCreateAnswers(draft.clarifyingAnswers), [draft.clarifyingAnswers]);
  const ctx = useMemo(() => ({ name: draft.name, concept: draft.concept, answers }), [answers, draft.concept, draft.name]);
  const questions = useMemo(() => createQuestionsForApi(ctx), [ctx]);

  const markDone = useCallback((id: PipelineId) => {
    setDonePipeline((prev) => (prev.includes(id) ? prev : [...prev, id]));
    const idx = PIPELINE_STEPS.findIndex((s) => s.id === id);
    if (idx >= 0) setActivePipeline(Math.min(idx + 1, PIPELINE_STEPS.length - 1));
  }, []);

  const runPipeline = useCallback(async () => {
    onBusyChange?.(true);
    setError(null);
    setPhase("analyzing");
    setDonePipeline([]);
    setActivePipeline(0);

    try {
      await new Promise((r) => setTimeout(r, 420));
      markDone("answers");

      const understanding: ApplabConceptUnderstanding = buildUnderstandingFromCreateAnswers(
        draft.name,
        draft.concept,
        answers,
      );
      await new Promise((r) => setTimeout(r, 380));
      markDone("understanding");

      let assessment: ApplabConceptAssessment | null = draft.assessment;
      if (!assessment) {
        const assessRes = await fetch("/api/trackapp/applab/concept", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            action: "assess",
            name: draft.name,
            concept: draft.concept,
            understanding,
            answers,
            questions,
          }),
          cache: "no-store",
        });
        const assessData = (await assessRes.json()) as {
          assessment?: ApplabConceptAssessment;
          error?: string;
          failure?: string;
          failureDetail?: string;
        };
        if (!assessRes.ok || !assessData.assessment) {
          const detail =
            assessData.failure === "openai_missing_key"
              ? "Ajoutez OPENAI_API_KEY dans .env.local puis redémarrez le serveur."
              : assessData.failureDetail?.trim();
          throw new Error(detail || assessData.error || "Synthèse indisponible.");
        }
        assessment = assessData.assessment;
      }
      markDone("assessment");

      let nextDraft: ApplabCreateDraft = {
        ...draft,
        understanding,
        assessment,
        clarifyingQuestions: questions,
        constraints: {
          mustHave: TRACKAPP_APPLAB_DEFAULT_CONSTRAINTS.mustHave,
          mustNot: TRACKAPP_APPLAB_DEFAULT_CONSTRAINTS.mustNot,
        },
      };

      const refRes = await fetch("/api/trackapp/applab/reference-suggestions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          concept: draft.concept,
          name: draft.name,
          country: draft.referenceCountry || "fr",
          understanding,
          assessment,
        }),
        cache: "no-store",
      });
      const refData = (await refRes.json()) as { apps?: ReferenceSuggestion[] };
      const apps = Array.isArray(refData.apps) ? refData.apps : [];
      setCompetitors(apps);

      const top = apps[0];
      if (top && !nextDraft.referenceAppId) {
        nextDraft = {
          ...nextDraft,
          referenceAppId: top.id,
          referenceAppName: top.name,
          referenceAppArtworkUrl: top.artworkUrl,
        };
      }
      markDone("competitors");
      onDraftChange(nextDraft);

      await new Promise((r) => setTimeout(r, 320));
      markDone("prompt");

      setPhase("reveal");
      onPhaseChange?.("reveal");
      onReadyChange?.(false);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Analyse impossible pour l'instant.");
    } finally {
      onBusyChange?.(false);
    }
  }, [answers, draft, markDone, onBusyChange, onDraftChange, onReadyChange, questions]);

  useEffect(() => {
    if (startedRef.current) return;
    startedRef.current = true;
    void runPipeline();
  }, [runPipeline]);

  useEffect(() => {
    const ready = Boolean(draft.activePromptVersionId && draft.promptVersions.length > 0);
    onReadyChange?.(ready);
  }, [draft.activePromptVersionId, draft.promptVersions.length, onReadyChange]);

  if (phase === "analyzing" && !error) {
    return (
      <div className="ta-applab-synthesis ta-applab-synthesis--analyzing" aria-busy="true">
        <div className="ta-applab-synthesis__scan">
          <span className="ta-applab-synthesis__scan-ring" aria-hidden />
          <span className="ta-applab-synthesis__scan-core" aria-hidden>
            ✦
          </span>
        </div>
        <p className="ta-applab-synthesis__scan-title">Analyse AppLAB en cours</p>
        <p className="ta-applab-synthesis__scan-sub">
          On structure votre projet, trouve les concurrents et prépare le prompt Xcode.
        </p>
        <ol className="ta-applab-synthesis__pipeline">
          {PIPELINE_STEPS.map((step, i) => {
            const done = donePipeline.includes(step.id);
            const active = i === activePipeline && !done;
            return (
              <motion.li
                key={step.id}
                className={cn(
                  "ta-applab-synthesis__pipeline-item",
                  done && "is-done",
                  active && "is-active",
                )}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.06, duration: 0.35 }}
              >
                <span className="ta-applab-synthesis__pipeline-dot" aria-hidden />
                <span>{step.label}</span>
              </motion.li>
            );
          })}
        </ol>
      </div>
    );
  }

  if (error) {
    return (
      <div className="ta-applab-synthesis ta-applab-synthesis--error">
        <p className="ta-applab-synthesis__error">{error}</p>
        <button type="button" className="ta-applab-studio__btn ta-applab-studio__btn--primary" onClick={() => void runPipeline()}>
          Relancer l&apos;analyse
        </button>
      </div>
    );
  }

  return (
    <div className="ta-applab-synthesis ta-applab-synthesis--reveal">
      {draft.assessment ? (
        <section className="ta-applab-synthesis__section">
          <h2 className="ta-applab-synthesis__section-title">Synthèse produit</h2>
          <p className="ta-applab-synthesis__headline">{draft.assessment.headline}</p>
          <p className="ta-applab-synthesis__summary">{draft.assessment.summary}</p>
          <div className="ta-applab-assessment__grid">
            <article className="ta-applab-assessment__block">
              <h3>Comment ça marche</h3>
              <p>{draft.assessment.how_it_works}</p>
            </article>
            <article className="ta-applab-assessment__block">
              <h3>Cible</h3>
              <p>{draft.assessment.target_user}</p>
            </article>
            <article className="ta-applab-assessment__block">
              <h3>Monétisation</h3>
              <p>{draft.assessment.monetization}</p>
            </article>
            <article className="ta-applab-assessment__block">
              <h3>Différenciation</h3>
              <p>{draft.assessment.differentiation}</p>
            </article>
          </div>
          {draft.assessment.mvp_features.length > 0 ? (
            <article className="ta-applab-assessment__block ta-applab-assessment__block--full">
              <h3>Fonctionnalités v1.0</h3>
              <ul>
                {draft.assessment.mvp_features.map((f) => (
                  <li key={f}>{f}</li>
                ))}
              </ul>
            </article>
          ) : null}
        </section>
      ) : null}

      <section className="ta-applab-synthesis__section">
        <h2 className="ta-applab-synthesis__section-title">Décisions Trackapp</h2>
        <p className="ta-applab-synthesis__section-desc">
          Langue, techno, onboarding, paywall, login — choisis par Trackapp pour accélérer votre build.
        </p>
        <ul className="ta-applab-synthesis__decisions">
          {TRACKAPP_APPLAB_AUTO_DECISIONS.map((d) => (
            <li key={d.id} className="ta-applab-synthesis__decision">
              <span className="ta-applab-synthesis__decision-label">{d.label}</span>
              <span className="ta-applab-synthesis__decision-value">{d.value}</span>
            </li>
          ))}
        </ul>
      </section>

      {competitors.length > 0 ? (
        <section className="ta-applab-synthesis__section">
          <h2 className="ta-applab-synthesis__section-title">Concurrents trouvés</h2>
          <ul className="ta-applab-create-suggestions__list ta-applab-synthesis__competitors">
            {competitors.slice(0, 5).map((app) => (
              <li key={app.id}>
                <Link
                  href={trackappAccueilAppHref(app.id, draft.referenceCountry || "fr")}
                  className="ta-applab-create-suggestion ta-applab-synthesis__competitor-link"
                >
                  <span className="ta-applab-create-suggestion__rank">#{app.rank}</span>
                  {app.artworkUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={app.artworkUrl} alt="" className="ta-applab-create-suggestion__art" width={48} height={48} />
                  ) : (
                    <span className="ta-applab-create-suggestion__art ta-applab-create-suggestion__art--empty" aria-hidden />
                  )}
                  <span className="ta-applab-create-suggestion__body">
                    <strong>{app.name}</strong>
                    <span>{app.relevanceReason ?? app.category ?? app.artistName}</span>
                  </span>
                  <span className="ta-applab-create-suggestion__revenue">{app.revenueDisplay}</span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      {draft.understanding && draft.assessment ? (
        <section className="ta-applab-synthesis__section ta-applab-synthesis__section--prompt">
          <TrackappApplabMvpPromptExport
            name={draft.name}
            concept={draft.concept}
            understanding={draft.understanding}
            assessment={draft.assessment}
            answers={answers}
            questions={questions}
            constraints={{
              mustHave: TRACKAPP_APPLAB_DEFAULT_CONSTRAINTS.mustHave,
              mustNot: TRACKAPP_APPLAB_DEFAULT_CONSTRAINTS.mustNot,
            }}
            referenceAppId={draft.referenceAppId}
            referenceCountry={draft.referenceCountry}
            promptVersions={draft.promptVersions}
            activeVersionId={draft.activePromptVersionId}
            onVersionAdded={(version) => onDraftChange(appendPromptVersion(draft, version))}
            onActiveVersionChange={(id) => onDraftChange({ ...draft, activePromptVersionId: id })}
            onSyncVersion={onSyncPromptVersion}
            onLoadingChange={onBusyChange}
          />
        </section>
      ) : null}
    </div>
  );
}
