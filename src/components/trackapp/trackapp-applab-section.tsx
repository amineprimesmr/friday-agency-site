"use client";

import { useCallback, useEffect, useState } from "react";

import { TrackappCloneAppActions } from "@/components/trackapp/trackapp-clone-app-actions";
import type { AppLabReport } from "@/lib/trackapp-applab/types";
import type { TrackappClonePromptBundle } from "@/lib/trackapp-clone-prompt/types";
import { cn } from "@/lib/utils";

import "@/styles/trackapp-applab-embed.css";

function verdictLabel(v: AppLabReport["meta"]["go_verdict"]): string {
  if (v === "launch") return "Go";
  if (v === "avoid") return "No-Go";
  return "Pivot";
}

function verdictClass(v: AppLabReport["meta"]["go_verdict"]): string {
  if (v === "launch") return "trackapp-applab-embed__verdict--launch";
  if (v === "avoid") return "trackapp-applab-embed__verdict--avoid";
  return "trackapp-applab-embed__verdict--pivot";
}

function ReportBody({ report }: Readonly<{ report: AppLabReport }>) {
  const { meta, insight, opportunities, action } = report;

  return (
    <>
      <header className="trackapp-applab-embed__hero">
        <div className="trackapp-applab-embed__hero-main">
          <p className="trackapp-applab-embed__kicker">AppLAB · Intelligence produit</p>
          <p className="trackapp-applab-embed__summary">{meta.executive_summary}</p>
          <div className="trackapp-applab-embed__badges">
            <span className={cn("trackapp-applab-embed__verdict", verdictClass(meta.go_verdict))}>
              {verdictLabel(meta.go_verdict)}
            </span>
            <span className="trackapp-applab-embed__confidence">
              Confiance {meta.confidence === "high" ? "élevée" : meta.confidence === "low" ? "faible" : "moyenne"}
            </span>
          </div>
        </div>
        <div className="trackapp-applab-embed__score" aria-label={`Score opportunité ${meta.opportunity_score}`}>
          <span className="trackapp-applab-embed__score-value">{meta.opportunity_score}</span>
          <span className="trackapp-applab-embed__score-label">Score</span>
        </div>
      </header>

      <div className="trackapp-applab-embed__grid">
        <article className="trackapp-applab-embed__card">
          <h3 className="trackapp-applab-embed__card-title">Pourquoi ça marche</h3>
          <p className="trackapp-applab-embed__headline">{insight.headline}</p>
          {insight.why_it_works ? <p className="trackapp-applab-embed__text">{insight.why_it_works}</p> : null}
          {insight.monetization_hook ? (
            <p className="trackapp-applab-embed__hook">{insight.monetization_hook}</p>
          ) : null}
          {insight.bullets.length > 0 ? (
            <ul className="trackapp-applab-embed__list">
              {insight.bullets.map((b) => (
                <li key={b}>{b}</li>
              ))}
            </ul>
          ) : null}
        </article>

        <article className="trackapp-applab-embed__card">
          <h3 className="trackapp-applab-embed__card-title">Opportunités</h3>
          {opportunities.angle ? <p className="trackapp-applab-embed__text">{opportunities.angle}</p> : null}
          <div className="trackapp-applab-embed__formats">
            {opportunities.formats.map((f) => (
              <div key={f.name} className="trackapp-applab-embed__format">
                <div className="trackapp-applab-embed__format-head">
                  <strong>{f.name}</strong>
                  <span className="trackapp-applab-embed__format-score">{f.opportunity_score}</span>
                </div>
                <p>{f.description}</p>
                <div className="trackapp-applab-embed__format-meta">
                  <span>{f.weeks_to_mvp} sem.</span>
                  <span>{f.revenue_month_6}</span>
                </div>
              </div>
            ))}
          </div>
        </article>

        <article className="trackapp-applab-embed__card">
          <h3 className="trackapp-applab-embed__card-title">Plan d&apos;action</h3>
          {action.verdict ? <p className="trackapp-applab-embed__text">{action.verdict}</p> : null}
          <dl className="trackapp-applab-embed__facts">
            <div>
              <dt>Stack</dt>
              <dd>{action.stack}</dd>
            </div>
            <div>
              <dt>MVP</dt>
              <dd>{action.mvp_timeline}</dd>
            </div>
            <div>
              <dt>Revenu M+6</dt>
              <dd>{action.revenue_month_6}</dd>
            </div>
          </dl>
          {action.this_week.length > 0 ? (
            <>
              <p className="trackapp-applab-embed__sub">Cette semaine</p>
              <ol className="trackapp-applab-embed__steps">
                {action.this_week.map((step) => (
                  <li key={step}>{step}</li>
                ))}
              </ol>
            </>
          ) : null}
          {action.main_risk ? (
            <p className="trackapp-applab-embed__risk">
              <span>Risque principal</span> {action.main_risk}
            </p>
          ) : null}
        </article>
      </div>
    </>
  );
}

export function TrackappApplabSection({
  appId,
  appName,
  country,
  artworkUrl,
  artistName,
  autoOpenExport = false,
}: Readonly<{
  appId: string;
  appName: string;
  country: string;
  artworkUrl?: string | null;
  artistName?: string;
  autoOpenExport?: boolean;
}>) {
  const [report, setReport] = useState<AppLabReport | null>(null);
  const [failure, setFailure] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [exportOpen, setExportOpen] = useState(autoOpenExport);
  const [cloneBundle, setCloneBundle] = useState<TrackappClonePromptBundle | null>(null);
  const [cloneLoading, setCloneLoading] = useState(false);

  const loadAnalysis = useCallback(
    async (refresh = false) => {
      if (refresh) setRefreshing(true);
      else setLoading(true);
      setFailure(null);

      try {
        const qs = new URLSearchParams({ id: appId, country });
        if (refresh) qs.set("refresh", "1");
        const res = await fetch(`/api/trackapp/applab/analyze?${qs}`, { cache: "no-store" });
        const data = (await res.json()) as {
          ok?: boolean;
          report?: AppLabReport;
          error?: string;
        };
        if (data.ok && data.report) {
          setReport(data.report);
        } else {
          setFailure(data.error ?? "Analyse indisponible");
        }
      } catch {
        setFailure("Erreur réseau");
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [appId, country],
  );

  useEffect(() => {
    void loadAnalysis(false);
  }, [loadAnalysis]);

  useEffect(() => {
    if (!exportOpen || cloneBundle || cloneLoading) return;
    setCloneLoading(true);
    fetch(`/api/trackapp/clone-prompt?appId=${encodeURIComponent(appId)}&country=${encodeURIComponent(country)}`)
      .then((r) => (r.ok ? r.json() : null))
      .then((bundle: TrackappClonePromptBundle | null) => {
        if (bundle) setCloneBundle(bundle);
      })
      .finally(() => setCloneLoading(false));
  }, [exportOpen, cloneBundle, cloneLoading, appId, country]);

  useEffect(() => {
    if (!autoOpenExport) return;
    const el = document.getElementById("trackapp-applab-export");
    el?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, [autoOpenExport, report]);

  return (
    <section id="trackapp-applab" className="trackapp-applab-embed" aria-labelledby="trackapp-applab-title">
      <div className="trackapp-applab-embed__toolbar">
        <div>
          <h2 id="trackapp-applab-title" className="trackapp-applab-embed__title">
            AppLAB — {appName}
          </h2>
          <p className="trackapp-applab-embed__lead">Analyse IA pour comprendre l&apos;opportunité et lancer votre app.</p>
        </div>
        <button
          type="button"
          className="trackapp-applab-embed__refresh"
          disabled={loading || refreshing}
          onClick={() => void loadAnalysis(true)}
        >
          {refreshing ? "Analyse…" : "Rafraîchir"}
        </button>
      </div>

      {loading && !report ? (
        <div className="trackapp-applab-embed__loading" aria-busy="true">
          <span className="trackapp-applab-embed__spinner" aria-hidden />
          <p>Trackapp AI analyse {appName}…</p>
        </div>
      ) : null}

      {failure && !report ? (
        <div className="trackapp-applab-embed__error" role="alert">
          {failure}
          <button type="button" onClick={() => void loadAnalysis(true)}>
            Réessayer
          </button>
        </div>
      ) : null}

      {report ? <ReportBody report={report} /> : null}

      <div id="trackapp-applab-export" className="trackapp-applab-embed__export">
        <button
          type="button"
          className="trackapp-applab-embed__export-toggle"
          aria-expanded={exportOpen}
          onClick={() => setExportOpen((v) => !v)}
        >
          Export technique IDE
          <span aria-hidden>{exportOpen ? "−" : "+"}</span>
        </button>
        {exportOpen ? (
          <div className="trackapp-applab-embed__export-body">
            {cloneLoading ? <p className="trackapp-applab-embed__text">Chargement du prompt…</p> : null}
            {cloneBundle ? (
              <TrackappCloneAppActions
                initialBundle={cloneBundle}
                appId={appId}
                country={country}
                initialStack="swiftui"
                initialAngle="inspire"
                artworkUrl={artworkUrl}
                artistName={artistName}
                compact
              />
            ) : null}
            {!cloneLoading && !cloneBundle ? (
              <p className="trackapp-applab-embed__text">Export indisponible pour cette app.</p>
            ) : null}
          </div>
        ) : null}
      </div>
    </section>
  );
}
