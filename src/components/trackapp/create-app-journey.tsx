"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

type MediaSlot = {
  type: "image" | "video" | "screen";
  title: string;
  note: string;
};

type JourneyModule = {
  id: string;
  eyebrow: string;
  title: string;
  promise: string;
  outcome: string;
  tools: string[];
  lessons: string[];
  actions: string[];
  deliverables: string[];
  validation: string[];
  prompt: string;
  media: MediaSlot[];
};

const STORAGE_KEY = "trackapp-create-app-progress:v1";

const MODULES: JourneyModule[] = [
  {
    id: "positionnement",
    eyebrow: "Fondation",
    title: "Trouver l'idee qui merite d'etre construite",
    promise: "Partir d'une opportunite claire, pas d'une envie vague.",
    outcome: "Une fiche projet simple : cible, probleme, promesse, business model, risque principal.",
    tools: ["Tracker App Store", "Notes", "Pinterest"],
    lessons: [
      "Une bonne app commence par une douleur precise ou un desir tres fort.",
      "Le meilleur MVP est souvent une seule promesse, pas dix fonctionnalites.",
      "Une app rentable doit avoir un moment ou l'utilisateur comprend pourquoi payer.",
    ],
    actions: [
      "Ecris 10 idees d'apps sans juger.",
      "Choisis 3 idees avec une cible claire.",
      "Pour chaque idee, note le probleme, la frequence d'utilisation et le potentiel de paiement.",
      "Garde l'idee la plus simple a expliquer en une phrase.",
    ],
    deliverables: [
      "Nom provisoire de l'app.",
      "Persona principal.",
      "Promesse en une phrase.",
      "Modele economique provisoire.",
    ],
    validation: [
      "Je sais pour qui je construis.",
      "Je sais quel probleme l'app resout.",
      "Je peux expliquer l'app en moins de 15 secondes.",
      "J'ai choisi un modele business provisoire.",
    ],
    prompt:
      "Agis comme un product strategist iOS. Aide-moi a transformer cette idee en concept d'app rentable. Donne-moi : cible, probleme, promesse, MVP, risque principal, modele economique, et 5 noms possibles. Idee : [COLLE TON IDEE].",
    media: [
      {
        type: "image",
        title: "Exemple de fiche idee",
        note: "Image pertinente : capture d'une fiche Notion/Notes avec cible, promesse, probleme, modele business.",
      },
      {
        type: "video",
        title: "Mini-demo de recherche d'idee",
        note: "Video pertinente : toi qui pars d'une niche et remplis la fiche en direct.",
      },
    ],
  },
  {
    id: "marche",
    eyebrow: "Recherche",
    title: "Analyser le marche App Store",
    promise: "Comprendre ce qui existe deja pour ne pas coder a l'aveugle.",
    outcome: "3 concurrents, leurs forces/faiblesses, et ton angle de differenciation.",
    tools: ["Tracker App Store", "App Store", "Apple Ads"],
    lessons: [
      "Un concurrent qui gagne de l'argent est une preuve de marche, pas une menace.",
      "Les screenshots revelent souvent la proposition de valeur reelle.",
      "Les reviews negatives donnent les meilleures idees de features.",
    ],
    actions: [
      "Cherche 5 mots-cles autour de ton idee.",
      "Ouvre 10 apps similaires dans le Tracker.",
      "Note leur prix, leurs notes, leurs screenshots, leur promesse et leurs reviews negatives.",
      "Garde 3 concurrents directs et 3 angles pour faire mieux.",
    ],
    deliverables: [
      "Liste de 3 concurrents.",
      "Top 5 mots-cles.",
      "3 frustrations utilisateurs.",
      "Angle de differenciation.",
    ],
    validation: [
      "J'ai analyse au moins 3 apps concurrentes.",
      "J'ai identifie des reviews negatives exploitables.",
      "J'ai une difference claire pour ma V1.",
    ],
    prompt:
      "Analyse ces concurrents App Store : [COLLE LES 3 APPS]. Trouve leurs promesses, leurs faiblesses, les opportunites, les mots-cles probables et une strategie pour lancer une app plus simple mais plus desirable.",
    media: [
      {
        type: "screen",
        title: "Capture Tracker",
        note: "Image pertinente : capture du Tracker avec les apps concurrentes et leurs metrics.",
      },
      {
        type: "video",
        title: "Analyse d'une fiche App Store",
        note: "Video pertinente : walkthrough d'une fiche concurrente, screenshots, notes et reviews.",
      },
    ],
  },
  {
    id: "stack",
    eyebrow: "Setup",
    title: "Installer la stack logicielle",
    promise: "Avoir tous les outils prets avant de generer le projet.",
    outcome: "Un environnement capable de coder, builder, tester, publier et mesurer.",
    tools: ["Apple Developer Program", "Xcode", "Cursor", "Firebase", "RevenueCat", "Sentry"],
    lessons: [
      "Cursor est l'atelier principal : il comprend le code et modifie plusieurs fichiers.",
      "Xcode reste indispensable pour compiler et envoyer sur TestFlight.",
      "Le compte Apple Developer coute 99 $/an, mais un credit promo Apple Ads d'environ 100 $ peut compenser le depart si tu es eligible.",
    ],
    actions: [
      "Installer Xcode depuis Apple.",
      "Installer Cursor et connecter ton compte IA.",
      "Creer ou preparer le compte Apple Developer.",
      "Creer un projet Firebase vide.",
      "Creer un compte RevenueCat si l'app aura un abonnement.",
    ],
    deliverables: [
      "Xcode installe.",
      "Cursor pret.",
      "Firebase cree.",
      "Checklist publication Apple comprise.",
    ],
    validation: [
      "Xcode s'ouvre correctement.",
      "Cursor est installe.",
      "Je sais ou gerer App Store Connect.",
      "Firebase est pret ou volontairement reporte.",
    ],
    prompt:
      "Tu es mon copilote technique. Voici mon niveau, mon idee et mes outils. Propose la stack la plus simple pour creer cette app iOS avec l'IA, en expliquant ce que je dois installer maintenant et ce que je peux reporter.",
    media: [
      {
        type: "image",
        title: "Checklist outils",
        note: "Image pertinente : grille des logiciels avec statut Installe / A faire / Plus tard.",
      },
      {
        type: "video",
        title: "Setup Cursor + Xcode",
        note: "Video pertinente : installation rapide et verification que le simulateur iOS fonctionne.",
      },
    ],
  },
  {
    id: "design",
    eyebrow: "Design",
    title: "Construire la direction visuelle",
    promise: "Eviter l'app generique en donnant une vraie direction a l'IA.",
    outcome: "Moodboard, palette, style, references d'ecrans et assets initiaux.",
    tools: ["Pinterest", "Mobbin", "Higgsfield", "Ressources Trackapp"],
    lessons: [
      "L'IA code mieux quand tu lui donnes une direction visuelle precise.",
      "Un bon design system V1 tient en quelques couleurs, espacements, cards et boutons.",
      "Les references doivent guider, pas etre copiees pixel par pixel.",
    ],
    actions: [
      "Chercher des inspirations Pinterest avec 10 mots-cles.",
      "Sauvegarder 5 references Mobbin ou App Store.",
      "Generer 3 directions visuelles dans Higgsfield.",
      "Choisir une palette, une vibe et 3 ecrans prioritaires.",
    ],
    deliverables: [
      "Moodboard.",
      "Palette couleurs.",
      "Style de composants.",
      "3 references d'ecrans.",
    ],
    validation: [
      "J'ai au moins 5 references visuelles.",
      "J'ai choisi une direction unique.",
      "Je sais quels ecrans doivent etre les plus beaux.",
    ],
    prompt:
      "A partir de ces references visuelles [DECRIS/COLLE LES REFERENCES], cree une direction artistique mobile iOS : palette, typographie, composants, style de boutons, cards, empty states, onboarding et paywall.",
    media: [
      {
        type: "image",
        title: "Moodboard Pinterest",
        note: "Image pertinente : collage de 6 a 9 inspirations visuelles.",
      },
      {
        type: "video",
        title: "Generation Higgsfield",
        note: "Video pertinente : creation de 3 directions visuelles et choix final.",
      },
    ],
  },
  {
    id: "spec",
    eyebrow: "Produit",
    title: "Ecrire la specification MVP",
    promise: "Transformer l'idee en plan que Cursor peut executer.",
    outcome: "Une spec d'app claire : ecrans, donnees, flows, et limites de V1.",
    tools: ["Cursor", "Claude", "Notes"],
    lessons: [
      "Une spec doit dire quoi construire et quoi ne pas construire.",
      "Le MVP doit etre assez petit pour etre fini, mais assez complet pour etre testable.",
      "Chaque ecran doit avoir un role dans l'activation ou la monetisation.",
    ],
    actions: [
      "Lister les ecrans obligatoires.",
      "Lister les actions utilisateur.",
      "Definir les donnees stockees.",
      "Ecrire les cas vides, erreurs, chargements.",
      "Reporter tout ce qui n'est pas indispensable.",
    ],
    deliverables: [
      "Liste des ecrans.",
      "Flow utilisateur.",
      "Schema de donnees simple.",
      "Scope V1 / Plus tard.",
    ],
    validation: [
      "Chaque ecran a un objectif.",
      "Le flow principal est clair.",
      "La V1 peut etre codee sans ambiguite.",
    ],
    prompt:
      "Transforme mon concept en specification MVP pour une app iOS. Inclus : objectifs, ecrans, composants, donnees, parcours utilisateur, edge cases, empty states, et liste claire de ce qui est hors scope.",
    media: [
      {
        type: "image",
        title: "Schema du flow",
        note: "Image pertinente : diagramme simple onboarding -> home -> action principale -> paywall.",
      },
    ],
  },
  {
    id: "prompt-master",
    eyebrow: "IA",
    title: "Creer le prompt master Cursor",
    promise: "Donner a l'IA un brief complet pour generer une base saine.",
    outcome: "Un prompt initial pret a coller dans Cursor.",
    tools: ["Cursor", "Claude"],
    lessons: [
      "Le prompt master doit contenir produit, design, architecture, contraintes et definition de fini.",
      "Demande une implementation par etapes, pas un enorme dump impossible a verifier.",
      "Cursor doit toujours expliquer les fichiers touches et les commandes a lancer.",
    ],
    actions: [
      "Choisir la techno : SwiftUI natif recommande pour iOS pur, ou Expo si multi-plateforme.",
      "Coller la spec MVP.",
      "Coller la direction design.",
      "Demander une architecture simple.",
      "Demander une premiere version navigable.",
    ],
    deliverables: [
      "Prompt master.",
      "Plan de fichiers.",
      "Premier projet cree.",
      "Commande de lancement documentee.",
    ],
    validation: [
      "Le prompt master est pret.",
      "Le projet se lance.",
      "Je comprends ou sont les ecrans principaux.",
    ],
    prompt:
      "Tu es Cursor, senior iOS engineer et product designer. Construis la V1 de mon app selon cette spec [SPEC], cette direction design [DESIGN], avec une architecture simple, des composants propres, des states loading/empty/error, et avance module par module en me demandant validation apres chaque ecran.",
    media: [
      {
        type: "video",
        title: "Premier prompt Cursor",
        note: "Video pertinente : collage du prompt master, generation du projet, premier lancement.",
      },
      {
        type: "screen",
        title: "Arborescence projet",
        note: "Image pertinente : structure des dossiers apres generation.",
      },
    ],
  },
  {
    id: "construction",
    eyebrow: "Build",
    title: "Construire l'app ecran par ecran",
    promise: "Ne pas se noyer : un ecran, une validation, un commit mental.",
    outcome: "Une app navigable avec onboarding, home, fonctionnalite principale, settings et paywall.",
    tools: ["Cursor", "Xcode", "Ressources Trackapp"],
    lessons: [
      "Le bon rythme : generer, lancer, tester, corriger, valider.",
      "Les empty states et loading states font partie du produit, pas du bonus.",
      "Chaque ecran doit etre fluide avant d'ajouter le suivant.",
    ],
    actions: [
      "Construire l'onboarding.",
      "Construire la home.",
      "Construire l'action principale.",
      "Construire les settings.",
      "Construire le paywall.",
      "Tester la navigation complete.",
    ],
    deliverables: [
      "Onboarding fonctionnel.",
      "Home fonctionnelle.",
      "Feature principale utilisable.",
      "Paywall present.",
    ],
    validation: [
      "L'app compile sans erreur.",
      "La navigation principale fonctionne.",
      "Chaque ecran a un etat vide et un etat charge.",
      "Le design est coherent.",
    ],
    prompt:
      "Construis uniquement l'ecran suivant : [NOM ECRAN]. Respecte le design system, ajoute loading/empty/error states, garde le code simple, puis donne-moi la checklist de test manuel pour valider avant de continuer.",
    media: [
      {
        type: "video",
        title: "Avant/apres ecran",
        note: "Video pertinente : montrer l'ecran dans le simulateur et les corrections Cursor.",
      },
    ],
  },
  {
    id: "backend",
    eyebrow: "Donnees",
    title: "Brancher Firebase et les donnees",
    promise: "Passer d'une maquette locale a une app qui sauvegarde vraiment.",
    outcome: "Auth, base de donnees, regles et donnees persistantes.",
    tools: ["Firebase", "Cursor", "Xcode"],
    lessons: [
      "Commence par le minimum : auth + collection principale.",
      "Les regles de securite sont aussi importantes que l'UI.",
      "Les donnees mock doivent etre remplacees progressivement, pas en un seul big bang.",
    ],
    actions: [
      "Creer le projet Firebase.",
      "Ajouter la config a l'app.",
      "Brancher auth si necessaire.",
      "Brancher lecture/ecriture.",
      "Ecrire les regles de securite.",
    ],
    deliverables: [
      "Firebase connecte.",
      "Lecture/ecriture fonctionnelle.",
      "Regles de securite basiques.",
      "Donnees visibles apres relance.",
    ],
    validation: [
      "Les donnees persistent apres fermeture.",
      "Un utilisateur ne peut pas lire les donnees d'un autre.",
      "L'app garde un fallback si le reseau echoue.",
    ],
    prompt:
      "Integre Firebase dans cette app. Fais-le proprement : configuration, service de donnees, auth si necessaire, regles de securite proposees, gestion loading/error/offline, et tests manuels.",
    media: [
      {
        type: "screen",
        title: "Console Firebase",
        note: "Image pertinente : collection Firestore avec une donnee creee depuis l'app.",
      },
    ],
  },
  {
    id: "monetisation",
    eyebrow: "Revenu",
    title: "Ajouter la monetisation",
    promise: "Transformer l'app en business, pas seulement en projet.",
    outcome: "Paywall, offres, abonnement ou achat, test sandbox.",
    tools: ["RevenueCat", "App Store Connect", "StoreKit", "Cursor"],
    lessons: [
      "Un paywall doit vendre un resultat, pas une liste de features.",
      "Le meilleur moment pour afficher un paywall vient apres une prise de conscience de valeur.",
      "RevenueCat simplifie beaucoup la gestion des droits premium.",
    ],
    actions: [
      "Choisir l'offre : mensuel (29 €) ou accès à vie (59 €).",
      "Creer les produits dans App Store Connect.",
      "Configurer RevenueCat.",
      "Construire le paywall.",
      "Tester en sandbox.",
    ],
    deliverables: [
      "Offres configurees.",
      "Paywall integre.",
      "Achat sandbox teste.",
      "Etat premium debloque.",
    ],
    validation: [
      "Le paywall apparait au bon moment.",
      "L'achat sandbox fonctionne.",
      "L'app sait restaurer les achats.",
    ],
    prompt:
      "Ajoute une monetisation propre avec RevenueCat/StoreKit. Cree le paywall, les etats premium/free, restore purchases, gestion erreurs, et une checklist de test sandbox.",
    media: [
      {
        type: "image",
        title: "Paywall final",
        note: "Image pertinente : screenshot du paywall avec prix, benefices, CTA et restore.",
      },
      {
        type: "video",
        title: "Achat sandbox",
        note: "Video pertinente : test complet achat -> premium debloque.",
      },
    ],
  },
  {
    id: "qualite",
    eyebrow: "Polish",
    title: "Rendre l'app fluide et publiable",
    promise: "Passer de prototype a app qui donne confiance.",
    outcome: "Performance, animations, crash-free, UX propre.",
    tools: ["Xcode Instruments", "Sentry", "PostHog", "Cursor"],
    lessons: [
      "Une app lente donne l'impression d'etre amateur meme si l'idee est bonne.",
      "Les animations doivent aider la comprehension, pas decorer partout.",
      "Les bugs silencieux tuent la retention.",
    ],
    actions: [
      "Tester sur simulateur et vrai iPhone.",
      "Verifier les temps de chargement.",
      "Simplifier les animations lourdes.",
      "Brancher crash reporting.",
      "Verifier accessibilite et textes.",
    ],
    deliverables: [
      "Checklist QA.",
      "Crash reporting actif.",
      "Events analytics essentiels.",
      "App fluide sur vrai device.",
    ],
    validation: [
      "Aucun crash dans le flow principal.",
      "Pas de jank visible sur les ecrans cles.",
      "Les erreurs reseau sont gerees.",
    ],
    prompt:
      "Fais un audit qualite de cette app iOS : performance, bugs, UX, accessibilite, states manquants, animations lourdes. Donne-moi les corrections prioritaires et applique-les une par une.",
    media: [
      {
        type: "video",
        title: "Test sur iPhone",
        note: "Video pertinente : parcours complet filme sur device reel.",
      },
    ],
  },
  {
    id: "store",
    eyebrow: "Publication",
    title: "Preparer l'App Store",
    promise: "Transformer ton build en fiche qui convertit.",
    outcome: "Build TestFlight, screenshots, description, mots-cles, privacy labels.",
    tools: ["App Store Connect", "Xcode", "Higgsfield", "Apple Developer"],
    lessons: [
      "La fiche App Store est une landing page.",
      "Les screenshots doivent expliquer la valeur sans lire la description.",
      "Les mots-cles doivent venir de l'analyse marche, pas de l'inspiration du moment.",
    ],
    actions: [
      "Creer bundle ID.",
      "Envoyer un build TestFlight.",
      "Creer screenshots.",
      "Ecrire titre, sous-titre, description.",
      "Remplir privacy labels.",
      "Soumettre en review.",
    ],
    deliverables: [
      "Build TestFlight.",
      "Fiche App Store complete.",
      "Screenshots finalises.",
      "Mots-cles choisis.",
    ],
    validation: [
      "Le build est sur TestFlight.",
      "Les screenshots racontent l'app.",
      "La fiche est prete a soumettre.",
    ],
    prompt:
      "Aide-moi a preparer ma fiche App Store. Cree : titre, sous-titre, description, mots-cles, texte screenshots, promesse principale, privacy notes et checklist avant soumission.",
    media: [
      {
        type: "image",
        title: "Screenshots App Store",
        note: "Image pertinente : mockup des 3 a 5 premiers screenshots.",
      },
    ],
  },
  {
    id: "lancement",
    eyebrow: "Croissance",
    title: "Lancer et obtenir les premiers utilisateurs",
    promise: "Ne pas publier dans le vide.",
    outcome: "Plan de lancement 7 jours, Apple Ads, contenu court, feedback loop.",
    tools: ["Apple Ads", "TikTok/Reels", "PostHog", "Tracker"],
    lessons: [
      "Le lancement sert a apprendre vite, pas a devenir viral instantanement.",
      "Apple Ads permet de tester des mots-cles avec intention d'achat.",
      "Le feedback utilisateur doit revenir dans le produit chaque semaine.",
    ],
    actions: [
      "Configurer une campagne Apple Ads simple.",
      "Preparer 10 videos courtes.",
      "Poster dans 3 communautes pertinentes.",
      "Suivre activation, retention et conversion.",
      "Faire une liste de corrections V1.1.",
    ],
    deliverables: [
      "Campagne Apple Ads.",
      "Plan contenu 7 jours.",
      "Dashboard metrics.",
      "Backlog V1.1.",
    ],
    validation: [
      "Une campagne est prete ou lancee.",
      "Les events cles sont suivis.",
      "J'ai un plan d'iteration post-lancement.",
    ],
    prompt:
      "Cree un plan de lancement 7 jours pour cette app. Inclus Apple Ads, mots-cles, scripts TikTok/Reels, messages communautes, metrics a suivre et decisions a prendre selon les resultats.",
    media: [
      {
        type: "video",
        title: "Creation campagne Apple Ads",
        note: "Video pertinente : creation d'une campagne simple exact match.",
      },
      {
        type: "image",
        title: "Dashboard lancement",
        note: "Image pertinente : tableau activation, conversion, retention, cout par installation.",
      },
    ],
  },
];

function loadProgress(): Set<string> {
  if (typeof window === "undefined") return new Set();
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    const parsed = raw ? (JSON.parse(raw) as { done?: unknown }) : null;
    return new Set(Array.isArray(parsed?.done) ? parsed.done.filter((x): x is string => typeof x === "string") : []);
  } catch {
    return new Set();
  }
}

function saveProgress(done: Set<string>) {
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify({ done: [...done] }));
}

export function CreateAppJourney() {
  const [done, setDone] = useState<Set<string>>(() => new Set());
  const [activeId, setActiveId] = useState(MODULES[0]?.id ?? "");

  useEffect(() => {
    const stored = loadProgress();
    setDone(stored);
    const firstLocked = MODULES.find((mod, index) => index > 0 && !stored.has(MODULES[index - 1]!.id));
    const next = firstLocked ? MODULES[Math.max(0, MODULES.indexOf(firstLocked) - 1)] : MODULES.find((m) => !stored.has(m.id));
    setActiveId((next ?? MODULES[MODULES.length - 1])?.id ?? "");
  }, []);

  const activeIndex = Math.max(0, MODULES.findIndex((m) => m.id === activeId));
  const active = MODULES[activeIndex] ?? MODULES[0]!;
  const completedCount = done.size;
  const progress = Math.round((completedCount / MODULES.length) * 100);

  const unlockedIds = useMemo(() => {
    const ids = new Set<string>();
    for (let i = 0; i < MODULES.length; i++) {
      if (i === 0 || done.has(MODULES[i - 1]!.id)) ids.add(MODULES[i]!.id);
    }
    return ids;
  }, [done]);

  function selectModule(id: string) {
    if (!unlockedIds.has(id)) return;
    setActiveId(id);
  }

  function toggleActive() {
    setDone((prev) => {
      const next = new Set(prev);
      if (next.has(active.id)) next.delete(active.id);
      else next.add(active.id);
      saveProgress(next);
      return next;
    });
  }

  function goNext() {
    const next = MODULES[activeIndex + 1];
    if (!next || !done.has(active.id)) return;
    setActiveId(next.id);
  }

  return (
    <div className="relative z-[1] dashboard-main pb-16">
      <section className="dashboard-section">
        <p className="trackapp-workspace-hero-kicker">Parcours IA complet</p>
        <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h1 className="trackapp-workspace-hero-title">Créer mon app de A à Z</h1>
            <p className="trackapp-workspace-hero-desc max-w-[72ch]">
              Avance module par module, construis l&apos;app en direct avec l&apos;IA, valide chaque livrable, puis débloque la suite.
            </p>
          </div>
          <div className="rounded-[22px] border border-[var(--dash-border)] bg-white px-5 py-4 shadow-[var(--dash-shadow)]">
            <p className="text-[0.72rem] font-bold uppercase tracking-[0.16em] text-[var(--dash-muted)]">Progression</p>
            <p className="mt-1 text-3xl font-black tracking-tight text-[var(--dash-text)]">{progress}%</p>
            <div className="mt-3 h-2 w-48 overflow-hidden rounded-full bg-slate-100">
              <div className="h-full rounded-full bg-[#0f172a] transition-all duration-300" style={{ width: `${progress}%` }} />
            </div>
          </div>
        </div>
      </section>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,0.82fr)_minmax(0,1.35fr)]">
        <aside className="rounded-[24px] border border-[var(--dash-border)] bg-white p-3 shadow-[var(--dash-shadow)] xl:sticky xl:top-20 xl:self-start">
          <ol className="m-0 list-none space-y-2 p-0">
            {MODULES.map((mod, index) => {
              const unlocked = unlockedIds.has(mod.id);
              const selected = mod.id === active.id;
              const isDone = done.has(mod.id);
              return (
                <li key={mod.id}>
                  <button
                    type="button"
                    disabled={!unlocked}
                    onClick={() => selectModule(mod.id)}
                    className={[
                      "flex w-full items-center gap-3 rounded-[18px] px-3 py-3 text-left transition",
                      selected ? "bg-slate-950 text-white" : "bg-white text-[var(--dash-text)] hover:bg-slate-50",
                      !unlocked ? "cursor-not-allowed opacity-45" : "",
                    ].join(" ")}
                  >
                    <span
                      className={[
                        "grid h-8 w-8 shrink-0 place-items-center rounded-full text-[0.78rem] font-black",
                        selected ? "bg-white text-slate-950" : isDone ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-500",
                      ].join(" ")}
                    >
                      {isDone ? "✓" : String(index + 1).padStart(2, "0")}
                    </span>
                    <span className="min-w-0">
                      <span className={selected ? "block text-[0.68rem] font-bold uppercase tracking-[0.14em] text-white/55" : "block text-[0.68rem] font-bold uppercase tracking-[0.14em] text-slate-400"}>
                        {mod.eyebrow}
                      </span>
                      <span className="block truncate text-[0.9rem] font-bold">{mod.title}</span>
                    </span>
                  </button>
                </li>
              );
            })}
          </ol>
        </aside>

        <article className="overflow-hidden rounded-[28px] border border-[var(--dash-border)] bg-white shadow-[var(--dash-shadow-lg)]">
          <div className="border-b border-[var(--dash-border)] bg-gradient-to-b from-slate-50 to-white p-6 sm:p-8">
            <div className="mb-4 flex flex-wrap items-center gap-2">
              <span className="rounded-full bg-slate-950 px-3 py-1 text-[0.72rem] font-bold uppercase tracking-[0.14em] text-white">
                Module {activeIndex + 1}
              </span>
              <span className="rounded-full border border-slate-200 bg-white px-3 py-1 text-[0.72rem] font-bold uppercase tracking-[0.14em] text-slate-500">
                {active.eyebrow}
              </span>
            </div>
            <h2 className="m-0 text-[clamp(1.8rem,4vw,3rem)] font-black leading-[0.98] tracking-[-0.06em] text-[var(--dash-text)]">
              {active.title}
            </h2>
            <p className="mt-4 max-w-[62ch] text-[1rem] leading-relaxed text-[var(--dash-muted-light)]">{active.promise}</p>
          </div>

          <div className="grid gap-6 p-6 sm:p-8">
            <section className="rounded-[22px] border border-slate-200 bg-slate-50 p-5">
              <p className="text-[0.72rem] font-bold uppercase tracking-[0.16em] text-slate-500">Résultat attendu</p>
              <p className="mt-2 text-[1rem] font-semibold leading-relaxed text-slate-800">{active.outcome}</p>
            </section>

            <section className="grid gap-4 lg:grid-cols-2">
              <div className="rounded-[22px] border border-[var(--dash-border)] p-5">
                <h3 className="m-0 text-[1rem] font-bold text-[var(--dash-text)]">Ce que tu dois comprendre</h3>
                <ul className="mt-4 space-y-3 pl-0">
                  {active.lessons.map((item) => (
                    <li key={item} className="flex gap-3 text-[0.92rem] leading-relaxed text-[var(--dash-muted-light)]">
                      <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-slate-900" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="rounded-[22px] border border-[var(--dash-border)] p-5">
                <h3 className="m-0 text-[1rem] font-bold text-[var(--dash-text)]">Actions à faire</h3>
                <ol className="mt-4 space-y-3 pl-0">
                  {active.actions.map((item, index) => (
                    <li key={item} className="flex gap-3 text-[0.92rem] leading-relaxed text-[var(--dash-muted-light)]">
                      <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-slate-100 text-[0.72rem] font-bold text-slate-600">
                        {index + 1}
                      </span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ol>
              </div>
            </section>

            <section className="rounded-[22px] border border-[var(--dash-border)] p-5">
              <h3 className="m-0 text-[1rem] font-bold text-[var(--dash-text)]">Outils utilisés</h3>
              <div className="mt-4 flex flex-wrap gap-2">
                {active.tools.map((tool) => (
                  <span key={tool} className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-[0.78rem] font-semibold text-slate-700">
                    {tool}
                  </span>
                ))}
              </div>
            </section>

            <section className="grid gap-4 lg:grid-cols-2">
              <div className="rounded-[22px] border border-[var(--dash-border)] p-5">
                <h3 className="m-0 text-[1rem] font-bold text-[var(--dash-text)]">Livrables à produire</h3>
                <ul className="mt-4 space-y-2 pl-0">
                  {active.deliverables.map((item) => (
                    <li key={item} className="rounded-2xl bg-slate-50 px-4 py-3 text-[0.9rem] font-medium text-slate-700">
                      {item}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="rounded-[22px] border border-[var(--dash-border)] p-5">
                <h3 className="m-0 text-[1rem] font-bold text-[var(--dash-text)]">Validation pour débloquer la suite</h3>
                <ul className="mt-4 space-y-2 pl-0">
                  {active.validation.map((item) => (
                    <li key={item} className="flex gap-3 rounded-2xl bg-slate-50 px-4 py-3 text-[0.9rem] font-medium text-slate-700">
                      <span className="text-emerald-600">✓</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </section>

            <section className="rounded-[22px] border border-slate-200 bg-slate-950 p-5 text-white">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <h3 className="m-0 text-[1rem] font-bold">Prompt IA à utiliser</h3>
                <span className="rounded-full bg-white/10 px-3 py-1 text-[0.72rem] font-bold uppercase tracking-[0.14em] text-white/60">
                  Copier dans Cursor/Claude
                </span>
              </div>
              <p className="mt-4 whitespace-pre-wrap rounded-2xl border border-white/10 bg-white/[0.04] p-4 font-mono text-[0.82rem] leading-relaxed text-white/78">
                {active.prompt}
              </p>
            </section>

            <section className="rounded-[22px] border border-[var(--dash-border)] p-5">
              <h3 className="m-0 text-[1rem] font-bold text-[var(--dash-text)]">Images / vidéos à ajouter dans ce module</h3>
              <div className="mt-4 grid gap-3 md:grid-cols-2">
                {active.media.map((slot) => (
                  <div key={`${slot.type}-${slot.title}`} className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-4">
                    <p className="text-[0.72rem] font-bold uppercase tracking-[0.16em] text-slate-500">
                      {slot.type === "video" ? "Vidéo" : slot.type === "screen" ? "Capture écran" : "Image"}
                    </p>
                    <p className="mt-2 font-bold text-slate-900">{slot.title}</p>
                    <p className="mt-1 text-[0.86rem] leading-relaxed text-slate-600">{slot.note}</p>
                  </div>
                ))}
              </div>
            </section>

            <div className="flex flex-col gap-3 border-t border-[var(--dash-border)] pt-6 sm:flex-row sm:items-center sm:justify-between">
              <button
                type="button"
                onClick={toggleActive}
                className={done.has(active.id) ? "trackapp-btn-ghost-dash" : "trackapp-btn-primary-dash"}
              >
                {done.has(active.id) ? "Étape validée ✓" : "Valider cette étape"}
              </button>
              <button
                type="button"
                onClick={goNext}
                disabled={!done.has(active.id) || activeIndex >= MODULES.length - 1}
                className="trackapp-btn-ghost-dash disabled:cursor-not-allowed disabled:opacity-40"
              >
                Passer au module suivant
              </button>
            </div>
          </div>
        </article>
      </div>

      <div className="mt-8 rounded-[22px] border border-[var(--dash-border)] bg-white p-5 text-[0.9rem] leading-relaxed text-[var(--dash-muted-light)] shadow-[var(--dash-shadow)]">
        Ce parcours est volontairement verrouillé : l&apos;objectif n&apos;est pas de lire une formation, mais de construire ton app à chaque module.
        Tu peux compléter la page <Link href="/trackapp/logiciels" className="font-semibold text-[var(--dash-text)] underline-offset-4 hover:underline">Logiciels</Link> en parallèle.
      </div>
    </div>
  );
}
