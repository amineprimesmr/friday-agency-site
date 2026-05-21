export default function TrackappPaiementLoading() {
  return (
    <div className="tpl-paiement-page tpl-paiement-page--loading" aria-busy="true" aria-label="Chargement">
      <div className="tpl-paiement-loading-hero" />
      <div className="tpl-paiement-loading-shell">
        <div className="tpl-paiement-loading-line tpl-paiement-loading-line--title" />
        <div className="tpl-paiement-loading-line" />
        <div className="tpl-paiement-loading-card" />
      </div>
    </div>
  );
}
