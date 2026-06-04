export default function TrackappCreerDepuisAppLoading() {
  return (
    <div className="relative z-[1] dashboard-main pb-16" aria-busy="true" aria-label="Chargement appLAB">
      <div className="mb-6 h-10 w-64 animate-pulse rounded-xl bg-slate-100" />
      <div className="space-y-4 rounded-[28px] border border-[var(--dash-border)] bg-white p-6 shadow-[var(--dash-shadow-lg)]">
        <div className="h-6 w-48 animate-pulse rounded bg-slate-200" />
        <div className="h-4 w-full animate-pulse rounded bg-slate-50" />
        <div className="h-4 w-5/6 animate-pulse rounded bg-slate-50" />
        <div className="mt-6 h-32 animate-pulse rounded-2xl bg-slate-100" />
      </div>
    </div>
  );
}
