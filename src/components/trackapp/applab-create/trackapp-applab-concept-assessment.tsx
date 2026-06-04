"use client";

import { useEffect, useState } from "react";

import type {
  ApplabClarifyingQuestion,
  ApplabConceptAnswers,
  ApplabConceptAssessment,
  ApplabConceptUnderstanding,
} from "@/lib/trackapp-applab-project/types";

type Props = Readonly<{
  name: string;
  concept: string;
  understanding: ApplabConceptUnderstanding;
  answers: ApplabConceptAnswers;
  questions: readonly ApplabClarifyingQuestion[];
  assessment: ApplabConceptAssessment | null;
  onAssessment: (assessment: ApplabConceptAssessment) => void;
  onLoadingChange?: (loading: boolean) => void;
}>;

export function TrackappApplabConceptAssessment({
  name,
  concept,
  understanding,
  answers,
  questions,
  assessment,
  onAssessment,
  onLoadingChange,
}: Props) {
  const [loading, setLoading] = useState(!assessment);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (assessment) return;

    const ac = new AbortController();
    setLoading(true);
    onLoadingChange?.(true);
    setError(null);

    void (async () => {
      try {
        const res = await fetch("/api/trackapp/applab/concept", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            action: "assess",
            name,
            concept,
            understanding,
            answers,
            questions,
          }),
          signal: ac.signal,
          cache: "no-store",
        });
        const data = (await res.json()) as {
          assessment?: ApplabConceptAssessment;
          error?: string;
          failureDetail?: string;
        };
        if (ac.signal.aborted) return;

        if (!res.ok || !data.assessment) {
          setError(data.failureDetail ?? data.error ?? "Synthèse indisponible.");
          return;
        }
        onAssessment(data.assessment);
      } catch (e) {
        if (ac.signal.aborted) return;
        setError("Connexion impossible — réessaie dans un instant.");
      } finally {
        if (!ac.signal.aborted) {
          setLoading(false);
          onLoadingChange?.(false);
        }
      }
    })();

    return () => ac.abort();
  }, [assessment, answers, concept, name, onAssessment, onLoadingChange, questions, understanding]);

  if (loading) {
    return (
      <div className="ta-applab-intel__loading" aria-busy="true">
        <span className="ta-applab-create-spinner" aria-hidden />
        <p>AppLAB rédige la synthèse de votre app (parcours, v1.0, différenciation)…</p>
      </div>
    );
  }

  if (error) {
    return <p className="ta-applab-intel__error">{error}</p>;
  }

  if (!assessment) return null;

  return (
    <article className="ta-applab-assessment ta-applab-assessment--glass">
      <p className="ta-applab-assessment__summary">{assessment.summary}</p>

      <div className="ta-applab-assessment__grid">
        <section className="ta-applab-assessment__block">
          <h3>Comment ça marche</h3>
          <p>{assessment.how_it_works}</p>
        </section>
        <section className="ta-applab-assessment__block">
          <h3>Cible</h3>
          <p>{assessment.target_user}</p>
        </section>
        <section className="ta-applab-assessment__block">
          <h3>Monétisation</h3>
          <p>{assessment.monetization}</p>
        </section>
        <section className="ta-applab-assessment__block">
          <h3>Différenciation</h3>
          <p>{assessment.differentiation}</p>
        </section>
      </div>

      {assessment.mvp_features.length > 0 ? (
        <section className="ta-applab-assessment__block ta-applab-assessment__block--full">
          <h3>Fonctionnalités v1.0 (App Store)</h3>
          <ul>
            {assessment.mvp_features.map((f) => (
              <li key={f}>{f}</li>
            ))}
          </ul>
        </section>
      ) : null}

      {assessment.risks.length > 0 ? (
        <section className="ta-applab-assessment__block ta-applab-assessment__block--full">
          <h3>Points de vigilance</h3>
          <ul className="ta-applab-assessment__risks">
            {assessment.risks.map((r) => (
              <li key={r}>{r}</li>
            ))}
          </ul>
        </section>
      ) : null}
    </article>
  );
}
