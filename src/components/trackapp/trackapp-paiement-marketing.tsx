import { TrackappLandingFooter } from "@/components/trackapp/trackapp-landing-footer";
import { TrackappPaiementMarketingHero } from "@/components/trackapp/trackapp-paiement-marketing-hero";
import { TrackappPaiementMarketingPlanSwitcher } from "@/components/trackapp/trackapp-paiement-marketing-plan-switcher";
import { TrackappPaiementPlanSpotlightCards } from "@/components/trackapp/trackapp-paiement-plan-spotlight-cards";
import {
  TRACKAPP_PAIEMENT_TESTIMONIALS,
  TrackappPaiementTestimonialsMarquee,
} from "@/components/trackapp/trackapp-paiement-testimonials-marquee";
import { TrackerHeroSocialProofBadge } from "@/components/tracker/tracker-hero-social-proof-badge";

/** Page longue mobile (et desktop) : sections commerciales avant le bloc paiement Stripe. */
export function TrackappPaiementMarketing() {
  return (
    <div className="tpl-paiement-marketing">
      <TrackappPaiementMarketingHero />

      {/* Bloc principal chevauché */}
      <div className="tpl-shell">
        <section className="tpl-pick" aria-labelledby="tpl-pick-title">
          <h2 className="tpl-pick__title" id="tpl-pick-title">
            Choisissez votre plan
          </h2>
          <p className="tpl-pick__sub">Trouvez les apps qui scalent en ce moment.</p>

          <div className="tpl-pick__badge-wrap">
            <TrackerHeroSocialProofBadge />
          </div>

          <TrackappPaiementMarketingPlanSwitcher />

          <TrackappPaiementPlanSpotlightCards />
        </section>
      </div>

      <section className="tpl-community tpl-community--marquee" aria-labelledby="community-title">
        <h3 className="tpl-community__title" id="community-title">
          Résultats des membres
        </h3>

        <p className="tpl-marquee-sr-only">
          Témoignages membres : {TRACKAPP_PAIEMENT_TESTIMONIALS.map((t) => `${t.title} (${t.author})`).join(". ")}.
        </p>

        <TrackappPaiementTestimonialsMarquee />
      </section>

      <TrackappLandingFooter />
    </div>
  );
}
