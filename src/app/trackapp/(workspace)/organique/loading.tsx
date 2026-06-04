export default function TrackappOrganiqueLoading() {
  return (
    <div className="relative z-[1] dashboard-main pb-16" aria-busy="true" aria-label="Chargement Organique">
      <div className="mb-8 space-y-3">
        <div className="h-3 w-20 animate-pulse rounded bg-slate-200" />
        <div className="h-10 w-40 animate-pulse rounded-xl bg-slate-100" />
        <div className="h-4 w-full max-w-xl animate-pulse rounded bg-slate-100" />
      </div>
      <div className="mb-10 h-36 animate-pulse rounded-2xl bg-slate-100" />
      <div className="grid gap-5 lg:grid-cols-3">
        {Array.from({ length: 3 }, (_, i) => (
          <div key={i} className="h-52 animate-pulse rounded-2xl bg-slate-100" />
        ))}
      </div>
    </div>
  );
}
