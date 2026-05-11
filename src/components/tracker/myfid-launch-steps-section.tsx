import { Inter } from "next/font/google";

import "@/styles/myfid-launch-steps.css";

const interLaunch = Inter({
  subsets: ["latin"],
  display: "swap",
});

const DEFAULT_CTA_HREF =
  "https://www.icloud.com/shortcuts/a9d9656c24474d00b18eafb57393977b";

/** Section « Lancez-vous rapidement » — même structure HTML / classes que la landing myfidpass. */
export function MyfidLaunchStepsSection({
  ctaHref = DEFAULT_CTA_HREF,
}: {
  ctaHref?: string;
}) {
  return (
    <section
      id="lancez-vous-rapidement"
      className={`landing-launch-sf scroll-mt-[calc(5.75rem+env(safe-area-inset-top,0px)+1rem)] max-md:scroll-mt-[calc(6.375rem+env(safe-area-inset-top,0px)+1rem)] ${interLaunch.className}`}
      aria-labelledby="landing-launch-heading"
    >
      <div className="landing-launch-sf-inner">
        <h2 id="landing-launch-heading" className="landing-launch-sf-heading">
          Lancez-vous rapidement
        </h2>
        <div className="landing-launch-sf-grid">
          <div className="landing-launch-sf-visual" aria-hidden="true">
            <figure className="landing-launch-sf-fig landing-launch-sf-fig--primary">
              <img
                className="landing-launch-sf-img"
                src="/assets/iphone-myfid-launch.png"
                width={400}
                height={530}
                loading="lazy"
                decoding="async"
                alt=""
              />
            </figure>
          </div>
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
            <a
              className="landing-launch-sf-cta"
              href={ctaHref}
              target="_blank"
              rel="noopener noreferrer"
            >
              Accéder à mon espace
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
