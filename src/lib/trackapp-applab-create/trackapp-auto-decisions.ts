/** Décisions produit prises par Trackapp — l'utilisateur ne répond pas à ces sujets. */
export const TRACKAPP_APPLAB_AUTO_DECISIONS = [
  {
    id: "stack",
    label: "Stack technique",
    value: "SwiftUI + Xcode, Firebase (Auth, Firestore, Analytics, Crashlytics), RevenueCat",
  },
  {
    id: "language",
    label: "Langue & marché",
    value: "App Store France en priorité, interface et contenus en français",
  },
  {
    id: "onboarding",
    label: "Onboarding",
    value: "3 à 5 écrans qui démontrent la valeur avant toute création de compte",
  },
  {
    id: "paywall",
    label: "Moment du paywall",
    value: "Après la première victoire utilisateur — jamais au premier lancement à froid",
  },
  {
    id: "login",
    label: "Page de connexion",
    value: "Sign in with Apple uniquement au moment du paywall (pas avant)",
  },
  {
    id: "notifications",
    label: "Notifications",
    value: "Opt-in après démo de valeur ; rappels streak max 1 par jour",
  },
  {
    id: "offline",
    label: "Mode offline",
    value: "Lecture locale des données essentielles ; sync Firestore quand réseau disponible",
  },
] as const;

export const TRACKAPP_APPLAB_DEFAULT_CONSTRAINTS = {
  mustHave:
    "Funnel complet : welcome → onboarding → paywall → winback → home. États loading/empty/error. Conformité App Review.",
  mustNot:
    "Pas de login obligatoire avant valeur. Pas de placeholder UI en release. Pas de Supabase ni backend custom.",
} as const;
