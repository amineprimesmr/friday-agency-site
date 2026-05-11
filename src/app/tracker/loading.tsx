export default function TrackerLoading() {
  return (
    <div className="flex min-h-[40vh] flex-col items-center justify-center gap-3 px-4 text-white/45">
      <div
        className="size-9 animate-spin rounded-full border-2 border-white/15 border-t-white/65"
        role="presentation"
      />
      <p className="text-center text-sm">Chargement des classements…</p>
    </div>
  );
}
