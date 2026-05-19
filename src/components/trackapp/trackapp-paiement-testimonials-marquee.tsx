export type TrackappPaiementTestimonial = Readonly<{
  title: string;
  body: string;
  author: string;
  initials: string;
  stars: number;
}>;

export const TRACKAPP_PAIEMENT_TESTIMONIALS: readonly TrackappPaiementTestimonial[] = [
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
  {
    title: "Première app publiée",
    body: "Le parcours m’a évité de tourner en rond. En 3 semaines j’avais ma V1 sur TestFlight.",
    author: "Nina B.",
    initials: "NB",
    stars: 5,
  },
  {
    title: "Simple et efficace",
    body: "Tout est au même endroit : veille, apps à copier, ressources UI. Je gagne des heures chaque semaine.",
    author: "Karim D.",
    initials: "KD",
    stars: 5,
  },
];

export const TRACKAPP_PAIEMENT_TESTIMONIALS_ROW_A: TrackappPaiementTestimonial[] = [
  ...TRACKAPP_PAIEMENT_TESTIMONIALS,
];

export const TRACKAPP_PAIEMENT_TESTIMONIALS_ROW_B: TrackappPaiementTestimonial[] = [
  TRACKAPP_PAIEMENT_TESTIMONIALS[3],
  TRACKAPP_PAIEMENT_TESTIMONIALS[4],
  TRACKAPP_PAIEMENT_TESTIMONIALS[5],
  TRACKAPP_PAIEMENT_TESTIMONIALS[0],
  TRACKAPP_PAIEMENT_TESTIMONIALS[1],
  TRACKAPP_PAIEMENT_TESTIMONIALS[2],
];

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

function MarqueeCard({ t }: Readonly<{ t: TrackappPaiementTestimonial }>) {
  return (
    <article className="tpl-marquee-card">
      <div className="tpl-marquee-card__panel">
        <MarqueeStars n={t.stars} />
        <p className="tpl-marquee-card__title">{t.title}</p>
        <p className="tpl-marquee-card__body">{t.body}</p>
      </div>
      <div className="tpl-marquee-card__user">
        <span className="tpl-marquee-card__avatar">{t.initials}</span>
        <span className="tpl-marquee-card__name">{t.author}</span>
      </div>
    </article>
  );
}

function MarqueeBand({
  row,
  direction,
}: Readonly<{ row: TrackappPaiementTestimonial[]; direction: "left" | "right" }>) {
  return (
    <div className={`tpl-community__marquee-viewport tpl-community__marquee-viewport--${direction}`} aria-hidden="true">
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

/** Double bandeau témoignages (même design que la page paiement). */
export function TrackappPaiementTestimonialsMarquee({ className }: Readonly<{ className?: string }>) {
  return (
    <div className={className ? `tpl-community__marquee-stack ${className}` : "tpl-community__marquee-stack"} aria-hidden="true">
      <MarqueeBand row={TRACKAPP_PAIEMENT_TESTIMONIALS_ROW_A} direction="left" />
      <MarqueeBand row={TRACKAPP_PAIEMENT_TESTIMONIALS_ROW_B} direction="right" />
    </div>
  );
}
