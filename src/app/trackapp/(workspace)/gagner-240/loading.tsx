export default function TrackappGagner240Loading() {
  return (
    <div className="relative z-[1] dashboard-main pb-16" aria-busy="true" aria-label="Chargement affiliation">
      <div className="mb-8 space-y-3">
        <div className="h-3 w-24 animate-pulse rounded bg-slate-200" />
        <div className="h-10 w-52 animate-pulse rounded-xl bg-slate-100" />
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 4 }, (_, i) => (
          <div key={i} className="h-28 animate-pulse rounded-2xl border border-[var(--dash-border)] bg-white" />
        ))}
      </div>
    </div>
  );
}
