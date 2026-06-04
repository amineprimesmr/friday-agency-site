"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

import { AFFILIATE_COMMISSION_MRR_EUR } from "@/lib/trackapp/affiliate/config";

import "@/styles/trendtrack-affiliate.css";

const FAQ_ITEMS: { q: string; a: string }[] = [
  {
    q: "À quelle fréquence les paiements sont effectués ?",
    a: "Les commissions sont consolidées chaque mois et versées selon le calendrier indiqué dans votre espace affilié une fois le seuil minimal atteint.",
  },
  {
    q: "Comment suivre les inscriptions que j'ai référées ?",
    a: "Vous accédez à un tableau de bord avec les clics, essais et conversions attribués à votre lien ou à votre code promo.",
  },
  {
    q: "Le code promo tracke-t-il les affiliés même s'ils n'utilisent pas le lien affilié ?",
    a: "Oui, lorsque le code est saisi au moment du souscription, la vente est attribuée à votre compte affilié.",
  },
  {
    q: "Est-ce que je peux faire de la pub avec mon lien affilié ?",
    a: "Vous pouvez promouvoir votre lien dans le respect des règles Trackapp et des lois en vigueur (transparence, pas de spam, etc.).",
  },
  {
    q: "Comment fonctionne le tracking des liens ?",
    a: "Un identifiant unique est associé à votre lien ; les visites et conversions sont mesurées côté serveur de façon sécurisée.",
  },
  {
    q: "D'autres questions ?",
    a: "Écrivez-nous depuis la page contact ou ouvrez un ticket depuis votre espace : nous vous répondons sous 48h ouvrées en général.",
  },
];

function ChevronDown() {
  return (
    <svg className="tt-affiliate-faq-chevron" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path d="M6 9l6 6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

type Props = Readonly<{
  embedded?: boolean;
}>;

export function TrendtrackAffiliateLanding({ embedded = false }: Props) {
  const [affiliates, setAffiliates] = useState(50);
  const [faqOpen, setFaqOpen] = useState<number | null>(null);

  const payout = useMemo(
    () => Math.round(affiliates * AFFILIATE_COMMISSION_MRR_EUR),
    [affiliates],
  );
  const pct = affiliates / 500;

  return (
    <div className="tt-affiliate">
      <section className="tt-affiliate-hero" aria-labelledby="tt-affiliate-hero-title">
        <div className="tt-affiliate-hero-inner">
          <p className="tracker-bracket-badge tracker-bracket-badge--on-dark tt-affiliate-kicker">
            <span className="tracker-bracket-badge__br" aria-hidden>
              [
            </span>
            <span className="tracker-bracket-badge__text"> AFFILIATION </span>
            <span className="tracker-bracket-badge__br" aria-hidden>
              ]
            </span>
          </p>
          <h1 id="tt-affiliate-hero-title" className="tt-affiliate-title">
            {AFFILIATE_COMMISSION_MRR_EUR}&nbsp;€ de MRR
            <br />
            par parrainage actif
          </h1>
          <p className="tt-affiliate-lead">
            Un lien de parrainage unique. {AFFILIATE_COMMISSION_MRR_EUR}&nbsp;€ de commission récurrente par filleul
            abonné, chaque mois, tant qu&apos;il reste client. Virements sécurisés via Stripe.
          </p>
          {embedded ?
            null
          : <Link href="/trackapp/paiement" className="tt-affiliate-cta">
              Devenir affilié
              <span aria-hidden>→</span>
            </Link>}
        </div>
      </section>

      <div className="tt-affiliate-sim-wrap">
        <div className="tt-affiliate-sim">
          <p className="tt-affiliate-sim-head">Simulateur de revenu</p>
          <div className="tt-affiliate-slider-ui">
            <div className="tt-affiliate-slider-labels">
              <span>0</span>
              <span>500</span>
            </div>
            <div className="tt-affiliate-liquid-slider">
              <div className="tt-affiliate-liquid-slider-stage">
                <div className="tt-affiliate-liquid-slider-grid" aria-hidden />
                <div className="tt-affiliate-liquid-slider-rail">
                  <div className="tt-affiliate-liquid-slider-track-bg" />
                  <div
                    className="tt-affiliate-liquid-slider-fill"
                    style={{ width: `${pct * 100}%` }}
                  />
                  <input
                    type="range"
                    min={0}
                    max={500}
                    value={affiliates}
                    onChange={(e) => setAffiliates(Number(e.target.value))}
                    className="tt-affiliate-liquid-slider-input"
                    aria-valuemin={0}
                    aria-valuemax={500}
                    aria-valuenow={affiliates}
                    aria-label="Nombre d’affiliés actifs"
                  />
                  <div
                    className="tt-affiliate-liquid-slider-thumb-wrap"
                    style={{ left: `${pct * 100}%` }}
                  >
                    <span className="tt-affiliate-slider-thumb-badge">{affiliates}</span>
                    <div className="tt-affiliate-liquid-slider-thumb-glass">
                      <span className="tt-affiliate-liquid-slider-thumb-specular" aria-hidden />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="tt-affiliate-sim-foot">
            <div>
              <span className="tt-affiliate-sim-payout-label">Revenu MRR estimé</span>
              <span className="tt-affiliate-sim-payout-value">
                {payout.toLocaleString("fr-FR")}€ /mois
              </span>
            </div>
            <span className="tt-affiliate-sim-pill">{affiliates} affiliés</span>
          </div>
        </div>
      </div>

      <div className="tt-affiliate-shell">
        <p className="tracker-bracket-badge tracker-bracket-badge--on-light tt-affiliate-section-kicker">
          <span className="tracker-bracket-badge__br" aria-hidden>
            [
          </span>
          <span className="tracker-bracket-badge__text"> Comment ça marche </span>
          <span className="tracker-bracket-badge__br" aria-hidden>
            ]
          </span>
        </p>
        <h2 className="tt-affiliate-section-title">Devenez affilié en 3 étapes</h2>
        <p className="tt-affiliate-section-lead">
          Configuré en moins de 2 minutes. Partagez votre lien. Gagnez {AFFILIATE_COMMISSION_MRR_EUR}&nbsp;€ de MRR par
          filleul actif, chaque mois, tant qu&apos;il reste abonné.
        </p>

        <div className="tt-affiliate-steps">
          <article className="tt-affiliate-step">
            <div className="tt-affiliate-step-bar">
              <span className="tt-affiliate-step-num">1</span> Étape 1
            </div>
            <div className="tt-affiliate-step-visual">
              <div className="flex flex-wrap items-center gap-2 rounded-xl border border-zinc-200 bg-white px-3 py-2.5 shadow-sm">
                <span className="truncate text-[13px] text-zinc-600">https://trackapp.app/</span>
                <span className="tt-affiliate-demo-chip shrink-0 rounded-full px-2.5 py-1 text-[11px] font-semibold">
                  via?=toi
                </span>
              </div>
            </div>
            <div className="tt-affiliate-step-body">
              <div className="tt-affiliate-step-icon" aria-hidden>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                  <path
                    d="M12 12a4 4 0 100-8 4 4 0 000 8zM4 21a8 8 0 0116 0"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                  />
                </svg>
              </div>
              <h3 className="tt-affiliate-step-title">Créez votre compte affilié</h3>
              <p className="tt-affiliate-step-desc">
                Moins de 2 minutes. Vous recevez instantanément un lien personnalisé et un code de tracking.
              </p>
            </div>
          </article>

          <article className="tt-affiliate-step">
            <div className="tt-affiliate-step-bar">
              <span className="tt-affiliate-step-num">2</span> Étape 2
            </div>
            <div className="tt-affiliate-step-visual flex flex-col items-center justify-center gap-3">
              <div className="flex items-center justify-center gap-3">
                <div className="tt-affiliate-demo-block h-10 w-10 rounded-lg" aria-hidden />
                <div className="hidden h-px w-8 bg-zinc-300 sm:block" />
                <div className="flex gap-2">
                  <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-red-500 text-[10px] font-bold text-white">
                    ▶
                  </span>
                  <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-amber-400 via-pink-500 to-purple-600 text-[10px] text-white">
                    ◎
                  </span>
                  <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-zinc-900 text-[10px] font-bold text-white">
                    X
                  </span>
                  <span className="flex h-9 w-9 items-center justify-center rounded-lg border border-zinc-200 bg-white text-[10px] font-semibold text-zinc-600">
                    Short
                  </span>
                </div>
              </div>
            </div>
            <div className="tt-affiliate-step-body">
              <div className="tt-affiliate-step-icon" aria-hidden>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                  <path
                    d="M21 15a4 4 0 01-4 4H8l-4 4V7a4 4 0 014-4h9a4 4 0 014 4v8z"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
              <h3 className="tt-affiliate-step-title">Partagez votre lien affilié</h3>
              <p className="tt-affiliate-step-desc">
                Partagez votre lien affilié avec votre audience, vos followers, vos amis et vos clients.
              </p>
            </div>
          </article>

          <article className="tt-affiliate-step">
            <div className="tt-affiliate-step-bar">
              <span className="tt-affiliate-step-num">3</span> Étape 3
            </div>
            <div className="tt-affiliate-step-visual flex flex-wrap items-center justify-center gap-2">
              <div className="rounded-lg border border-zinc-200 bg-white px-3 py-2 text-center shadow-sm">
                <p className="text-[10px] font-semibold uppercase tracking-wide text-zinc-500">Pending</p>
                <p className="text-sm font-bold text-zinc-900">56&nbsp;$</p>
              </div>
              <div className="rounded-lg border border-zinc-200 bg-white px-3 py-2 text-center shadow-sm">
                <p className="text-[10px] font-semibold uppercase tracking-wide text-zinc-500">MRR / filleul</p>
                <p className="text-sm font-bold text-zinc-900">{AFFILIATE_COMMISSION_MRR_EUR}&nbsp;€</p>
              </div>
              <span className="tt-affiliate-demo-chip rounded-full px-3 py-1.5 text-xs font-bold">Payout</span>
            </div>
            <div className="tt-affiliate-step-body">
              <div className="tt-affiliate-step-icon" aria-hidden>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                  <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2" />
                  <path d="M12 7v5l3 2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                </svg>
              </div>
              <h3 className="tt-affiliate-step-title">Gagnez chaque mois</h3>
              <p className="tt-affiliate-step-desc">
                Recevez {AFFILIATE_COMMISSION_MRR_EUR}&nbsp;€ de commission MRR par mois et par filleul actif.
              </p>
            </div>
          </article>
        </div>

        <div className="tt-affiliate-faq">
          <div className="tt-affiliate-faq-intro">
            <p className="tracker-bracket-badge tracker-bracket-badge--on-light tt-affiliate-section-kicker">
              <span className="tracker-bracket-badge__br" aria-hidden>
                [
              </span>
              <span className="tracker-bracket-badge__text"> F.A.Q </span>
              <span className="tracker-bracket-badge__br" aria-hidden>
                ]
              </span>
            </p>
            <h2 className="tt-affiliate-section-title">Les questions fréquentes</h2>
            <p className="tt-affiliate-faq-contact">
              Vous ne trouvez pas la réponse à votre question ? Contactez-nous en{" "}
              <Link href="/tracker" className="underline underline-offset-[3px]">
                cliquant ici..
              </Link>
            </p>
          </div>
          <ul className="tt-affiliate-faq-list">
            {FAQ_ITEMS.map((item, i) => {
              const open = faqOpen === i;
              return (
                <li key={item.q} className="tt-affiliate-faq-item" data-open={open ? "true" : "false"}>
                  <button
                    type="button"
                    className="tt-affiliate-faq-trigger"
                    aria-expanded={open}
                    onClick={() => setFaqOpen(open ? null : i)}
                  >
                    {item.q}
                    <ChevronDown />
                  </button>
                  {open ? (
                    <div className="tt-affiliate-faq-panel">
                      <div className="tt-affiliate-faq-panel-inner">{item.a}</div>
                    </div>
                  ) : null}
                </li>
              );
            })}
          </ul>
        </div>
      </div>

      <section className="tt-affiliate-footer-cta" aria-labelledby="tt-affiliate-footer-title">
        <h2 id="tt-affiliate-footer-title" className="tt-affiliate-footer-title">
          Prêt à construire une marque à plusieurs millions&nbsp;?
        </h2>
      </section>
    </div>
  );
}
