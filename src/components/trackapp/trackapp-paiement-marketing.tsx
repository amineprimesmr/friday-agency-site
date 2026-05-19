import { TrackappLandingFooter } from "@/components/trackapp/trackapp-landing-footer";
import { TrackappPaiementMarketingPlanSwitcher } from "@/components/trackapp/trackapp-paiement-marketing-plan-switcher";
import { TrackappPaiementPlanSpotlightCards } from "@/components/trackapp/trackapp-paiement-plan-spotlight-cards";

const MEMBER_AVATAR_URLS = [
  "https://i.pravatar.cc/128?img=12",
  "https://i.pravatar.cc/128?img=33",
  "https://i.pravatar.cc/128?img=47",
  "https://i.pravatar.cc/128?img=61",
  "https://i.pravatar.cc/128?img=25",
] as const;

const INCLUDED = [
  "Tracker App Store multi-pays (rangs, tops, historique)",
  "Apps du mois & veille tendances pour trouver des niches",
  "Parcours « Créer mon app » : idées, prompts et ressources",
  "Bibliothèque ressources (kits, modèles, check-lists)",
  "Programme affiliation : partage ton lien −40 % filleuls",
  "Mises à jour produit incluses dans ton accès",
];

const TESTIMONIALS = [
  {
    title: "Trois outils en un",
    body: "Je suivais les charts à la main. Là j’ai les tops, les niches et les ressources au même endroit.",
    author: "Léa V.",
    initials: "LV",
    stars: 5,
  },
  {
    title: "Rentable vite",
    body: "L’affiliation m’a fait récupérer l’abonnement dès le premier filleul payant.",
    author: "Thomas I.",
    initials: "TI",
    stars: 5,
  },
  {
    title: "Idées concrètes",
    body: "La section Créer mon app m’a aidé à cadrer mon MVP sans partir dans tous les sens.",
    author: "Maya L.",
    initials: "ML",
    stars: 4,
  },
  {
    title: "Gain de temps énorme",
    body: "Je zappe les allers-retours App Store Connect / tableurs.",
    author: "Hugo P.",
    initials: "HP",
    stars: 5,
  },
];

type Testimonial = (typeof TESTIMONIALS)[number];

function MarqueeStars({ n }: Readonly<{ n: number }>) {
  return (
    <div className="tpl-marquee-card__stars" aria-hidden>
      {Array.from({ length: 5 }, (_, i) => (
        <span key={String(i)} className={i < n ? "tpl-marquee-card__star tpl-marquee-card__star--on" : "tpl-marquee-card__star"}>
          ★
        </span>
      ))}
    </div>
  );
}

function MarqueeCard({ t }: Readonly<{ t: Testimonial }>) {
  return (
    <article className="tpl-marquee-card">
      <MarqueeStars n={t.stars} />
      <p className="tpl-marquee-card__title">{t.title}</p>
      <p className="tpl-marquee-card__body">{t.body}</p>
      <div className="tpl-marquee-card__user">
        <span className="tpl-marquee-card__avatar">{t.initials}</span>
        <span className="tpl-marquee-card__name">{t.author}</span>
      </div>
    </article>
  );
}

const MARQUEE_ROW_A: Testimonial[] = [...TESTIMONIALS];
const MARQUEE_ROW_B: Testimonial[] = [
  TESTIMONIALS[2],
  TESTIMONIALS[3],
  TESTIMONIALS[0],
  TESTIMONIALS[1],
];

function MarqueeBand({ row, direction }: Readonly<{ row: Testimonial[]; direction: "left" | "right" }>) {
  return (
    <div
      className={`tpl-community__marquee-viewport tpl-community__marquee-viewport--${direction}`}
      aria-hidden="true"
    >
      <div className={`tpl-community__marquee-track tpl-community__marquee-track--${direction}`}>
        <div className="tpl-community__marquee-chunk">
          {row.map((t) => (
            <MarqueeCard key={t.author} t={t} />
          ))}
        </div>
        <div className="tpl-community__marquee-chunk" aria-hidden="true">
          {row.map((t) => (
            <MarqueeCard key={`${t.author}-dup`} t={t} />
          ))}
        </div>
      </div>
    </div>
  );
}

/** Page longue mobile (et desktop) : sections commerciales avant le bloc paiement Stripe. */
export function TrackappPaiementMarketing() {
  return (
    <div className="tpl-paiement-marketing">
      {/* Hero */}
      <section className="tpl-hero" aria-label="Offre Trackapp">
        <div className="tpl-hero__bg" aria-hidden />
        <div className="tpl-hero__inner">
          <p className="tpl-hero__eyebrow">Offre Spéciale</p>
          <p className="tpl-hero__discount">-79&nbsp;%</p>
          <p className="tpl-hero__tagline">Créez votre app maintenant</p>
        </div>
      </section>

      {/* Bloc principal chevauché */}
      <div className="tpl-shell">
        <section className="tpl-pick" aria-labelledby="tpl-pick-title">
          <h2 className="tpl-pick__title" id="tpl-pick-title">
            Choisissez votre plan
          </h2>
          <p className="tpl-pick__sub">Trouvez les apps qui scalent en ce moment.</p>

          <div className="tpl-member-proof" role="status" aria-label="+2 560 membres, 5 étoiles sur 5">
            <div className="tpl-member-proof__avatars" aria-hidden="true">
              {MEMBER_AVATAR_URLS.map((src, i) => (
                <img
                  key={src}
                  src={src}
                  alt=""
                  width={24}
                  height={24}
                  className="tpl-member-proof__avatar"
                  style={{ zIndex: MEMBER_AVATAR_URLS.length - i }}
                  loading="lazy"
                  decoding="async"
                />
              ))}
            </div>
            <div className="tpl-member-proof__meta">
              <div className="tpl-member-proof__stars" aria-hidden="true">
                {Array.from({ length: 5 }, (_, si) => (
                  <span key={String(si)} className="tpl-member-proof__star">
                    ★
                  </span>
                ))}
              </div>
              <p className="tpl-member-proof__count">+2&nbsp;560 membres</p>
            </div>
          </div>

          <TrackappPaiementMarketingPlanSwitcher />

          <TrackappPaiementPlanSpotlightCards />
        </section>

        <section className="tpl-section" aria-labelledby="inclus-title">
          <p className="tpl-section__kicker" id="inclus-kicker">
            What&apos;s included
          </p>
          <h3 className="tpl-section__title" id="inclus-title">
            Tout ce que tu utilises au quotidien
          </h3>
          <ul className="tpl-checklist">
            {INCLUDED.map((line) => (
              <li key={line} className="tpl-checklist__item">
                <span className="tpl-check" aria-hidden>
                  ✓
                </span>
                <span>{line}</span>
              </li>
            ))}
          </ul>
        </section>

        <section className="tpl-community tpl-community--marquee" aria-labelledby="community-title">
          <h3 className="tpl-community__title" id="community-title">
            Résultats des membres
          </h3>

          <p className="tpl-marquee-sr-only">
            Témoignages membres : {TESTIMONIALS.map((t) => `${t.title} (${t.author})`).join(". ")}.
          </p>

          <div className="tpl-community__marquee-stack" aria-hidden="true">
            <MarqueeBand row={MARQUEE_ROW_A} direction="left" />
            <MarqueeBand row={MARQUEE_ROW_B} direction="right" />
          </div>
        </section>
      </div>

      <TrackappLandingFooter />
    </div>
  );
}
