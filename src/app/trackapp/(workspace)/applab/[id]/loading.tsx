export default function TrackappApplabLoading() {
  return (
    <div className="relative z-[1] dashboard-main pb-16" aria-busy="true" aria-label="Redirection">
      <div className="mt-8 h-8 w-48 animate-pulse rounded-lg bg-slate-100" />
    </div>
  );
}
