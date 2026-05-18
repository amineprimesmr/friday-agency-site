export default function DeveloperProfileLoading() {
  return (
    <div className="mx-auto max-w-5xl space-y-8 px-4 py-8 sm:px-6">
      <div className="tracker-skeleton-fade flex gap-2">
        <div className="tracker-shimmer h-3 w-24 rounded-full" />
        <div className="tracker-shimmer h-3 w-20 rounded-full opacity-70" />
        <div className="tracker-shimmer h-3 w-32 rounded-full opacity-50" />
      </div>

      <div className="tracker-skeleton-rise rounded-2xl border border-white/[0.07] bg-white/[0.025] p-6">
        <div className="flex flex-wrap items-center gap-5">
          <div className="tracker-shimmer size-20 shrink-0 rounded-[22px]" />
          <div className="min-w-0 flex-1 space-y-3">
            <div className="tracker-shimmer h-8 w-[min(100%,320px)] rounded-lg" />
            <div className="flex flex-wrap gap-2">
              <div className="tracker-shimmer h-7 w-24 rounded-full" />
              <div className="tracker-shimmer h-7 w-28 rounded-full opacity-80" />
              <div className="tracker-shimmer h-7 w-32 rounded-full opacity-60" />
            </div>
          </div>
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="tracker-shimmer h-24 rounded-2xl opacity-90"
            style={{ animationDelay: `${i * 80}ms` }}
          />
        ))}
      </div>

      <div className="space-y-2">
        <div className="tracker-shimmer mb-3 h-3 w-40 rounded-full opacity-50" />
        {[1, 2, 3, 4, 5].map((i) => (
          <div
            key={i}
            className="tracker-shimmer h-[5.5rem] rounded-2xl opacity-80"
            style={{ animationDelay: `${i * 60}ms` }}
          />
        ))}
      </div>

      <p className="text-center text-sm text-white/40">
        Chargement du profil développeur…
      </p>
    </div>
  );
}
