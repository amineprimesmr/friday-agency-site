"use client";

function AppleMark() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden fill="currentColor">
      <path d="M16.365 1.43c0 1.14-.493 2.044-1.285 2.716-.86.72-2.044 1.214-3.18 1.14-.15-1.08.417-2.214 1.15-2.916.84-.78 2.315-1.36 3.315-1.14.012.07.012.14.012.2zm1.403 3.49c-1.823-.105-3.374 1.038-4.244 1.038-.896 0-2.268-1.008-3.734-1.008-1.92 0-3.696 1.116-4.734 2.844-2.016 3.492-.528 8.652 1.44 11.484 1.008 1.452 2.208 3.084 3.792 3.024 1.524-.06 2.088-.984 3.912-.984 1.824 0 2.328.984 3.912.924 1.62-.06 2.652-1.476 3.648-2.94 1.152-1.68 1.632-3.312 1.656-3.396-.036-.012-3.18-1.224-3.204-4.848-.024-3.024 2.484-4.464 2.604-4.548-1.416-2.076-3.612-2.316-4.368-2.364z" />
    </svg>
  );
}

export function TrackappPaiementApplePayButton({
  busy,
  disabled,
  onClick,
}: Readonly<{
  busy?: boolean;
  disabled?: boolean;
  onClick: () => void;
}>) {
  return (
    <button
      type="button"
      className="tpl-spotlight__apple-pay"
      onClick={onClick}
      disabled={disabled || busy}
      aria-label={busy ? "Ouverture Apple Pay…" : "Payer avec Apple Pay"}
    >
      <span className="tpl-spotlight__apple-pay-fallback" aria-hidden={busy}>
        <AppleMark />
        <span>{busy ? "Ouverture…" : "Pay"}</span>
      </span>
    </button>
  );
}
