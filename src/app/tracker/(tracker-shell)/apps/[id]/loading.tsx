export default function AppDetailLoading() {
  return (
    <div className="tracker-app-loading mx-auto max-w-[1380px] px-4 py-8 sm:px-6">
      <div className="tracker-skeleton-fade mb-6 flex flex-wrap items-start justify-between gap-3">
        <div className="flex flex-wrap gap-2">
          <div className="tracker-shimmer h-3 w-24 rounded-full" />
          <div className="tracker-shimmer h-3 w-20 rounded-full opacity-80" />
          <div className="tracker-shimmer h-3 w-32 rounded-full opacity-60" />
        </div>
        <div className="tracker-shimmer h-9 w-40 rounded-xl opacity-70" />
      </div>

      <div className="tracker-skeleton-rise mb-6 rounded-2xl border border-white/[0.08] bg-neutral-950/40 p-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)] sm:p-7">
        <div className="flex flex-wrap gap-2 border-b border-white/[0.07] pb-6">
          <div className="tracker-shimmer h-6 w-20 rounded-full" />
          <div className="tracker-shimmer h-6 w-28 rounded-full opacity-80" />
        </div>

        <div className="mt-6 flex flex-col gap-6 lg:flex-row lg:items-start lg:gap-10">
          <div className="flex gap-4 sm:gap-5">
            <div className="tracker-shimmer size-24 shrink-0 rounded-[22px] sm:size-28" />
            <div className="min-w-0 flex-1 space-y-4">
              <div className="space-y-2">
                <div className="tracker-shimmer h-8 w-[min(100%,280px)] rounded-lg" />
                <div className="tracker-shimmer h-4 w-48 rounded-md opacity-70" />
              </div>
              <div className="flex flex-wrap gap-2">
                <div className="tracker-shimmer h-7 w-24 rounded-full" />
                <div className="tracker-shimmer h-7 w-20 rounded-full opacity-90" />
                <div className="tracker-shimmer h-7 w-28 rounded-full opacity-70" />
              </div>
              <div className="flex gap-2">
                <div className="tracker-shimmer h-4 w-28 rounded opacity-60" />
                <div className="tracker-shimmer h-4 w-36 rounded opacity-50" />
              </div>
            </div>
          </div>
          <div className="flex w-full flex-col gap-2 lg:w-56">
            <div className="tracker-shimmer h-11 w-full rounded-xl" />
            <div className="tracker-shimmer h-11 w-full rounded-xl opacity-80" />
            <div className="tracker-shimmer h-11 w-full rounded-xl opacity-60" />
          </div>
        </div>

        <div className="mt-8 grid gap-3 border-t border-white/[0.07] pt-8 sm:grid-cols-2 lg:grid-cols-4">
          {["Classement", "Notes", "Téléchargements", "Revenus"].map((label) => (
            <div
              key={label}
              className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-4"
            >
              <div className="tracker-shimmer mb-2 h-3 w-20 rounded opacity-50" />
              <div className="tracker-shimmer mb-2 h-8 w-3/4 max-w-[140px] rounded-md" />
              <div className="tracker-shimmer h-3 w-full max-w-[180px] rounded opacity-40" />
            </div>
          ))}
        </div>
      </div>

      <div className="tracker-skeleton-rise mb-6 flex gap-2">
        <div className="tracker-shimmer h-10 flex-1 max-w-[8rem] rounded-xl" />
        <div className="tracker-shimmer h-10 flex-1 max-w-[8rem] rounded-xl opacity-70" />
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_340px]">
        <div className="space-y-5">
          <div className="tracker-shimmer h-48 w-full rounded-2xl opacity-80" />
          <div className="tracker-shimmer h-64 w-full rounded-2xl opacity-60" />
          <div className="tracker-shimmer h-40 w-full rounded-2xl opacity-50" />
        </div>
        <div className="space-y-5">
          <div className="tracker-shimmer h-72 w-full rounded-2xl" />
          <div className="tracker-shimmer h-56 w-full rounded-2xl opacity-80" />
        </div>
      </div>

      <p className="tracker-loading-hint mt-10 text-center text-sm text-white/40">
        Chargement de la fiche app · données Apple & estimations
      </p>
    </div>
  );
}
