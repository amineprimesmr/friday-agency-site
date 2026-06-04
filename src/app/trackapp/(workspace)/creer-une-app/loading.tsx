import "@/styles/trackapp-applab-create.css";

export default function TrackappCreerUneAppLoading() {
  return (
    <div className="ta-applab-create-root ta-font" aria-busy="true" aria-label="Chargement AppLAB">
      <div className="ta-applab-create-top">
        <div className="h-8 w-40 animate-pulse rounded-lg bg-white/10" />
      </div>
    </div>
  );
}
