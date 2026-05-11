import type { ReactNode } from "react";

export type AppMetricCardsProps = {
  rankMain: string;
  rankSubtitle: string;
  showRankLive?: boolean;
  ratingsMain: string;
  ratingsSubtitle: string;
  ratingsFreshBadge?: string;
  downloadsMain: string;
  downloadsSubtitle: string;
  downloadsSourceLabel: string | null;
  downloadsSourceAccent?: boolean;
  revenueMain: string;
  revenueSubtitle: string;
  revenueSourceLabel: string | null;
  revenueSourceAccent?: boolean;
};

/**
 * Grille 2×2 métriques (mobile) — structure fixe comme la ref. produit : en-tête, valeur, pied, sans badges en absolute.
 */
export function AppMetricCards({
  rankMain,
  rankSubtitle,
  showRankLive,
  ratingsMain,
  ratingsSubtitle,
  ratingsFreshBadge,
  downloadsMain,
  downloadsSubtitle,
  downloadsSourceLabel,
  downloadsSourceAccent,
  revenueMain,
  revenueSubtitle,
  revenueSourceLabel,
  revenueSourceAccent,
}: AppMetricCardsProps) {
  return (
    <div className="grid grid-cols-2 gap-3 sm:gap-4 xl:grid-cols-4 xl:gap-4">
      <MetricShell>
        <MetricTopRow>
          <MetricKicker># Rang</MetricKicker>
          {showRankLive ? (
            <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-rose-500/15 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-rose-200/95 ring-1 ring-rose-400/25">
              <span className="size-1.5 animate-pulse rounded-full bg-rose-400" aria-hidden />
              Live
            </span>
          ) : null}
        </MetricTopRow>
        <p className="mt-3 text-2xl font-bold tabular-nums leading-none text-white sm:text-3xl">{rankMain}</p>
        <p className="mt-auto pt-3 text-[11px] leading-snug text-white/42">{rankSubtitle}</p>
      </MetricShell>

      <MetricShell>
        <MetricTopRow>
          <MetricKicker>
            <span className="text-amber-400/90">★</span> Notes
          </MetricKicker>
          {ratingsFreshBadge ? (
            <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-emerald-500/14 px-2 py-0.5 text-[10px] font-semibold tabular-nums text-emerald-200/95 ring-1 ring-emerald-400/22">
              {ratingsFreshBadge}
            </span>
          ) : null}
        </MetricTopRow>
        <p className="mt-3 text-2xl font-bold tabular-nums leading-none text-white sm:text-3xl">{ratingsMain}</p>
        <p className="mt-auto pt-3 text-[11px] leading-snug text-white/42">{ratingsSubtitle}</p>
      </MetricShell>

      <MetricShell>
        <MetricTopRow className={downloadsSourceLabel ? "items-start" : undefined}>
          <MetricKicker inlineIcon="↓">Téléch.</MetricKicker>
          <SourceBadge label={downloadsSourceLabel} emphasized={downloadsSourceAccent} />
        </MetricTopRow>
        <p className="mt-3 text-2xl font-bold tabular-nums leading-none text-white sm:text-3xl">{downloadsMain}</p>
        <p className="mt-auto pt-3 text-[11px] leading-snug text-white/42">{downloadsSubtitle}</p>
      </MetricShell>

      <MetricShell>
        <MetricTopRow className={revenueSourceLabel ? "items-start" : undefined}>
          <MetricKicker>$ Revenus</MetricKicker>
          <SourceBadge label={revenueSourceLabel} emphasized={revenueSourceAccent} />
        </MetricTopRow>
        <p className="mt-3 text-2xl font-bold tabular-nums leading-none text-white sm:text-3xl">{revenueMain}</p>
        <p className="mt-auto pt-3 text-[11px] leading-snug text-white/42">{revenueSubtitle}</p>
      </MetricShell>
    </div>
  );
}

function MetricShell({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-[148px] flex-col rounded-2xl border border-white/[0.08] bg-neutral-950/40 p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.06)] sm:min-h-[156px] sm:p-5">
      {children}
    </div>
  );
}

function MetricTopRow({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div className={`flex justify-between gap-2 gap-y-2 ${className ?? "items-start"}`}>
      {children}
    </div>
  );
}

function MetricKicker({ children, inlineIcon }: { children: ReactNode; inlineIcon?: string }) {
  return (
    <p className="min-w-0 leading-tight">
      <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/38">
        {inlineIcon ? <span className="mr-0.5">{inlineIcon}</span> : null}
        {children}
      </span>
    </p>
  );
}

function SourceBadge({ label, emphasized }: { label: string | null; emphasized?: boolean }) {
  if (!label) return null;
  return (
    <span
      className={`inline-flex max-w-[min(100%,11rem)] shrink-0 items-center rounded-full px-2 py-0.5 text-right text-[9px] font-medium leading-snug ring-1 ${
        emphasized
          ? "bg-amber-500/12 text-amber-100/95 ring-amber-400/22"
          : "bg-white/[0.06] text-white/45 ring-white/10"
      }`}
      title={label}
    >
      {label}
    </span>
  );
}
