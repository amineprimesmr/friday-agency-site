export default function TrackerLoading() {
  return (
    <div className="mx-auto flex min-h-[50vh] max-w-7xl flex-col items-center justify-center gap-8 px-4 py-16 sm:px-6">
      <div className="relative">
        <div
          className="size-14 animate-spin rounded-2xl border-2 border-white/12 border-t-cyan-400/90 shadow-[0_0_32px_rgba(34,211,238,0.25)]"
          role="presentation"
        />
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-lg font-black tracking-tight text-white/25">⌁</span>
        </div>
      </div>
      <div className="max-w-md space-y-3 text-center">
        <p className="text-sm font-medium text-white/55">
          Chargement du classement…
        </p>
        <div className="tracker-skeleton-fade mx-auto h-1.5 max-w-xs overflow-hidden rounded-full bg-white/[0.07]">
          <div className="tracker-top-progress-line h-full w-1/2 rounded-full bg-gradient-to-r from-cyan-400/80 to-violet-400/80" />
        </div>
        <p className="text-xs text-white/30">
          Connexion aux flux App Store en cours
        </p>
      </div>
    </div>
  );
}
