"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import { trackappAccueilAppHref } from "@/lib/trackapp-apptracker-paths";
import type {
  ApplabConceptAssessment,
  ApplabConceptUnderstanding,
} from "@/lib/trackapp-applab-project/types";
import { cn } from "@/lib/utils";

export type ReferenceSuggestion = Readonly<{
  id: string;
  name: string;
  artistName: string;
  category: string;
  artworkUrl: string;
  revenueDisplay: string;
  relevanceScore: number | null;
  relevanceReason: string | null;
  rank: number;
}>;

type Props = Readonly<{
  concept: string;
  projectName: string;
  understanding: ApplabConceptUnderstanding | null;
  assessment: ApplabConceptAssessment | null;
  selectedId: string | null;
  selectedName: string | null;
  selectedArtworkUrl?: string | null;
  onSelect: (app: ReferenceSuggestion) => void;
  onClear: () => void;
}>;

export function TrackappApplabReferenceSuggestions({
  concept,
  projectName,
  understanding,
  assessment,
  selectedId,
  selectedName,
  selectedArtworkUrl,
  onSelect,
  onClear,
}: Props) {
  const [loading, setLoading] = useState(true);
  const [apps, setApps] = useState<ReferenceSuggestion[]>([]);
  const [queriesUsed, setQueriesUsed] = useState<string[]>([]);
  const [aiPowered, setAiPowered] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (concept.trim().length < 8) {
      setApps([]);
      setLoading(false);
      return;
    }

    const ac = new AbortController();
    setLoading(true);
    setError(null);

    void (async () => {
      try {
        const res = await fetch("/api/trackapp/applab/reference-suggestions", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            concept,
            name: projectName,
            country: "fr",
            understanding,
            assessment,
          }),
          signal: ac.signal,
          cache: "no-store",
        });
        const data = (await res.json()) as {
          apps?: ReferenceSuggestion[];
          queriesUsed?: string[];
          aiPowered?: boolean;
          error?: string;
        };
        if (ac.signal.aborted) return;
        setApps(Array.isArray(data.apps) ? data.apps : []);
        setQueriesUsed(Array.isArray(data.queriesUsed) ? data.queriesUsed : []);
        setAiPowered(Boolean(data.aiPowered));
        if (!data.apps?.length) {
          setError("Aucun concurrent précis trouvé — essaie AppTracker manuellement.");
        }
      } catch (e) {
        if (ac.signal.aborted) return;
        setError("Recherche indisponible pour l'instant.");
        setApps([]);
      } finally {
        if (!ac.signal.aborted) setLoading(false);
      }
    })();

    return () => ac.abort();
  }, [concept, projectName, understanding, assessment]);

  if (selectedId && selectedName) {
    return (
      <div className="ta-applab-create-ref-selected">
        <div className="ta-applab-create-ref-card ta-applab-create-ref-card--selected">
          {selectedArtworkUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={selectedArtworkUrl} alt="" className="ta-applab-create-suggestion__art" width={48} height={48} />
          ) : null}
          <div>
            <strong>{selectedName}</strong>
            <br />
            <span>App Store · id {selectedId}</span>
          </div>
          <div className="ta-applab-create-ref-selected__actions">
            <Link
              href={trackappAccueilAppHref(selectedId, "fr")}
              className="ta-applab-create-btn ta-applab-create-btn--ghost ta-applab-create-btn--sm"
            >
              Voir la fiche →
            </Link>
            <button type="button" className="ta-applab-create-btn ta-applab-create-btn--ghost ta-applab-create-btn--sm" onClick={onClear}>
              Changer
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="ta-applab-create-suggestions">
      {loading ? (
        <div className="ta-applab-create-suggestions__loading" aria-busy="true">
          <span className="ta-applab-create-spinner" aria-hidden />
          <p>
            {understanding ?
              "AppLAB cherche les concurrents directs dans votre niche, classés par revenus…"
            : "Trackapp analyse votre concept…"}
          </p>
        </div>
      ) : null}

      {!loading && queriesUsed.length > 0 ? (
        <p className="ta-applab-create-suggestions__meta">
          {aiPowered ? "Filtrage IA · niche précise · " : ""}
          Revenus estimés · recherche : {queriesUsed.slice(0, 3).join(", ")}
          {queriesUsed.length > 3 ? "…" : ""}
        </p>
      ) : null}

      {!loading && error && apps.length === 0 ? (
        <p className="ta-applab-create-suggestions__empty">{error}</p>
      ) : null}

      {!loading && apps.length > 0 ? (
        <ul className="ta-applab-create-suggestions__list">
          {apps.map((app) => (
            <li key={app.id}>
              <button
                type="button"
                className={cn(
                  "ta-applab-create-suggestion",
                  selectedId === app.id && "is-selected",
                )}
                onClick={() => onSelect(app)}
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
                  <span>
                    {app.relevanceReason ?
                      app.relevanceReason
                    : app.category || app.artistName}
                  </span>
                </span>
                <span className="ta-applab-create-suggestion__revenue-wrap">
                  {app.relevanceScore != null ? (
                    <span className="ta-applab-create-suggestion__match">{app.relevanceScore}% match</span>
                  ) : null}
                  <span className="ta-applab-create-suggestion__revenue">{app.revenueDisplay}</span>
                </span>
              </button>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}
