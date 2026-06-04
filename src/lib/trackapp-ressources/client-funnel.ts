/** Funnel client iOS Trackapp — non négociable pour tout MVP AppLAB. */

export type ClientFunnelStage =
  | "welcome"
  | "onboarding"
  | "paywall"
  | "winback_game"
  | "main_app";

export const TRACKAPP_CLIENT_FUNNEL_STAGES: readonly Readonly<{
  stage: ClientFunnelStage;
  screen_id: string;
  title: string;
  purpose: string;
}>[] = [
  {
    stage: "welcome",
    screen_id: "welcome",
    title: "Welcome / Splash",
    purpose:
      "Premier écran — promesse en 1 phrase, logo, CTA « Commencer ». Pas de login. Durée max 3 s si auto-skip.",
  },
  {
    stage: "onboarding",
    screen_id: "onboarding",
    title: "Onboarding (3–5 étapes)",
    purpose:
      "Démo de valeur, personnalisation légère, permissions (notifs/localisation) APRÈS la démo. Sauvegarde progression.",
  },
  {
    stage: "paywall",
    screen_id: "paywall",
    title: "Paywall principal",
    purpose:
      "RevenueCat / StoreKit — essai gratuit, liste bénéfices, CTA achat, Restore, liens CGU + Privacy. Déclenché après onboarding.",
  },
  {
    stage: "winback_game",
    screen_id: "winback_game",
    title: "Jeu / animation remise (rejet paiement)",
    purpose:
      "Si l'utilisateur ferme ou refuse le paywall : mini-jeu ou animation (roue, scratch, confetti) → offre remise limitée dans le temps → second paywall ou essai prolongé.",
  },
  {
    stage: "main_app",
    screen_id: "home",
    title: "App principale (core)",
    purpose:
      "Accès au cœur de l'app après achat, essai actif, ou mode freemium limité. Tab bar ou navigation racine.",
  },
] as const;

export const CLIENT_FUNNEL_NAV_RULES = [
  "Ordre strict first-run : welcome → onboarding → paywall → (achat OK → home) | (refus/fermeture → winback_game → paywall_remise ou home limité).",
  "Ne jamais afficher le paywall avant la fin de l'onboarding (Guideline 3.1.1).",
  "winback_game : une seule fois par session d'install ; persister `has_seen_winback` en local.",
  "Analytics obligatoires : funnel_welcome_view, funnel_onboarding_complete, funnel_paywall_view, funnel_paywall_dismiss, funnel_winback_view, funnel_purchase_success, funnel_home_view.",
  "État global : enum AppAccess { locked, trial, subscribed, freemium } — contrôle paywall et features.",
] as const;
