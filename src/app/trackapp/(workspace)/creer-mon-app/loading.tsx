export default function TrackappCreerMonAppLoading() {
  return (
    <div className="relative z-[1] dashboard-main pb-16" aria-busy="true" aria-label="Chargement formation">
      <div className="mb-8 space-y-3">
        <div className="h-3 w-20 animate-pulse rounded bg-slate-200" />
        <div className="h-10 w-44 animate-pulse rounded-xl bg-slate-100" />
      </div>
      <div className="h-96 animate-pulse rounded-[28px] border border-[var(--dash-border)] bg-white" />
    </div>
  );
}
