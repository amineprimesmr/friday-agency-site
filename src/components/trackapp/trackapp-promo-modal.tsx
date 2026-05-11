"use client";

/** Pop-up présent aussi sur la landing Tracker — même contenu configurable. */

export function TrackappPromoModal({
  open,
  onClose,
  variant,
}: {
  open: boolean;
  onClose: () => void;
  variant?: "drawer";
}) {
  if (!open) return null;

  return (
    <div
      className={`fixed inset-0 z-[200] flex items-center justify-center p-6 ${variant === "drawer" ? "" : "bg-black/65 backdrop-blur-sm"}`}
      role="dialog"
      aria-modal="true"
      aria-labelledby="trackapp-promo-title"
    >
      <div className="relative max-h-[min(90vh,34rem)] w-full max-w-md overflow-y-auto rounded-3xl border border-white/[0.1] bg-zinc-950/95 p-7 shadow-[0_24px_80px_-20px_rgba(124,58,237,0.35)]">
        <button
          type="button"
          aria-label="Fermer"
          onClick={onClose}
          className="absolute right-4 top-4 rounded-full p-2 text-white/42 transition hover:bg-white/[0.06] hover:text-white/90"
        >
          ✕
        </button>
        <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-violet-400/90">Trackapp</p>
        <h2 id="trackapp-promo-title" className="mt-3 text-2xl font-semibold tracking-tight text-white">
          Un seul endroit pour passer à la construction
        </h2>
        <p className="mt-4 text-[14px] leading-relaxed text-white/55">
          L’invite « extension gratuite » laisse place à un espace où tu suis des étapes claires pour iOS, avec des prompts
          découpés. Tu gardes gratuitement une partie du plan ; tout le playbook se déverrouille quand tu actives Stripe.
        </p>
        <ul className="mt-5 space-y-2 text-[13px] text-white/45">
          <li>● Onboarding ultra court (+ ton niveau en apps mobiles)</li>
          <li>● Pré-remplissage automatique depuis une app Tracker copiée</li>
          <li>● Bloc RévenueCat : lecture simple + prompt à coller</li>
        </ul>
      </div>
    </div>
  );
}
