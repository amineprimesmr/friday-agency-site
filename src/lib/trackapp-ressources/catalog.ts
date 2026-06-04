import type { ClientFunnelStage } from "@/lib/trackapp-ressources/client-funnel";

export type TrackappResourceCategory =
  | "welcome"
  | "onboarding"
  | "paywall"
  | "winback"
  | "navigation"
  | "animation"
  | "permission"
  | "ui_component"
  | "other";

export type TrackappResourceCatalogEntry = Readonly<{
  id: string;
  title: string;
  stem: string;
  zipStem: string;
  categories: readonly TrackappResourceCategory[];
  funnelStages: readonly ClientFunnelStage[];
  tags: readonly string[];
  description: string;
}>;

/** Catalogue embarqué — disponible en prod même sans dossier média sur le serveur. */
export const TRACKAPP_RESOURCE_CATALOG: readonly TrackappResourceCatalogEntry[] = [
  {
    id: "custom_splash",
    title: "Custom Splash Screen",
    stem: "Custom_SplashScreen",
    zipStem: "Custom_SplashScreen",
    categories: ["welcome"],
    funnelStages: ["welcome"],
    tags: ["splash", "launch", "welcome"],
    description: "Écran de lancement / splash animé SwiftUI.",
  },
  {
    id: "ios_onboarding",
    title: "iOS Style Onboarding",
    stem: "iOSStyleOnBoarding Updated",
    zipStem: "iOSStyleOnBoarding Updated",
    categories: ["onboarding"],
    funnelStages: ["onboarding"],
    tags: ["onboarding", "pager", "tutorial"],
    description: "Onboarding multi-pages style iOS natif.",
  },
  {
    id: "location_onboarding",
    title: "Location Onboarding",
    stem: "LocationOnboarding",
    zipStem: "LocationOnboarding",
    categories: ["onboarding", "permission"],
    funnelStages: ["onboarding"],
    tags: ["location", "permission", "onboarding"],
    description: "Demande permission localisation intégrée à l'onboarding.",
  },
  {
    id: "notification_permission",
    title: "Notification Permission",
    stem: "NotificationPermission",
    zipStem: "NotificationPermission",
    categories: ["permission", "onboarding"],
    funnelStages: ["onboarding"],
    tags: ["notifications", "permission"],
    description: "Écran demande notifications avec copy persuasif.",
  },
  {
    id: "permission_animation",
    title: "Permission Animation",
    stem: "PermissionAnimation",
    zipStem: "PermissionAnimation",
    categories: ["permission", "animation"],
    funnelStages: ["onboarding"],
    tags: ["permission", "animation"],
    description: "Animation pour écrans de permission système.",
  },
  {
    id: "minimal_paywall",
    title: "Minimal Paywall",
    stem: "MinimalPaywall",
    zipStem: "MinimalPaywallView",
    categories: ["paywall"],
    funnelStages: ["paywall"],
    tags: ["paywall", "subscription", "iap"],
    description: "Paywall minimaliste — liste features + CTA abo.",
  },
  {
    id: "paywall_effect",
    title: "Paywall Effect",
    stem: "PayWallEffect",
    zipStem: "PayWallEffect",
    categories: ["paywall", "animation"],
    funnelStages: ["paywall"],
    tags: ["paywall", "animation"],
    description: "Paywall avec effets visuels et hiérarchie premium.",
  },
  {
    id: "awc_animation",
    title: "AWC Animation",
    stem: "AWCAnimation",
    zipStem: "AWCAnimation",
    categories: ["winback", "animation"],
    funnelStages: ["winback_game"],
    tags: ["game", "animation", "winback", "discount"],
    description: "Animation gamifiée — idéal écran remise après rejet paywall.",
  },
  {
    id: "border_beam",
    title: "Border Beam",
    stem: "BorderBeam",
    zipStem: "BorderBeam",
    categories: ["winback", "animation", "ui_component"],
    funnelStages: ["winback_game", "paywall"],
    tags: ["glow", "cta", "premium"],
    description: "Effet bordure lumineuse pour CTA offre limitée.",
  },
  {
    id: "tick_picker",
    title: "Tick Picker",
    stem: "TickPicker",
    zipStem: "TickPickerView",
    categories: ["winback", "ui_component"],
    funnelStages: ["winback_game"],
    tags: ["picker", "wheel", "game"],
    description: "Picker roue — adaptable en mini-jeu remise.",
  },
  {
    id: "custom_bottom_bar",
    title: "Custom Bottom Bar",
    stem: "CustomBottomBar",
    zipStem: "CustomBottomBar",
    categories: ["navigation"],
    funnelStages: ["main_app"],
    tags: ["tabbar", "navigation"],
    description: "Barre d'onglets custom pour l'app principale.",
  },
  {
    id: "morphing_tab_bar",
    title: "Morphing Tab Bar",
    stem: "MorphingTabBarEffect",
    zipStem: "MorphingTabBarEffect",
    categories: ["navigation", "animation"],
    funnelStages: ["main_app"],
    tags: ["tabbar", "morphing", "animation"],
    description: "Tab bar morphing animée.",
  },
  {
    id: "ft_bar",
    title: "FT Bar",
    stem: "FTBar",
    zipStem: "FTBar",
    categories: ["navigation"],
    funnelStages: ["main_app"],
    tags: ["tabbar", "navigation"],
    description: "Barre de navigation style FT.",
  },
  {
    id: "dynamic_island_toast",
    title: "Dynamic Island Toast",
    stem: "DynamicIslandToast",
    zipStem: "DynamicIslandToast",
    categories: ["ui_component", "animation"],
    funnelStages: ["main_app"],
    tags: ["toast", "dynamic island", "feedback"],
    description: "Toasts style Dynamic Island pour feedback in-app.",
  },
  {
    id: "lg_toasts",
    title: "LG Toasts",
    stem: "LGToasts",
    zipStem: "MToasts",
    categories: ["ui_component"],
    funnelStages: ["main_app"],
    tags: ["toast", "feedback"],
    description: "Composants toast premium.",
  },
  {
    id: "ap_transition",
    title: "AP Transition",
    stem: "APTransition",
    zipStem: "APTransition",
    categories: ["animation"],
    funnelStages: ["welcome", "onboarding"],
    tags: ["transition", "hero"],
    description: "Transitions hero entre écrans.",
  },
  {
    id: "user_tutorial",
    title: "User Tutorial Screen",
    stem: "User-Tutorial-Screen Updated",
    zipStem: "User-Tutorial-Screen Updated",
    categories: ["onboarding"],
    funnelStages: ["onboarding"],
    tags: ["tutorial", "coach marks"],
    description: "Écran tutoriel utilisateur avec overlays.",
  },
] as const;

export function catalogEntryById(id: string): TrackappResourceCatalogEntry | undefined {
  return TRACKAPP_RESOURCE_CATALOG.find((e) => e.id === id);
}

export function catalogForFunnelStage(stage: ClientFunnelStage): readonly TrackappResourceCatalogEntry[] {
  return TRACKAPP_RESOURCE_CATALOG.filter((e) => e.funnelStages.includes(stage));
}
