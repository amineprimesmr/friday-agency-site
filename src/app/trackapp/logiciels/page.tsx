import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Logiciels indispensables — Trackapp",
  description: "Stack d'outils recommandée pour construire, lancer et promouvoir une app iOS.",
};

type Tool = {
  name: string;
  badge: string;
  role: string;
  why: string;
  tip: string;
  href?: string;
  cta?: string;
};

const ESSENTIALS: Tool[] = [
  {
    name: "Apple Developer Program",
    badge: "Obligatoire",
    role: "Publier sur l'App Store, utiliser TestFlight, gérer les certificats et accéder à App Store Connect.",
    why:
      "C'est la porte d'entrée officielle pour distribuer une app iOS. Les 99 $/an ne sont pas juste une dépense : Apple propose généralement un crédit promotionnel Apple Ads d'environ 100 $ pour les nouveaux comptes éligibles, ce qui peut compenser le coût de départ si tu l'utilises pour tester l'acquisition.",
    tip: "À faire dès que l'app devient sérieuse : tu débloques TestFlight, les builds réels, les fiches App Store et les campagnes Apple Ads.",
    href: "https://developer.apple.com/programs/",
    cta: "Ouvrir Apple Developer",
  },
  {
    name: "Cursor",
    badge: "IDE conseillé",
    role: "Coder l'app plus vite avec un IDE assisté par IA, comprendre le projet, générer/refactorer des écrans.",
    why:
      "Tu peux utiliser Claude directement, mais Cursor est plus pratique pour bosser dans le code : fichiers, contexte du repo, modifications multi-fichiers et itérations rapides. C'est l'outil que je conseille pour avancer proprement.",
    tip: "Utilise Claude/Cursor pour transformer une idée d'écran en composants, puis demande toujours une passe de nettoyage/performance.",
    href: "https://cursor.com/",
    cta: "Voir Cursor",
  },
  {
    name: "Xcode",
    badge: "Build iOS",
    role: "Compiler, signer, lancer sur simulateur/iPhone, envoyer les builds vers TestFlight.",
    why:
      "Même si tu codes avec Cursor, Xcode reste indispensable pour le pipeline Apple : simulateurs, certificats, archives et upload App Store.",
    tip: "Garde Xcode à jour, mais évite de changer de version en plein rush de soumission App Store.",
    href: "https://developer.apple.com/xcode/",
    cta: "Télécharger Xcode",
  },
  {
    name: "Firebase",
    badge: "Backend rapide",
    role: "Auth, base de données, storage, push notifications, analytics et crash reporting.",
    why:
      "Très bon choix pour lancer vite sans construire tout un backend. Tu peux valider ton app, tes utilisateurs et tes premières features sans perdre des semaines sur l'infra.",
    tip: "Commence léger : Auth + Firestore + Crashlytics. Ajoute le reste seulement quand le produit en a besoin.",
    href: "https://firebase.google.com/",
    cta: "Voir Firebase",
  },
  {
    name: "Pinterest",
    badge: "Inspiration",
    role: "Trouver des directions visuelles, onboarding, paywalls, écrans premium, moodboards.",
    why:
      "Pinterest est sous-coté pour trouver des patterns d'interface rapidement. Les bons mots-clés donnent souvent plus d'inspiration que chercher app par app.",
    tip: "Recherches utiles : “mobile app onboarding”, “ios paywall design”, “app ui kit”, “fitness app ui”, “finance app dashboard”, “habit tracker ui”, “ai app interface”.",
    href: "https://www.pinterest.com/",
    cta: "Chercher sur Pinterest",
  },
  {
    name: "Higgsfield",
    badge: "Design in-app",
    role: "Créer des visuels, scènes, images marketing et directions graphiques pour l'intérieur de l'app.",
    why:
      "Pratique pour produire vite des assets et tester une DA sans attendre un designer. Idéal pour hero images, onboarding, avatars, mockups et visuels de campagne.",
    tip: "Utilise-le comme générateur de pistes, puis garde uniquement une direction cohérente dans toute l'app.",
    href: "https://higgsfield.ai/",
    cta: "Voir Higgsfield",
  },
];

const BONUS: Tool[] = [
  {
    name: "App Store Connect",
    badge: "Publication",
    role: "Fiches App Store, screenshots, prix, TestFlight, reviews, analytics Apple.",
    why: "C'est ton cockpit Apple après la licence développeur.",
    tip: "Prépare tes screenshots et mots-clés avant la fin du développement, pas après.",
  },
  {
    name: "Apple Ads",
    badge: "Acquisition",
    role: "Tester les premiers mots-clés payants directement dans l'App Store.",
    why: "Le trafic est ultra intentionniste : les gens cherchent déjà une app.",
    tip: "Commence avec exact match sur 5 à 10 mots-clés très précis, pas en broad trop large.",
    href: "https://searchads.apple.com/",
    cta: "Voir Apple Ads",
  },
  {
    name: "RevenueCat",
    badge: "Abonnements",
    role: "Gérer paywalls, abonnements, achats in-app et droits premium.",
    why: "Évite de perdre du temps sur la complexité StoreKit dès le début.",
    tip: "Très utile si ton app a un abonnement, un essai gratuit ou plusieurs offres.",
    href: "https://www.revenuecat.com/",
    cta: "Voir RevenueCat",
  },
  {
    name: "Mobbin",
    badge: "Références UI",
    role: "Explorer de vrais écrans d'apps connues pour comprendre les flows qui convertissent.",
    why: "Plus productif que recopier au hasard : tu étudies des patterns déjà validés.",
    tip: "Regarde onboarding, paywall, settings, empty states et flows d'upgrade.",
    href: "https://mobbin.com/",
    cta: "Voir Mobbin",
  },
  {
    name: "Sentry",
    badge: "Qualité",
    role: "Détecter erreurs, crashs et lenteurs en production.",
    why: "Une app qui plante perd des reviews, du ranking et de la confiance.",
    tip: "Installe-le avant le lancement public, pas après les premiers crashs utilisateurs.",
    href: "https://sentry.io/",
    cta: "Voir Sentry",
  },
  {
    name: "PostHog",
    badge: "Analytics produit",
    role: "Comprendre activation, rétention, funnels et événements clés.",
    why: "Tu dois savoir où les utilisateurs bloquent avant de refaire le design.",
    tip: "Tracke peu mais bien : onboarding terminé, paywall vu, achat démarré, achat réussi.",
    href: "https://posthog.com/",
    cta: "Voir PostHog",
  },
];

function ToolCard({ tool, featured = false }: Readonly<{ tool: Tool; featured?: boolean }>) {
  return (
    <article
      className={
        featured
          ? "group relative overflow-hidden rounded-[24px] border border-[var(--dash-border)] bg-white p-5 shadow-[var(--dash-shadow-lg)] transition hover:-translate-y-0.5 hover:shadow-[0_18px_45px_rgba(15,23,42,0.10)]"
          : "rounded-[20px] border border-[var(--dash-border)] bg-white p-4 shadow-[var(--dash-shadow)]"
      }
    >
      {featured ? (
        <div
          className="pointer-events-none absolute inset-x-0 top-0 h-20 bg-gradient-to-b from-slate-100/90 to-transparent opacity-80"
          aria-hidden
        />
      ) : null}
      <div className="relative">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-[1.08rem] font-bold tracking-tight text-[var(--dash-text)]">{tool.name}</h2>
          <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-[0.68rem] font-bold uppercase tracking-[0.12em] text-slate-600">
            {tool.badge}
          </span>
        </div>
        <p className="text-[0.92rem] font-semibold leading-relaxed text-[var(--dash-text-secondary)]">{tool.role}</p>
        <p className="mt-3 text-[0.88rem] leading-relaxed text-[var(--dash-muted-light)]">{tool.why}</p>
        <div className="mt-4 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
          <p className="text-[0.78rem] font-semibold uppercase tracking-[0.14em] text-slate-500">Conseil Trackapp</p>
          <p className="mt-1 text-[0.86rem] leading-relaxed text-slate-700">{tool.tip}</p>
        </div>
        {tool.href ? (
          <a
            href={tool.href}
            target="_blank"
            rel="noreferrer"
            className="mt-4 inline-flex items-center gap-2 rounded-full bg-[#0f172a] px-4 py-2 text-[0.82rem] font-semibold text-white no-underline transition hover:bg-[#111827]"
          >
            {tool.cta ?? "Ouvrir"}
            <span aria-hidden>↗</span>
          </a>
        ) : null}
      </div>
    </article>
  );
}

export default function TrackappLogicielsPage() {
  return (
    <div className="relative z-[1] dashboard-main pb-16">
      <section className="dashboard-section">
        <p className="trackapp-workspace-hero-kicker">Stack de lancement</p>
        <h1 className="trackapp-workspace-hero-title">Logiciels indispensables</h1>
        <p className="trackapp-workspace-hero-desc max-w-[68ch]">
          Les outils à installer ou garder sous la main pour passer d&apos;une idée à une app iOS publiée, monétisée et améliorée avec des données.
        </p>
      </section>

      <section className="grid gap-5 lg:grid-cols-2">
        {ESSENTIALS.map((tool) => (
          <ToolCard key={tool.name} tool={tool} featured />
        ))}
      </section>

      <section className="mt-10">
        <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="trackapp-workspace-hero-kicker">Bonus utiles</p>
            <h2 className="m-0 text-[1.45rem] font-bold tracking-tight text-[var(--dash-text)]">À ajouter selon ton niveau</h2>
          </div>
          <p className="max-w-md text-[0.9rem] leading-relaxed text-[var(--dash-muted-light)]">
            Pas besoin de tout installer le jour 1. Ajoute ces outils quand ils débloquent un vrai problème.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {BONUS.map((tool) => (
            <ToolCard key={tool.name} tool={tool} />
          ))}
        </div>
      </section>
    </div>
  );
}
