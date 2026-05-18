import { TrackerSaleNotificationsStack } from "@/components/tracker/tracker-sale-notifications-stack";

import "@/styles/myfid-launch-steps.css";

const DEFAULT_CTA_HREF = "/trackapp/inscription";

/** Section « Lancez-vous rapidement » — même structure HTML / classes que la landing myfidpass. */
export function MyfidLaunchStepsSection({
  ctaHref = DEFAULT_CTA_HREF,
}: {
  ctaHref?: string;
}) {
  return (
    <section
      id="lancez-vous-rapidement"
      className="landing-launch-sf scroll-mt-[calc(var(--tracker-header-offset)+1rem)]"
      aria-labelledby="landing-launch-heading"
    >
      <div className="landing-launch-sf-inner">
        <h2 id="landing-launch-heading" className="landing-launch-sf-heading">
          Lancez-vous rapidement
        </h2>
        <div className="landing-launch-sf-notifs">
          <TrackerSaleNotificationsStack className="pb-6 pt-0" />
        </div>
        <div className="landing-launch-sf-grid landing-launch-sf-grid--solo">
          <div className="landing-launch-sf-steps-wrap">
            <ol className="landing-launch-sf-list">
              <li className="landing-launch-sf-row">
                <span className="landing-launch-sf-num" aria-hidden="true">
                  01
                </span>
                <h3 className="landing-launch-sf-step-title">Créez votre carte fidélité</h3>
              </li>
              <li className="landing-launch-sf-row">
                <span className="landing-launch-sf-num" aria-hidden="true">
                  02
                </span>
                <h3 className="landing-launch-sf-step-title">Personnalisez votre espace</h3>
              </li>
              <li className="landing-launch-sf-row landing-launch-sf-row--dim">
                <span className="landing-launch-sf-num landing-launch-sf-num--soft" aria-hidden="true">
                  03
                </span>
                <h3 className="landing-launch-sf-step-title">Diffusez votre flyer de jeu</h3>
              </li>
            </ol>
            <a className="landing-launch-sf-cta" href={ctaHref}>
              Ouvrir le workspace
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
