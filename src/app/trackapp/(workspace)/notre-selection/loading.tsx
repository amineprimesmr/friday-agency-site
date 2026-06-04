export default function TrackappNotreSelectionLoading() {
  return (
    <div className="relative z-[1] dashboard-main pb-16" aria-busy="true" aria-label="Chargement de la sélection">
      <div className="mb-8 space-y-3">
        <div className="h-3 w-28 animate-pulse rounded bg-slate-200" />
        <div className="h-10 w-56 animate-pulse rounded-xl bg-slate-100" />
        <div className="h-4 w-80 max-w-full animate-pulse rounded bg-slate-50" />
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        {Array.from({ length: 6 }, (_, i) => (
          <div
            key={i}
            className="h-44 animate-pulse rounded-[24px] border border-[var(--dash-border)] bg-white shadow-[var(--dash-shadow)]"
            style={{ animationDelay: `${i * 80}ms` }}
          />
        ))}
      </div>
    </div>
  );
}
