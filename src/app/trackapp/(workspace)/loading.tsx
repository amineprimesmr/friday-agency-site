export default function TrackappWorkspaceLoading() {
  return (
    <div className="dashboard-main w-full max-w-[1100px] pb-16" aria-label="Chargement">
      <div className="trackapp-workspace-loading">
        <span className="trackapp-workspace-loading__bar" />
        <span className="trackapp-workspace-loading__hero" />
        <span className="trackapp-workspace-loading__line trackapp-workspace-loading__line--wide" />
        <span className="trackapp-workspace-loading__line" />
        <div className="trackapp-workspace-loading__grid">
          <span />
          <span />
          <span />
        </div>
      </div>
    </div>
  );
}
