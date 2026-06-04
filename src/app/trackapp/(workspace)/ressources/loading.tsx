export default function TrackappRessourcesLoading() {
  return (
    <div className="relative z-[1] dashboard-main pb-16" aria-busy="true" aria-label="Chargement des ressources">
      <div className="mb-8 space-y-3">
        <div className="h-3 w-24 animate-pulse rounded bg-slate-200" />
        <div className="h-10 w-48 animate-pulse rounded-xl bg-slate-100" />
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }, (_, i) => (
          <div key={i} className="aspect-video animate-pulse rounded-2xl bg-slate-100" />
        ))}
      </div>
    </div>
  );
}
