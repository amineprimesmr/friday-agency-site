"use client";

import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";

import { abortInFlightRequest, isAbortError } from "@/lib/abort-signal";
import type { CountryCode } from "@/lib/apple-charts";
import { trackappCreerDepuisAppHref } from "@/lib/trackapp-app-clone-paths";
import { trackappApptrackerAppHref } from "@/lib/trackapp-apptracker-paths";
import type { HydratedCompetitor, HydratedCompetitorReport } from "@/lib/trackapp-competitor-intelligence/types";
import { cn } from "@/lib/utils";

import "@/styles/trackapp-competitors.css";

type Props = Readonly<{
  appId: string;
  appName: string;
  country: CountryCode;
}>;

const TYPE_LABELS: Record<string, string> = {
  direct: "Direct",
  close: "Proche",
  indirect: "Indirect",
  old: "Historique",
  rising: "En croissance",
};

function CompetitorCard({
  competitor,
  country,
  sourceAppId,
}: Readonly<{
  competitor: HydratedCompetitor;
  country: CountryCode;
  sourceAppId: string;
}>) {
  const internalHref = competitor.app_id
    ? trackappApptrackerAppHref(competitor.app_id, country)
    : null;

  return (
    <article className="trackapp-competitor-card">
      <div className="trackapp-competitor-card__head">
        <div className="trackapp-competitor-card__icon">
          {competitor.artwork_url ? (
            <Image src={competitor.artwork_url} alt="" fill sizes="56px" className="object-cover" />
          ) : (
            <span>{competitor.name.charAt(0)}</span>
          )}
        </div>
        <div className="min-w-0 flex-1">
          <h3 className="trackapp-competitor-card__title">{competitor.name}</h3>
          {competitor.artist_name ? (
            <p className="trackapp-competitor-card__artist">{competitor.artist_name}</p>
          ) : null}
          <div className="trackapp-competitor-card__badges">
            <span className="trackapp-competitor-card__score">{competitor.similarity_score}/100</span>
            <span className="trackapp-competitor-card__type">
              {TYPE_LABELS[competitor.type] ?? competitor.type}
            </span>
            <span className="trackapp-competitor-card__confidence">{competitor.confidence}</span>
          </div>
        </div>
      </div>

      <p className="trackapp-competitor-card__reason">{competitor.reason}</p>

      {competitor.trackapp_metrics ? (
        <div className="trackapp-competitor-card__metrics">
          <span>
            <strong>{competitor.trackapp_metrics.downloadsDisplay}</strong> tél./mois
          </span>
          <span>
            <strong>{competitor.trackapp_metrics.revenueDisplay}</strong> rev./mois
          </span>
        </div>
      ) : null}

      <div className="trackapp-competitor-card__actions">
        {internalHref ? (
          <Link href={internalHref} className="trackapp-competitor-card__btn trackapp-competitor-card__btn--primary">
            Analyser ce concurrent
          </Link>
        ) : competitor.app_store_url ? (
          <a
            href={competitor.app_store_url}
            target="_blank"
            rel="noreferrer"
            className="trackapp-competitor-card__btn trackapp-competitor-card__btn--primary"
          >
            Voir sur l&apos;App Store
          </a>
        ) : null}
        {competitor.app_id ? (
          <Link
            href={`${trackappApptrackerAppHref(sourceAppId, country)}&compare=${competitor.app_id}`}
            className="trackapp-competitor-card__btn"
          >
            Comparer
          </Link>
        ) : null}
        {competitor.app_id ? (
          <Link
            href={trackappCreerDepuisAppHref(competitor.app_id, country)}
            className="trackapp-competitor-card__btn"
          >
            Créer une app similaire
          </Link>
        ) : null}
        {competitor.app_store_url ? (
          <a
            href={competitor.app_store_url}
            target="_blank"
            rel="noreferrer"
            className="trackapp-competitor-card__btn"
          >
            App Store ↗
          </a>
        ) : null}
      </div>
    </article>
  );
}

function CompetitorGroup({
  title,
  items,
  country,
  sourceAppId,
}: Readonly<{
  title: string;
  items: HydratedCompetitor[];
  country: CountryCode;
  sourceAppId: string;
}>) {
  if (items.length === 0) return null;
  return (
    <section className="trackapp-competitors__group">
      <h2 className="trackapp-competitors__group-title">{title}</h2>
      <div className="trackapp-competitors__grid">
        {items.map((c) => (
          <CompetitorCard key={`${c.name}-${c.type}`} competitor={c} country={country} sourceAppId={sourceAppId} />
        ))}
      </div>
    </section>
  );
}

export function TrackappCompetitorsPanel({ appId, appName, country }: Props) {
  const [report, setReport] = useState<HydratedCompetitorReport | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(
    (refresh = false) => {
      const ac = new AbortController();
      setLoading(true);
      setError(null);
      void (async () => {
        try {
          const url = `/api/trackapp/competitors?appId=${encodeURIComponent(appId)}&country=${country}${
            refresh ? "&refresh=1" : ""
          }`;
          const res = await fetch(url, { signal: ac.signal });
          const data = (await res.json()) as {
            report?: HydratedCompetitorReport | null;
            error?: string | null;
            detail?: string | null;
          };
          if (ac.signal.aborted) return;
          if (!res.ok || !data.report) {
            setReport(null);
            if (data.error === "openai_unavailable") {
              setError("Analyse IA indisponible — ajoutez OPENAI_API_KEY sur Vercel.");
            } else if (data.detail) {
              setError(`Analyse impossible : ${data.detail}`);
            } else {
              setError("Impossible de générer l’analyse concurrentielle.");
            }
            return;
          }
          setReport(data.report);
        } catch (e) {
          if (isAbortError(e) || ac.signal.aborted) return;
          setError("Erreur réseau lors de l’analyse.");
        } finally {
          if (!ac.signal.aborted) setLoading(false);
        }
      })();
      return () => abortInFlightRequest(ac);
    },
    [appId, country],
  );

  useEffect(() => {
    return load(false);
  }, [load]);

  const direct = report?.competitors.filter((c) => c.type === "direct") ?? [];
  const close = report?.competitors.filter((c) => c.type === "close") ?? [];
  const indirect = report?.competitors.filter((c) => c.type === "indirect" || c.type === "old") ?? [];
  const rising = report?.competitors.filter((c) => c.type === "rising") ?? [];

  return (
    <section className={cn("trackapp-competitors", loading && "trackapp-competitors--loading")}>
      <div className="trackapp-competitors__header">
        <div>
          <p className="trackapp-competitors__kicker">Intelligence marché</p>
          <h2 className="trackapp-competitors__title">Concurrents de {appName}</h2>
          <p className="trackapp-competitors__sub">
            Analyse sémantique (problème utilisateur, pas seulement le nom) — OpenAI + recherche web.
          </p>
        </div>
        <button
          type="button"
          className="trackapp-competitors__refresh"
          disabled={loading}
          onClick={() => load(true)}
        >
          {loading ? "Analyse…" : "Relancer"}
        </button>
      </div>

      {loading && !report ? (
        <p className="trackapp-competitors__loading">Analyse en cours (30–60 s)…</p>
      ) : null}
      {error ? <p className="trackapp-competitors__error">{error}</p> : null}

      {report ? (
        <>
          <article className="trackapp-competitors__profile">
            <h3 className="trackapp-competitors__profile-title">Compréhension produit</h3>
            <dl className="trackapp-competitors__profile-grid">
              <div>
                <dt>Problème</dt>
                <dd>{report.source_app.core_problem || report.understanding.core_problem}</dd>
              </div>
              <div>
                <dt>Cible</dt>
                <dd>{report.source_app.target_user || report.understanding.target_user}</dd>
              </div>
              <div>
                <dt>Positionnement</dt>
                <dd>{report.source_app.positioning || report.understanding.positioning}</dd>
              </div>
              <div>
                <dt>Catégorie réelle</dt>
                <dd>{report.source_app.category || report.understanding.category}</dd>
              </div>
            </dl>
            {report.source_app.not_competitors.length > 0 ? (
              <p className="trackapp-competitors__not">
                <strong>Pas des concurrents :</strong> {report.source_app.not_competitors.join(", ")}
              </p>
            ) : null}
          </article>

          <CompetitorGroup title="Concurrents directs" items={direct} country={country} sourceAppId={appId} />
          <CompetitorGroup title="Concurrents proches" items={close} country={country} sourceAppId={appId} />
          <CompetitorGroup title="Indirects & historiques" items={indirect} country={country} sourceAppId={appId} />
          <CompetitorGroup title="Apps en croissance" items={rising} country={country} sourceAppId={appId} />
        </>
      ) : null}
    </section>
  );
}
