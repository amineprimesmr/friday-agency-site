"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useState } from "react";

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
    a: "Trackapp est à 29 € / mois ou 59 € à vie (paiement unique). L’affiliation peut rembourser une partie de votre abonnement dès votre premier filleul actif.",
  },
  {
    q: "Puis-je annuler quand je veux ?",
    a: "Pour l’offre mensuelle, oui : vous gérez votre abonnement depuis votre espace et vous résiliez en un clic. L’accès à vie ne nécessite aucun renouvellement.",
  },
] as const;

const PANEL_TRANSITION = { duration: 0.34, ease: [0.22, 1, 0.36, 1] as const };

function FaqChevron({ open }: { open: boolean }) {
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
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <div className="launch-sf-faq">
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
                <FaqChevron open={open} />
              </button>
              <AnimatePresence initial={false}>
                {open ? (
                  <motion.div
                    key="panel"
                    className="launch-sf-faq-panel"
                    initial={rm ? false : { height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={rm ? undefined : { height: 0, opacity: 0 }}
                    transition={rm ? { duration: 0.12 } : PANEL_TRANSITION}
                  >
                    <div className="launch-sf-faq-panel-inner">
                      <p>{item.a}</p>
                    </div>
                  </motion.div>
                ) : null}
              </AnimatePresence>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
