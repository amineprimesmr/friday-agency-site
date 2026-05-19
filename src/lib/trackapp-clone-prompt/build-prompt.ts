import { formatBytes, formatRatingCount, timeAgo } from "@/lib/apple-charts";
import type { OfficialBrandLinksReport, OfficialLinkKey } from "@/lib/official-brand-links";
import {
  CLAUDE_Q_PARAM_MAX,
  CURSOR_PROMPT_PARAM_MAX,
  buildClaudeCodeDeeplink,
  buildCursorPromptDeeplink,
  truncatePromptForDeeplink,
} from "@/lib/trackapp-clone-prompt/deeplinks";
import type {
  TrackappCloneAngle,
  TrackappClonePromptBundle,
  TrackappClonePromptInput,
  TrackappCloneStack,
} from "@/lib/trackapp-clone-prompt/types";

const LINK_KEYS: OfficialLinkKey[] = [
  "site",
  "appStore",
  "googlePlay",
  "instagram",
  "tiktok",
  "x",
  "youtube",
  "facebook",
  "linkedin",
  "metaAdsLibrary",
];

function stackLabel(stack: TrackappCloneStack): string {
  switch (stack) {
    case "swiftui":
      return "SwiftUI + Xcode (iOS natif, recommandé pour App Store)";
    case "expo":
      return "Expo (React Native) — itération rapide, EAS Build";
    case "react-native":
      return "React Native bare — contrôle natif maximal";
  }
}

function angleInstructions(angle: TrackappCloneAngle): string {
  switch (angle) {
    case "inspire":
      return [
        "Angle : **s'inspirer du problème résolu**, pas de la marque.",
        "Reproduis les mécaniques produit (onboarding, paywall, rétention) avec un positionnement distinct.",
        "Interdiction de réutiliser nom, logo, screenshots, textes App Store ou assets propriétaires.",
      ].join("\n");
    case "niche-adjacent":
      return [
        "Angle : **niche adjacente** — même douleur, cible plus étroite ou géographie différente.",
        "Propose un wedge clair (ex. une verticale, un persona, un pays) absent ou faible chez le concurrent.",
      ].join("\n");
    case "premium-simple":
      return [
        "Angle : **version premium simplifiée** — moins de features, meilleure exécution, pricing plus clair.",
        "MVP ultra focalisé : une promesse, un parcours, un paywall.",
      ].join("\n");
  }
}

function formatOfficialLinks(report: OfficialBrandLinksReport | undefined): string {
  if (!report) return "— (liens officiels non résolus sur Trackapp)";
  const lines: string[] = [];
  for (const key of LINK_KEYS) {
    const row = report[key];
    if (row.validated && row.url) {
      lines.push(`- ${row.label} : ${row.url}`);
    }
  }
  return lines.length > 0 ? lines.join("\n") : "— (aucun lien social/site validé automatiquement)";
}

function formatScreenshots(urls: readonly string[]): string {
  if (urls.length === 0) return "—";
  return urls
    .slice(0, 12)
    .map((u, i) => `${i + 1}. ${u}`)
    .join("\n");
}

function slugifyFilename(name: string): string {
  return name
    .normalize("NFD")
    .replace(/\p{M}/gu, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 48) || "app";
}

/** Spec complète exportable vers Cursor / Claude Code. */
export function buildTrackappCloneFullPrompt(input: TrackappClonePromptInput): string {
  const { app, metrics, screenshotUrls, presence, stack, angle, trackappSpecUrl, trackappAppUrl } = input;
  const rankBits: string[] = [];
  if (input.overallRank != null) rankBits.push(`Top 100 gratuit (global) : #${input.overallRank}`);
  if (input.genreRank != null) rankBits.push(`Top 100 gratuit (genre) : #${input.genreRank}`);

  return [
    "# Mission — construire une app iOS originale à partir d'une référence Trackapp",
    "",
    "Tu es un **lead product engineer iOS** (product + UX + architecture + implémentation).",
    "Objectif : livrer un **MVP App Store-ready** inspiré de l'app de référence ci-dessous, sans contrefaçon.",
    "",
    "## Règles non négociables",
    "- Ne copie **jamais** : nom commercial, logo, charte, textes App Store, assets, code propriétaire.",
    "- Tout contenu utilisateur visible doit être **original** (copy, illustrations, icône conceptuelle).",
    "- Si une info manque, **pose des questions** avant d'inventer des features critiques.",
    "- Travaille par **étapes courtes** avec validation à chaque phase (spec → maquettes → code → tests).",
    "",
    angleInstructions(angle),
    "",
    "## Référence Trackapp (intel marché)",
    `- Fiche Trackapp : ${trackappAppUrl}`,
    `- Spec interactive (même contenu, options stack) : ${trackappSpecUrl}`,
    "",
    "## App de référence (métadonnées App Store)",
    `- Nom (référence uniquement, ne pas réutiliser) : ${app.name}`,
    `- Éditeur : ${app.artistName}`,
    `- Catégorie : ${app.primaryGenreName || app.category}`,
    `- Prix : ${app.formattedPrice}`,
    `- Note : ${app.averageUserRating > 0 ? app.averageUserRating.toFixed(1) : "—"} (${app.userRatingCount > 0 ? formatRatingCount(app.userRatingCount) : "0"} avis)`,
    `- Version : ${app.version || "—"} · OS min : ${app.minimumOsVersion || "—"}`,
    `- Taille : ${formatBytes(app.fileSizeBytes)}`,
    `- Sortie : ${app.releaseDate ? timeAgo(app.releaseDate) : "—"}`,
    `- Bundle ID (référence) : ${app.bundleId || "—"}`,
    `- App Store : ${app.trackViewUrl || app.url}`,
    rankBits.length > 0 ? `- Classements : ${rankBits.join(" · ")}` : null,
    "",
    "## Signaux business (Trackapp — estimations)",
    `- Téléchargements / mois : ${metrics.downloadsDisplay}`,
    `- Revenus / mois : ${metrics.revenueDisplay}`,
    `- Source métrique : ${metrics.metricSource}`,
    "",
    "## Description App Store (analyse produit)",
    app.description?.trim()
      ? app.description.trim()
      : "(description indisponible — déduis la promesse depuis les screenshots)",
    "",
    app.releaseNotes?.trim()
      ? `### Dernières release notes\n${app.releaseNotes.trim()}`
      : null,
    "",
    "## Stack technique choisie",
    stackLabel(stack),
    "",
    "## Liens officiels validés (marketing / distribution)",
    formatOfficialLinks(presence?.officialLinks),
    presence?.metaPageId
      ? `- Meta Ads Library (page ID) : ${presence.metaPageId}${presence.metaPageName ? ` (${presence.metaPageName})` : ""}`
      : null,
  ]
    .filter((line): line is string => line != null)
    .join("\n")
    .concat(
      "\n\n",
      [
        "## Screenshots App Store (URLs — analyse UX)",
        "Étudie chaque capture : promesse hero, onboarding, paywall, social proof, navigation.",
        formatScreenshots(screenshotUrls),
        "",
        "## Livrables attendus (dans l'ordre)",
        "1. **PRODUCT_SPEC.md** — persona, jobs-to-be-done, périmètre MVP, hors-scope, KPI.",
        "2. **UX_FLOWS.md** — 5–8 écrans max, navigation, états vides/erreur, paywall.",
        "3. **ARCHITECTURE.md** — modules, state, auth, analytics, abonnements.",
        "4. **Implémentation** — code du MVP avec structure de projet claire.",
        "5. **APP_STORE.md** — nom de travail original, sous-titre, keywords, checklist TestFlight.",
        "",
        "## Plan d'exécution (demande confirmation entre chaque phase)",
        "### Phase A — Spec produit",
        "- Résume la promesse en une phrase originale.",
        "- Liste les 3 features MVP + 3 features V2.",
        "- Propose un modèle économique (essai, abo, achat unique) aligné sur la catégorie.",
        "",
        "### Phase B — UX",
        "- Décris les écrans clés inspirés des screenshots (sans copier le design pixel-perfect).",
        "- Propose une hiérarchie visuelle moderne iOS (SF Symbols, Dynamic Type, accessibilité).",
        "",
        "### Phase C — Technique",
        `- Initialise le projet ${stack === "swiftui" ? "Xcode SwiftUI" : stack === "expo" ? "Expo" : "React Native"}.`,
        "- Auth (optionnel MVP) : email magic link ou Sign in with Apple — justifie le choix.",
        "- Monétisation : RevenueCat si abonnement — schéma d'entitlements.",
        "- Analytics : événements funnel (install → activation → paywall → purchase).",
        "",
        "### Phase D — Go-to-market",
        "- 3 hooks créa (TikTok/Reels) + 3 angles ASO.",
        "- Landing one-pager (structure sections).",
        "",
        "## Première action",
        "Commence par **Phase A** : pose-moi jusqu'à 5 questions de clarification, puis rédige PRODUCT_SPEC.md.",
        "Réponds en français. Code et identifiants techniques en anglais.",
      ].join("\n"),
    );
}

export function buildTrackappCloneDeeplinkPrompt(
  input: TrackappClonePromptInput,
  fullPrompt: string,
): string {
  const teaser = [
    "Tu es lead product engineer iOS. Construis un MVP App Store-ready ORIGINAL (pas de copie de marque/assets).",
    "",
    `Référence : ${input.app.name} (${input.app.primaryGenreName || input.app.category})`,
    `Promesse à analyser : ${(input.app.description || "").slice(0, 400)}${(input.app.description || "").length > 400 ? "…" : ""}`,
    "",
    `Stack : ${stackLabel(input.stack)}`,
    `Spec complète Trackapp : ${input.trackappSpecUrl}`,
    "",
    "Commence par Phase A : 5 questions max puis PRODUCT_SPEC.md.",
    "Réponds en français.",
  ].join("\n");

  const suffix = `[…] Spec complète (${fullPrompt.length} car.) : ${input.trackappSpecUrl}`;
  return truncatePromptForDeeplink(teaser, Math.min(CURSOR_PROMPT_PARAM_MAX, CLAUDE_Q_PARAM_MAX) - 20, suffix);
}

export function assembleTrackappClonePromptBundle(
  input: TrackappClonePromptInput,
): TrackappClonePromptBundle {
  const fullPrompt = buildTrackappCloneFullPrompt(input);
  const deeplinkPrompt = buildTrackappCloneDeeplinkPrompt(input, fullPrompt);
  const slug = slugifyFilename(input.app.name);

  return {
    appId: input.app.id,
    appName: input.app.name,
    country: input.country,
    fullPrompt,
    deeplinkPrompt,
    markdownFilename: `trackapp-spec-${slug}-${input.app.id}.md`,
    specUrl: input.trackappSpecUrl,
    appUrl: input.trackappAppUrl,
    cursorDeeplink: buildCursorPromptDeeplink(deeplinkPrompt, false),
    cursorWebDeeplink: buildCursorPromptDeeplink(deeplinkPrompt, true),
    claudeDeeplink: buildClaudeCodeDeeplink(
      truncatePromptForDeeplink(
        deeplinkPrompt,
        CLAUDE_Q_PARAM_MAX,
        `Spec : ${input.trackappSpecUrl}`,
      ),
    ),
    generatedAt: new Date().toISOString(),
  };
}
