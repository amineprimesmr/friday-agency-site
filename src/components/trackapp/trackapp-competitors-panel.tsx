"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";

import { TrackerAppArtwork } from "@/components/tracker/tracker-app-artwork";

import { abortInFlightRequest, isAbortError } from "@/lib/abort-signal";
import type { CountryCode } from "@/lib/apple-charts";
import { trackappApptrackerAppHref } from "@/lib/trackapp-apptracker-paths";
import type { HydratedCompetitor, HydratedCompetitorReport } from "@/lib/trackapp-competitor-intelligence/types";
import { cn } from "@/lib/utils";

import "@/styles/trackapp-competitors.css";

type Props = Readonly<{
  appId: string;
  appName: string;
  country: CountryCode;
}>;

function CompetitorCard({
  competitor,
  country,
}: Readonly<{
  competitor: HydratedCompetitor;
  country: CountryCode;
}>) {
  const href = competitor.app_id
    ? trackappApptrackerAppHref(competitor.app_id, country)
    : competitor.app_store_url;

  return (
    <article className="trackapp-competitor-card">
      <div className="trackapp-competitor-card__head">
        <div className="trackapp-competitor-card__icon">
          <TrackerAppArtwork
            url={competitor.artwork_url}
            name={competitor.name}
            sizes="56px"
            letterClassName="text-lg font-bold text-slate-400"
          />
        </div>
        <div className="min-w-0 flex-1">
          <h3 className="trackapp-competitor-card__title">{competitor.name}</h3>
          {competitor.artist_name ? (
            <p className="trackapp-competitor-card__artist">{competitor.artist_name}</p>
          ) : null}
          <div className="trackapp-competitor-card__badges">
            <span className="trackapp-competitor-card__score">{competitor.similarity_score}/100</span>
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

      {competitor.app_store_unavailable ? (
        <p className="trackapp-competitor-card__unavailable" role="status">
          Fiche App Store indisponible
        </p>
      ) : null}

      {href ? (
        <div className="trackapp-competitor-card__actions">
          {competitor.app_id ? (
            <Link href={href} className="trackapp-competitor-card__btn trackapp-competitor-card__btn--primary">
              Voir
            </Link>
          ) : (
            <a
              href={href}
              target="_blank"
              rel="noreferrer"
              className="trackapp-competitor-card__btn trackapp-competitor-card__btn--primary"
            >
              Voir
            </a>
          )}
        </div>
      ) : null}
    </article>
  );
}

function CompetitorGroup({
  title,
  items,
  country,
}: Readonly<{
  title: string;
  items: HydratedCompetitor[];
  country: CountryCode;
}>) {
  if (items.length === 0) return null;
  return (
    <section className="trackapp-competitors__group">
      <h2 className="trackapp-competitors__group-title">{title}</h2>
      <div className="trackapp-competitors__grid">
        {items.map((c) => (
          <CompetitorCard key={`${c.name}-${c.type}`} competitor={c} country={country} />
        ))}
      </div>
    </section>
  );
}

export function TrackappCompetitorsPanel({ appId, appName, country }: Props) {
  const sectionRef = useRef<HTMLElement>(null);
  const [visible, setVisible] = useState(false);
  const [report, setReport] = useState<HydratedCompetitorReport | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [started, setStarted] = useState(false);

  useEffect(() => {
    const node = sectionRef.current;
    if (!node) return;

    if (!("IntersectionObserver" in window)) {
      setVisible(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { rootMargin: "120px 0px", threshold: 0.01 },
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, []);

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
    if (!visible || started) return;
    setStarted(true);
    return load(false);
  }, [load, started, visible]);

  const direct = report?.competitors.filter((c) => c.type === "direct" || c.type === "close") ?? [];
  const indirect =
    report?.competitors.filter((c) => c.type === "indirect" || c.type === "old" || c.type === "rising") ?? [];

  return (
    <section
      ref={sectionRef}
      className={cn("trackapp-competitors", loading && "trackapp-competitors--loading")}
    >
      <div className="trackapp-competitors__header">
        <div>
          <p className="trackapp-competitors__kicker">Marché</p>
          <h2 className="trackapp-competitors__title">Concurrents de {appName}</h2>
          <p className="trackapp-competitors__sub">
            Apps qui ciblent le même problème utilisateur — analyse sémantique.
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
        <p className="trackapp-competitors__loading">
          {visible ? "Analyse en cours (30–60 s)…" : "Analyse au scroll…"}
        </p>
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

          <CompetitorGroup title="Concurrents" items={direct} country={country} />
          <CompetitorGroup title="Pas concurrent direct" items={indirect} country={country} />
        </>
      ) : null}
    </section>
  );
}
