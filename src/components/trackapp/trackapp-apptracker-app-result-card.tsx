import Image from "next/image";
import Link from "next/link";

import { formatRatingCount, type CountryCode, type SearchResult } from "@/lib/apple-charts";
import type { TrackappAppDisplayMetrics } from "@/lib/trackapp-app-display-metrics";
import { trackappApptrackerAppHref } from "@/lib/trackapp-apptracker-paths";
import { cn } from "@/lib/utils";

function metricsLabels(metrics: TrackappAppDisplayMetrics): Readonly<{
  downloads: string;
  revenue: string;
} | null> {
  if (
    metrics.metricSource === "donnée indisponible" ||
    (metrics.downloadsDisplay === "—" && metrics.revenueDisplay === "—")
  ) {
    return null;
  }
  if (metrics.metricSource === "agrégé monde / mois") {
    return {
      downloads: "Téléchargements / mois",
      revenue: "Revenus / mois",
    };
  }
  return {
    downloads: "Téléchargements estimés / mois",
    revenue: "Revenus estimés / mois",
  };
}

export function TrackappApptrackerAppResultCard({
  app,
  country,
  metrics,
  className,
}: Readonly<{
  app: SearchResult;
  country: CountryCode;
  metrics: TrackappAppDisplayMetrics;
  className?: string;
}>) {
  const labels = metricsLabels(metrics);
  const rankBadge =
    metrics.chartRank !== null ? `#${String(metrics.chartRank)}` : null;

  return (
    <Link
      href={trackappApptrackerAppHref(app.id, country)}
      className={cn(
        "group flex w-full min-w-0 gap-4 rounded-[22px] border border-[var(--dash-border)] bg-white p-4 text-[var(--dash-text)] no-underline shadow-[var(--dash-shadow)] transition hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-[var(--dash-shadow-lg)]",
        className,
      )}
    >
      <span className="relative h-16 w-16 shrink-0 overflow-hidden rounded-2xl bg-slate-100 ring-1 ring-slate-200">
        {app.artworkUrl ? (
          <Image src={app.artworkUrl} alt="" fill className="object-cover" sizes="64px" />
        ) : (
          <span className="grid h-full w-full place-items-center text-xl font-black text-slate-400">
            {app.name.charAt(0)}
          </span>
        )}
      </span>
      <span className="min-w-0 flex-1">
        <span className="flex flex-wrap items-start justify-between gap-2">
          <span className="min-w-0">
            <span className="block truncate font-bold tracking-tight group-hover:text-slate-950">{app.name}</span>
            <span className="mt-0.5 block truncate text-[0.8rem] text-[var(--dash-muted-light)]">{app.artistName}</span>
          </span>
          {rankBadge ? (
            <span
              className="shrink-0 rounded-full bg-slate-100 px-2.5 py-1 text-[0.72rem] font-bold text-slate-600"
              title="Classement top 100 App Store (pays sélectionné)"
            >
              {rankBadge}
            </span>
          ) : null}
        </span>
        <span className="mt-3 flex flex-wrap gap-2 text-[0.75rem]">
          <span className="rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 font-semibold text-slate-600">
            {app.category || "App"}
          </span>
          {app.averageUserRating > 0 ? (
            <span className="rounded-full border border-amber-200 bg-amber-50 px-2.5 py-1 font-semibold text-amber-700">
              ★ {app.averageUserRating.toFixed(1)} · {formatRatingCount(app.userRatingCount)}
            </span>
          ) : null}
        </span>
        {labels ? (
          <>
            <span className="mt-4 grid gap-2 text-[0.78rem] text-slate-500 sm:grid-cols-2">
              <span>
                <strong className="block text-[0.95rem] text-slate-900">{metrics.downloadsDisplay}</strong>
                {labels.downloads}
              </span>
              <span>
                <strong className="block text-[0.95rem] text-slate-900">{metrics.revenueDisplay}</strong>
                {labels.revenue}
              </span>
            </span>
            <p className="mt-2 text-[0.68rem] text-slate-400">{metrics.metricSource}</p>
          </>
        ) : (
          <p className="mt-4 text-[0.78rem] text-slate-400">Métriques indisponibles — ouvrir la fiche pour plus de détails.</p>
        )}
      </span>
    </Link>
  );
}
