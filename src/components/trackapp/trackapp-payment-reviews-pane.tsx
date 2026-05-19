import {
  TRACKAPP_PAIEMENT_TESTIMONIALS,
  TrackappPaiementTestimonialsMarquee,
} from "@/components/trackapp/trackapp-paiement-testimonials-marquee";

import "@/styles/trackapp-paiement-landing.css";

/** Panneau droit modale paiement : fond promo + avis membres en carousel par-dessus. */
export function TrackappPaymentReviewsPane() {
  return (
    <aside className="ta-auth-promo-pane ta-pay-reviews-pane" aria-label="Avis membres">
      <div className="ta-auth-promo-bg" aria-hidden>
        <div className="ta-auth-promo-bg-placeholder" />
        <div className="ta-auth-promo-grad" />
      </div>

      <div className="ta-pay-reviews-pane__content">
        <p className="ta-pay-reviews-pane__kicker">Résultats des membres</p>
        <p className="tpl-marquee-sr-only">
          Témoignages membres : {TRACKAPP_PAIEMENT_TESTIMONIALS.map((t) => `${t.title} (${t.author})`).join(". ")}.
        </p>
        <TrackappPaiementTestimonialsMarquee className="ta-pay-reviews-pane__marquee" />
      </div>
    </aside>
  );
}
