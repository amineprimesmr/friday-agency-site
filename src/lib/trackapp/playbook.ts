/** Étapes playbook Trackapp — iOS par défaut, FR uniquement côté produit. */

export type TrackappOnboardingAnswers = {
  app_name?: string;
  accent_color?: string;
  audience?: string;
  business_model?: string;
  tone?: string;
  /** débutant | intermediaire | avancé */
  app_experience?: string;
  /** optionnel timing */
  horizon?: string;
};

export type PlaybookStep = {
  id: string;
  title: string;
  summary: string;
  prompt_template: string;
};

const BASE = `
Contexte projet :
— Plateforme cible : iOS (SwiftUI + App Store Connect).
— Langue du produit et assets : français.
`;

export function buildPlaybookSteps(): PlaybookStep[] {
  return [
    {
      id: "concept",
      title: "Synthèse produit",
      summary: "Une phrase qui résume votre app clone / dérivée et la promesse utilisateur.",
      prompt_template:
        BASE +
        `\nRéponds sans poser de questions. Produit imaginé : « {{app_name}} ».\nAudience : {{audience}}.\nModèle économique : {{business_model}}.\nTon de marque : {{tone}}.\n{{source_block}}\nRédige : vision produit 5 lignes, 3 KPI de succès, 5 risques + mitigations.`,
    },
    {
      id: "positionnement",
      title: "Positionnement & défense",
      summary: "Différenciation légère et périmètre pour éviter la copie servile.",
      prompt_template:
        BASE +
        `\nApp : {{app_name}} pour {{audience}}.\n{{source_block}}\nListe angles de différenciation propriétaires, éléments à ne pas reproduire (marque, assets tiers), et liste de vérif légal succincte.`,
    },
    {
      id: "ia-design",
      title: "IA & design système",
      summary: "Style visuel avec couleur d’accent cohérente.",
      prompt_template:
        BASE +
        `\nAccent couleur préféré : {{accent_color}} pour {{app_name}}.\nDécrit système UI (typo SF, grille 8pt, contrastes WCAG AA), exemples tokens SwiftUI.`,
    },
    {
      id: "swiftui-shell",
      title: "Coque SwiftUI",
      summary: "Tab bar ou navigation adaptive, scaffold du projet Xcode.",
      prompt_template:
        BASE +
        `\nPour {{app_name}}, génère squelette Xcode 15+, modules (App/, Features/, Shared/), conventions nommage, preview providers.`,
    },
    {
      id: "onboarding-copy",
      title: "Onboarding utilisateur",
      summary: "3 écrans max, messages FR courts.",
      prompt_template:
        BASE +
        `\nRéécris parcours d’intro pour {{audience}}, ton {{tone}}, micro-copy FR + placeholders analytics.`,
    },
    {
      id: "architecture",
      title: "Architecture modules",
      summary: "Séparation data / UI / networking.",
      prompt_template:
        BASE +
        `\nNiveau compétence dev app : {{app_experience}}. Propose arborescence et flux async/await, injection simple.`,
    },
    {
      id: "auth-compte",
      title: "Comptes utilisateurs",
      summary: "Auth email / Apple conforme ligne directrice.",
      prompt_template:
        BASE +
        `\nDécrit onboarding compte utilisateur conforme guideline Apple pour {{app_name}}.`,
    },
    {
      id: "data-local",
      title: "Données locales",
      summary: "Cache, fichiers Application Support, stratégie offline light.",
      prompt_template:
        BASE +
        `\nListe entités locales à persister pour {{app_name}}, migration légère, schémas versionnés.`,
    },
    {
      id: "networking",
      title: "Réseau & erreurs",
      summary: "Client HTTP tolérant, retry, timeouts, messages FR.",
      prompt_template:
        BASE +
        `\nSpécifie couche networking (URLRequest + async), codes d’erreur UX en français.`,
    },
    {
      id: "appstore-compliance",
      title: "App Store Review checklist",
      summary: "Checklist reviewer Apple et privacy nutrition labels.",
      prompt_template:
        BASE +
        `\nConstruit checklist reviewer pour {{business_model}}, captation données, paiements.`,
    },
    {
      id: "metadata-aso",
      title: "Fiche App Store FR",
      summary: "Titre sous 30c, sous-titre, bullet points FR.",
      prompt_template:
        BASE +
        `\nRéécris fiche avec mots-clés FR pour {{audience}}, tone {{tone}}.`,
    },
    {
      id: "screenshots",
      title: "Storyboard screenshots",
      summary: "6–8 mockups captions FR.",
      prompt_template:
        BASE +
        `\nPlan de storyboard screenshots (format iPhone) pour {{app_name}} avec captions FR.`,
    },
    {
      id: "revenue-explain",
      title: "RevenueCat — explication courte",
      summary:
        "RevenueCat gère vos abonnements In-App : il relie App Store avec une couche SaaS qui suit les transitions d’état sans réécrire la logique de reçu vous-même.",
      prompt_template:
        BASE +
        `\nExplique brièvement (6 phrases) RevenueCat au fondateur de {{app_name}}.\nListe fichiers Xcode à créer (Services/Purchases, PaywallState, entitlement mapping). Pas de secrets API.`,
    },
    {
      id: "revenue-prompt-config",
      title: "RevenueCat — prompt config",
      summary: "Coller dans Cursor / Claude après création projet RC.",
      prompt_template:
        BASE +
        `\nNiveau Swift : {{app_experience}}. Génère plan d’implémentation SDK RevenueCat SwiftUI avec entitlements mensuel/annuel, restauration, paywall onboarding, messages FR.`,
    },
    {
      id: "paywall-copy",
      title: "Copy paywall FR",
      summary: "Valeurs, garanties légales succinctes.",
      prompt_template:
        BASE +
        `\nRéécris paywall conforme ligne Apple pour {{business_model}}, ton {{tone}}.`,
    },
    {
      id: "push-notifs",
      title: "Notifications push",
      summary: "Scénarios et opt-in léger.",
      prompt_template:
        BASE +
        `\nListe 10 cas de push pour {{audience}}, message FR exemple, fenêtre timing.`,
    },
    {
      id: "growth-loop",
      title: "Boucles de croissance",
      summary: "Partage invite, création invite code light.",
      prompt_template:
        BASE +
        `\nPropose mécanisme viral simple mais réaliste pour {{app_name}} sans spam.`,
    },
    {
      id: "qa-release",
      title: "QA & versioning",
      summary: "TestFlight, versioning marketing vs build.",
      prompt_template:
        BASE +
        `\nChecklists QA interne avant soumission avec tests device iOS.`,
    },
  ];
}

export function previewUnlockCount(stepCount: number): number {
  return Math.max(1, Math.round(stepCount * 0.1));
}

export function interpolatePrompt(template: string, ctx: Record<string, string>): string {
  let out = template;
  for (const [key, val] of Object.entries(ctx)) {
    out = out.split(`{{${key}}}`).join(val);
  }
  return out;
}
