"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useState } from "react";

import { useMobilePerf } from "@/lib/use-coarse-pointer";
import { cn } from "@/lib/utils";

const FAQ_ITEMS = [
  {
    q: "Qu’est-ce que Trackapp ?",
    a: "Trackapp réunit un tracker App Store, des apps à fort potentiel, des ressources pour créer votre app iOS et les outils pour la monétiser — le tout dans un seul espace.",
  },
  {
    q: "Faut-il savoir coder pour lancer une app ?",
    a: "Non. Trackapp vous guide étape par étape : idée, positionnement, stack no-code ou dev léger, puis monétisation (abonnements, essais, offres). Vous avancez à votre rythme avec des modèles prêts à l’emploi.",
  },
  {
    q: "Comment débloquer toutes les apps du tracker ?",
    a: "Les apps en avant-première sont visibles gratuitement. Pour accéder à la base complète, aux filtres avancés et au parcours « Créer mon app », ouvrez votre workspace Trackapp.",
  },
  {
    q: "Combien coûte l’accès ?",
    a: "Trackapp est à 29 € / mois ou 59 € à vie (paiement unique). L’affiliation peut rembourser une partie de ton abonnement dès ton premier filleul actif.",
  },
  {
    q: "Puis-je annuler quand je veux ?",
    a: "Pour l’offre mensuelle, oui : tu gères ton abonnement depuis ton espace et tu résilies en un clic. L’accès à vie ne nécessite aucun renouvellement.",
  },
] as const;

const PANEL_TRANSITION = { duration: 0.34, ease: [0.22, 1, 0.36, 1] as const };

function FaqChevron({ open, staticChevron }: { open: boolean; staticChevron: boolean }) {
  if (staticChevron) {
    return (
      <svg
        className={cn("launch-sf-faq-chevron", open && "launch-sf-faq-chevron--open")}
        viewBox="0 0 24 24"
        fill="none"
        aria-hidden
      >
        <path d="M6 9l6 6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    );
  }

  return (
    <motion.svg
      className="launch-sf-faq-chevron"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden
      animate={{ rotate: open ? 180 : 0 }}
      transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
    >
      <path d="M6 9l6 6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </motion.svg>
  );
}

export function TrackerLaunchFaq() {
  const rm = useReducedMotion();
  const mobilePerf = useMobilePerf();
  const staticUi = rm || mobilePerf;
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <div className="launch-sf-faq">
      <p className="launch-sf-faq-kicker">
        <span className="launch-sf-faq-kicker-dot" aria-hidden />
        Questions fréquentes
      </p>
      <ul className="launch-sf-faq-list">
        {FAQ_ITEMS.map((item, i) => {
          const open = openIndex === i;
          return (
            <li key={item.q} className="launch-sf-faq-item" data-open={open ? "true" : "false"}>
              <button
                type="button"
                className="launch-sf-faq-trigger"
                aria-expanded={open}
                onClick={() => setOpenIndex(open ? null : i)}
              >
                <span className="launch-sf-faq-question">{item.q}</span>
                <FaqChevron open={open} staticChevron={staticUi} />
              </button>
              {staticUi ? (
                open ? (
                  <div className="launch-sf-faq-panel launch-sf-faq-panel--static">
                    <div className="launch-sf-faq-panel-inner">
                      <p>{item.a}</p>
                    </div>
                  </div>
                ) : null
              ) : (
                <AnimatePresence initial={false}>
                  {open ? (
                    <motion.div
                      key="panel"
                      className="launch-sf-faq-panel"
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={PANEL_TRANSITION}
                    >
                      <div className="launch-sf-faq-panel-inner">
                        <p>{item.a}</p>
                      </div>
                    </motion.div>
                  ) : null}
                </AnimatePresence>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
}
