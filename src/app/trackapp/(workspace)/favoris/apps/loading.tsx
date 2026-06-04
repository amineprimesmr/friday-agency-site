export default function TrackappFavoriteAppsLoading() {
  return (
    <div className="relative z-[1] dashboard-main pb-16" aria-busy="true" aria-label="Chargement des favoris">
      <div className="mb-8 space-y-3">
        <div className="h-3 w-20 animate-pulse rounded bg-slate-200" />
        <div className="h-10 w-40 animate-pulse rounded-xl bg-slate-100" />
        <div className="h-4 w-96 max-w-full animate-pulse rounded bg-slate-50" />
      </div>
      <div className="grid gap-3">
        {Array.from({ length: 5 }, (_, i) => (
          <div
            key={i}
            className="h-24 animate-pulse rounded-2xl border border-[var(--dash-border)] bg-white shadow-[var(--dash-shadow)]"
            style={{ animationDelay: `${i * 70}ms` }}
          />
        ))}
      </div>
    </div>
  );
}
