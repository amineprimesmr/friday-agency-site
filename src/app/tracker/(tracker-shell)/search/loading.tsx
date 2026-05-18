export default function TrackerSearchLoading() {
  return (
    <div className="mx-auto max-w-5xl space-y-6 px-4 py-8 sm:px-6">
      <div className="tracker-skeleton-fade space-y-2">
        <div className="tracker-shimmer h-9 w-48 rounded-lg" />
        <div className="tracker-shimmer h-4 w-72 max-w-full rounded opacity-60" />
      </div>
      <div className="tracker-skeleton-rise space-y-3">
        <div className="tracker-shimmer h-12 w-full rounded-2xl" />
        <div className="flex gap-2">
          <div className="tracker-shimmer h-10 flex-1 rounded-xl opacity-80" />
          <div className="tracker-shimmer h-10 w-28 rounded-xl opacity-70" />
        </div>
      </div>
      <div className="space-y-3 pt-4">
        {[1, 2, 3, 4, 5].map((i) => (
          <div
            key={i}
            className="tracker-shimmer h-24 rounded-2xl"
            style={{ animationDelay: `${i * 70}ms` }}
          />
        ))}
      </div>
      <p className="text-center text-sm text-white/35">Recherche en cours…</p>
    </div>
  );
}
