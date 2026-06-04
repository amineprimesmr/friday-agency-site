import type { ApplabMvpPromptBlueprint } from "@/lib/trackapp-applab-create/mvp-prompt-types";

/** Stack verrouillée AppLAB — l'utilisateur ne choisit rien, l'IA exécute tel quel. */
export const APPLAB_FIXED_TECH_STACK = {
  client: "SwiftUI + Xcode 16+ (Swift 5.10, @Observable)",
  iap: "RevenueCat (Purchases iOS SDK) + App Store Connect",
  backend: "Firebase (Google)",
  auth: "Firebase Auth — Sign in with Apple (+ anonyme invité si pertinent)",
  database: "Cloud Firestore",
  storage: "Firebase Storage (médias / assets dynamiques si besoin)",
  analytics: "Firebase Analytics",
  crashes: "Firebase Crashlytics",
  push: "Firebase Cloud Messaging (optionnel v1.0 — activer si notifications métier)",
  remoteConfig: "Firebase Remote Config (feature flags, copy paywall A/B)",
  localCache: "SwiftData ou UserDefaults — cache offline, Firestore = source de vérité",
} as const;

export const APPLAB_TECH_STACK_ONE_LINER =
  "SwiftUI · RevenueCat · Firebase (Auth, Firestore, Analytics, Crashlytics)";

export function buildFixedTechStackSection(blueprint?: ApplabMvpPromptBlueprint): string {
  const firestoreBlock =
    blueprint && blueprint.data_models.length > 0 ?
      [
        "## Firebase Firestore — collections (schéma imposé)",
        "",
        ...blueprint.data_models.map(
          (m) =>
            `### Collection \`${m.name.toLowerCase()}\`\n- Champs : ${m.fields.join(", ") || "—"}\n- Notes : ${m.notes}\n- Règles : \`request.auth != null\` pour écriture user ; lecture publique seulement si contenu non sensible.`,
        ),
        "",
        "Règles Firestore à générer dans `firestore.rules` (deny by default).",
      ].join("\n")
    : [
        "## Firebase Firestore",
        "",
        "Définir collections à partir des modèles de données du blueprint — une collection par entité métier.",
        "Règles : deny by default ; accès user authentifié uniquement sur ses documents.",
      ].join("\n");

  return [
    "## Stack technique imposée (AppLAB — ne pas substituer)",
    "",
    "L'utilisateur **ne choisit aucune techno**. Implémente exactement :",
    "",
    "| Couche | Technologie |",
    "|--------|-------------|",
    `| App iOS | ${APPLAB_FIXED_TECH_STACK.client} |`,
    `| Abonnements | ${APPLAB_FIXED_TECH_STACK.iap} |`,
    `| Backend | ${APPLAB_FIXED_TECH_STACK.backend} |`,
    `| Auth | ${APPLAB_FIXED_TECH_STACK.auth} |`,
    `| Base de données | ${APPLAB_FIXED_TECH_STACK.database} |`,
    `| Fichiers | ${APPLAB_FIXED_TECH_STACK.storage} |`,
    `| Analytics | ${APPLAB_FIXED_TECH_STACK.analytics} |`,
    `| Crashes | ${APPLAB_FIXED_TECH_STACK.crashes} |`,
    `| Cache local | ${APPLAB_FIXED_TECH_STACK.localCache} |`,
    "",
    "### Packages SPM (SwiftUI)",
    "- `FirebaseAuth`, `FirebaseFirestore`, `FirebaseAnalytics`, `FirebaseCrashlytics`",
    "- `FirebaseStorage` si assets distants",
    "- `RevenueCat` (`Purchases`, `PurchasesSwiftUI` si UI SDK)",
    "",
    "### Setup Firebase (ordre)",
    "1. Créer projet [Firebase Console](https://console.firebase.google.com) — bundle ID = app Xcode.",
    "2. Télécharger `GoogleService-Info.plist` → target iOS.",
    "3. Activer **Authentication** → Sign in with Apple (+ Email si besoin admin).",
    "4. Créer base **Firestore** (mode production, règles strictes).",
    "5. Activer **Crashlytics** + **Analytics**.",
    "6. Clés / config : xcconfig Release — jamais hardcodées dans Git public.",
    "",
    firestoreBlock,
    "",
    "### Intégration RevenueCat + Firebase",
    "- RevenueCat gère IAP ; identifier utilisateur = Firebase Auth `uid`.",
    "- `Purchases.shared.logIn(firebaseUid)` après connexion.",
    "- Entitlements RevenueCat = accès premium dans l'app.",
    "",
    "### Analytics",
    "- Events du blueprint → `Analytics.logEvent(...)` (snake_case).",
    "- Funnel : welcome, onboarding_step, paywall_view, purchase, winback_view, home_open.",
  ].join("\n");
}

export function buildFixedTechStackCodingRules(): readonly string[] {
  return [
    "Backend = Firebase uniquement (pas Supabase, pas serveur custom, pas REST maison).",
    "Auth Firebase + Sign in with Apple obligatoire si compte utilisateur.",
    "Firestore = source de vérité ; cache local SwiftData/UserDefaults pour offline.",
    "IAP = RevenueCat uniquement (pas StoreKit UI raw sans RevenueCat).",
    "Crashlytics + Firebase Analytics branchés dès la v1.0.",
    "Services dans `Services/Firebase/` et `Services/RevenueCat/` — pas de logique Firebase dans les Views.",
  ];
}
