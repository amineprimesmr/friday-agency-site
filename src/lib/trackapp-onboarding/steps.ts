import type { OnboardingStep } from "@/lib/trackapp-onboarding/types";

export const TRACKAPP_ONBOARDING_STEPS: readonly OnboardingStep[] = [
  {
    id: "experience",
    kind: "single",
    section: "Profil créateur",
    title: "Quel est votre niveau aujourd'hui ?",
    options: [
      { id: "beginner", label: "Débutant total", description: "Je n'ai jamais publié d'app" },
      { id: "learning", label: "En apprentissage", description: "J'ai testé des idées ou des prototypes" },
      { id: "shipped", label: "Déjà publié", description: "Au moins une app sur l'App Store" },
      { id: "pro", label: "Créateur confirmé", description: "Plusieurs apps ou revenus récurrents" },
    ],
  },
  {
    id: "frustration",
    kind: "single",
    section: "Objectifs",
    title: "Qu'est-ce qui vous bloque le plus aujourd'hui ?",
    options: [
      { id: "ideas", label: "Trouver la bonne idée / niche" },
      { id: "build", label: "Construire l'app techniquement" },
      { id: "marketing", label: "Attirer des utilisateurs", description: "Être visible sur l'App Store, créer du contenu, lancer des pubs" },
      { id: "monetization", label: "Monétisation & pricing" },
    ],
  },
  {
    id: "likert_advantage",
    kind: "likert",
    section: "Profil créateur",
    statement: "Je crois que l'IA est mon avantage injuste pour lancer plus vite que la concurrence",
    likertGradient: "green",
  },
  {
    id: "likert_focus",
    kind: "likert",
    section: "Profil créateur",
    statement: "Je veux me concentrer sur mes idées, pas passer des heures sur la technique",
    likertGradient: "blue",
  },
  {
    id: "social_proof",
    kind: "interstitial",
    section: "Communauté",
    badge: "Preuve sociale",
    title: "DES CRÉATEURS LANCENT 3× PLUS VITE AVEC TRACKAPP",
    subtitle:
      "Recherche App Store, analyse IA, prompts Xcode et stratégie de monétisation — tout au même endroit.",
    gradient: "lime",
  },
  {
    id: "revenue_goal",
    kind: "single",
    section: "Objectifs créateur",
    title: "Quel revenu mensuel visez-vous avec vos apps ?",
    options: [
      { id: "1k-3k", label: "1 000 – 3 000 €", description: "Activité secondaire rentable" },
      { id: "3k-7k", label: "3 000 – 7 000 €", description: "Vivre de la vente d'app iOS" },
      { id: "10k+", label: "10 000 €+", description: "Scaler mon projet" },
    ],
  },
  {
    id: "monetization_model",
    kind: "single",
    section: "Monétisation",
    title: "Comment souhaitez-vous monétiser ?",
    options: [
      {
        id: "subscriptions",
        label: "Apps à abonnement",
        description: "MRR, paywall, essai gratuit — revenus récurrents in-app",
      },
      {
        id: "sell_apps",
        label: "Vendre des apps",
        description: "Flip, portfolio ou acquisition — vous vendez l'app tout entière",
      },
      {
        id: "freemium_iap",
        label: "Freemium + achats",
        description: "App gratuite, revenus via achats in-app ponctuels ou packs",
      },
    ],
  },
  {
    id: "monetize",
    kind: "interstitial",
    section: "Monétisation",
    badge: "Votre objectif",
    title: "MONÉTISE AVEC DES ABONNEMENTS IN-APP",
    subtitle:
      "Trackapp analyse les apps qui gagnent, leurs IAP et vous propose un plan de monétisation adapté à votre niche.",
    gradient: "gold",
  },
  {
    id: "project_status",
    kind: "single",
    section: "Votre parcours",
    title: "Avez-vous déjà un projet d'app en tête, ou souhaitez-vous plutôt…",
    options: [
      {
        id: "has_project",
        label: "J'ai une idée d'app",
        description: "Je connais l'angle — je veux avancer dans AppLAB",
      },
      {
        id: "no_project",
        label: "Pas encore d'idée",
        description: "Aidez-moi à trouver les meilleures apps à lancer sur l'App Store",
      },
    ],
  },
  {
    id: "project_stage",
    kind: "single",
    branch: "defined",
    section: "Votre projet",
    title: "Où en êtes-vous avec votre projet ?",
    options: [
      { id: "idea", label: "Idée / concept", description: "Nom ou angle défini, pas encore de build" },
      { id: "building", label: "En cours de build", description: "Prototype ou dev en cours" },
      { id: "live", label: "Déjà sur l'App Store", description: "App publiée — je veux optimiser ou pivoter" },
    ],
  },
  {
    id: "project_name",
    kind: "project",
    branch: "defined",
    section: "Votre projet",
    title: "Comment s'appelle votre projet ?",
    subtitle: "Ce nom apparaîtra dans votre espace AppLAB et votre formation Trackapp.",
  },
  {
    id: "referral",
    kind: "chips",
    section: "Motivation",
    title: "COMMENT AVEZ-VOUS ENTENDU PARLER DE TRACKAPP ?",
    subtitle: "Ça nous aide à améliorer le produit pour vous.",
    options: [
      { id: "instagram", label: "Instagram", icon: "📸" },
      { id: "twitter", label: "Twitter / X", icon: "𝕏" },
      { id: "tiktok", label: "TikTok", icon: "🎵" },
      { id: "youtube", label: "YouTube", icon: "▶️" },
      { id: "google", label: "Google", icon: "🔍" },
      { id: "linkedin", label: "LinkedIn", icon: "💼" },
      { id: "chatgpt", label: "ChatGPT", icon: "✨" },
      { id: "reddit", label: "Reddit", icon: "👽" },
      { id: "friend", label: "Bouche-à-oreille", icon: "💬" },
      { id: "other", label: "Autre", icon: "⋯" },
    ],
  },
  {
    id: "pro_assistant",
    kind: "interstitial",
    section: "AppLAB",
    badge: "Uniquement sur Trackapp",
    title: "APPLAB — VOTRE COPILOTE PRODUIT",
    subtitle:
      "Analyse IA intégrée à chaque fiche app : opportunité, monétisation, plan d'action — puis export vers Cursor ou Claude.",
    gradient: "violet",
  },
  {
    id: "summary",
    kind: "summary",
    section: "Récapitulatif",
    title: "RÉCAP DE VOTRE PARCOURS CRÉATEUR",
  },
] as const;

export function onboardingAnswerKey(
  stepId: string,
): keyof import("@/lib/trackapp-onboarding/types").TrackappOnboardingAnswers | "project_name" {
  const map: Record<
    string,
    keyof import("@/lib/trackapp-onboarding/types").TrackappOnboardingAnswers | "project_name"
  > = {
    project_status: "project_status",
    experience: "experience",
    frustration: "frustration",
    likert_advantage: "likert_advantage",
    likert_focus: "likert_focus",
    revenue_goal: "revenue_goal",
    monetization_model: "monetization_model",
    referral: "referral",
    project_stage: "project_stage",
    project_name: "project_name",
  };
  return map[stepId] ?? "experience";
}
