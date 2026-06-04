export default function TrackappWorkspaceLoading() {
  return (
    <div className="relative z-[1] dashboard-main pb-16" aria-busy="true" aria-label="Chargement de la page">
      <div className="mb-6 space-y-3">
        <div className="h-3 w-24 animate-pulse rounded-full bg-slate-200" />
        <div className="h-10 w-72 max-w-full animate-pulse rounded-xl bg-slate-100" />
        <div className="h-4 w-96 max-w-full animate-pulse rounded bg-slate-50" />
      </div>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {Array.from({ length: 6 }, (_, i) => (
          <div
            key={i}
            className="h-28 animate-pulse rounded-[20px] border border-[var(--dash-border)] bg-white shadow-[var(--dash-shadow)]"
            style={{ animationDelay: `${i * 60}ms` }}
          />
        ))}
      </div>
    </div>
  );
}
