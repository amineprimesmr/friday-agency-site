import type { Metadata } from "next";
import Link from "next/link";
import { readFile } from "fs/promises";
import path from "path";
import { CopyButton } from "@/components/tracker/copy-button";

export const metadata: Metadata = {
  title: "Widget iOS — App Tracker by Friday",
  description: "Widget Scriptable pour iPhone : top apps, téléchargements & revenus réels en temps réel.",
};

export const dynamic = "force-dynamic";

const STEPS = [
  {
    n: "1",
    icon: "📲",
    title: "Installer Scriptable",
    desc: "Télécharge l'app gratuite Scriptable sur l'App Store.",
    cta: "App Store",
    href: "https://apps.apple.com/fr/app/scriptable/id1405459188",
  },
  {
    n: "2",
    icon: "📋",
    title: "Copier le code",
    desc: "Copie le script ci-dessous, ouvre Scriptable → + → colle le code → ▶ pour tester.",
    cta: null,
    href: null,
  },
  {
    n: "3",
    icon: "🔲",
    title: "Ajouter le widget",
    desc: "Maintiens appuyé sur l'écran d'accueil → + → Scriptable → choisis la taille (medium recommandé).",
    cta: null,
    href: null,
  },
  {
    n: "4",
    icon: "⚙️",
    title: "Configurer (optionnel)",
    desc: 'Appuie sur "Éditer le widget" → Script → friday-tracker-widget. Pour le mode focus, entre un nom d\'app dans le champ "Paramètre".',
    cta: null,
    href: null,
  },
];

const FEATURES = [
  { icon: "⚡", label: "Données SensorTower", desc: "Téléchargements & revenus réels" },
  { icon: "📊", label: "Top Charts live", desc: "US App Store mis à jour toutes les heures" },
  { icon: "🔍", label: "Mode focus", desc: "1 app spécifique via paramètre widget" },
  { icon: "📐", label: "3 tailles", desc: "Small · Medium · Large" },
  { icon: "🌙", label: "Dark natif", desc: "Design glass assorti à l'app" },
  { icon: "🔗", label: "Lien direct", desc: "Tap → ouvre l'App Tracker" },
];

export default async function WidgetPage() {
  const filePath = path.join(process.cwd(), "public", "friday-tracker-widget.js");
  const code = await readFile(filePath, "utf-8");

  return (
    <div className="mx-auto max-w-4xl space-y-10 px-4 py-10 sm:px-6">

      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-xs text-white/30">
        <Link href="/tracker" className="transition hover:text-white/60">Tableau de bord</Link>
        <span>/</span>
        <span className="text-white/55">Widget iOS</span>
      </nav>

      {/* Hero */}
      <div className="relative overflow-hidden rounded-2xl border border-white/[0.08] bg-gradient-to-br from-white/[0.06] via-white/[0.02] to-transparent p-8">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(255,255,255,0.04),transparent_65%)]" />
        <div className="relative flex flex-wrap items-center gap-8">
          <div className="flex-1">
            <div className="mb-3 flex items-center gap-2">
              <span className="flex h-1.5 w-1.5 animate-pulse rounded-full bg-white/50" />
              <span className="text-[10px] font-bold uppercase tracking-widest text-white/45">Widget Scriptable · Gratuit</span>
            </div>
            <h1 className="text-3xl font-bold text-white">App Tracker<br/>sur ton iPhone</h1>
            <p className="mt-2 max-w-md text-sm text-white/50">
              Top apps, téléchargements & revenus réels (SensorTower) directement sur ton écran d&apos;accueil.
              Tap → ouvre l&apos;App Tracker.
            </p>
            <div className="mt-4 flex flex-wrap gap-3">
              <a
                href="https://apps.apple.com/fr/app/scriptable/id1405459188"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.06] px-4 py-2.5 text-sm font-medium text-white/80 transition hover:bg-white/[0.1] hover:text-white"
              >
                📲 Installer Scriptable
              </a>
              <a
                href="/friday-tracker-widget.js"
                download="friday-tracker-widget.js"
                className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.06] px-4 py-2.5 text-sm font-medium text-white/80 transition hover:bg-white/[0.1] hover:text-white"
              >
                ⬇ Télécharger le script
              </a>
            </div>
          </div>

          {/* Widget preview mockup */}
          <div className="shrink-0">
            <WidgetMockup />
          </div>
        </div>
      </div>

      {/* Features */}
      <div>
        <h2 className="mb-4 text-[11px] font-bold uppercase tracking-[0.22em] text-white/40">Fonctionnalités</h2>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {FEATURES.map((f) => (
            <div key={f.label} className="flex items-start gap-3 rounded-2xl border border-white/[0.06] bg-white/[0.02] p-4">
              <span className="text-2xl">{f.icon}</span>
              <div>
                <p className="text-xs font-semibold text-white/80">{f.label}</p>
                <p className="text-[11px] text-white/40">{f.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Steps */}
      <div>
        <h2 className="mb-4 text-[11px] font-bold uppercase tracking-[0.22em] text-white/40">Installation en 4 étapes</h2>
        <div className="space-y-3">
          {STEPS.map((step) => (
            <div key={step.n} className="flex items-start gap-4 rounded-2xl border border-white/[0.06] bg-white/[0.02] p-4">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white/10 text-sm font-bold text-white/80 ring-1 ring-white/10">
                {step.n}
              </div>
              <div className="flex-1">
                <p className="font-semibold text-white/90">
                  {step.icon} {step.title}
                </p>
                <p className="mt-0.5 text-xs text-white/45">{step.desc}</p>
              </div>
              {step.cta && step.href && (
                <a
                  href={step.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="shrink-0 rounded-xl border border-white/10 bg-white/[0.04] px-3 py-1.5 text-xs font-medium text-white/60 transition hover:border-white/20 hover:text-white"
                >
                  {step.cta} ↗
                </a>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Code block */}
      <div>
        <div className="mb-3 flex items-center justify-between">
          <div>
            <h2 className="text-[11px] font-bold uppercase tracking-[0.22em] text-white/40">Script Scriptable</h2>
            <p className="mt-0.5 text-xs text-white/30">{code.split("\n").length} lignes · JavaScript</p>
          </div>
          <div className="flex gap-2">
            <a
              href="/friday-tracker-widget.js"
              download="friday-tracker-widget.js"
              className="flex items-center gap-1.5 rounded-xl border border-white/10 bg-white/[0.04] px-3 py-2 text-xs font-medium text-white/60 transition hover:border-white/20 hover:text-white"
            >
              ⬇ .js
            </a>
            <CopyButton text={code} />
          </div>
        </div>

        <div className="relative overflow-hidden rounded-2xl border border-white/[0.07] bg-[#050508]">
          {/* Code header bar */}
          <div className="flex items-center gap-2 border-b border-white/[0.06] px-4 py-3">
            <span className="h-3 w-3 rounded-full bg-red-500/60" />
            <span className="h-3 w-3 rounded-full bg-amber-500/60" />
            <span className="h-3 w-3 rounded-full bg-emerald-500/60" />
            <span className="ml-3 text-[11px] text-white/30">friday-tracker-widget.js</span>
          </div>
          <pre className="max-h-[480px] overflow-auto p-5 text-[11px] leading-relaxed text-white/70">
            <code>{code}</code>
          </pre>
        </div>
      </div>

      {/* Tips */}
      <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
        <h2 className="mb-3 text-[11px] font-bold uppercase tracking-[0.22em] text-white/45">Astuce — Mode Focus (small widget)</h2>
        <p className="text-sm text-white/55">
          Pour suivre une app spécifique sur un petit widget, ajoute son nom en paramètre :<br />
          <span className="mt-1 inline-block rounded-lg bg-white/[0.06] px-3 py-1.5 font-mono text-xs text-white/75">
            Paramètre widget → &quot;Instagram&quot;
          </span>
          <br />
          <span className="mt-1 inline-block text-xs text-white/35">
            Le widget affichera les downloads & revenus réels de cette app + lien direct vers sa fiche.
          </span>
        </p>
      </div>

      {/* Back CTA */}
      <div className="flex items-center justify-between rounded-2xl border border-white/[0.06] bg-white/[0.02] p-5">
        <div>
          <p className="font-semibold text-white/80">Voir toutes les apps</p>
          <p className="text-xs text-white/40">Classements · Recherche · Profil développeur</p>
        </div>
        <Link
          href="/tracker"
          className="flex items-center gap-2 rounded-xl bg-white px-5 py-3 text-sm font-semibold text-neutral-950 transition hover:bg-white/90"
        >
          Ouvrir le Tracker →
        </Link>
      </div>

    </div>
  );
}

function WidgetMockup() {
  const apps = [
    { rank: 1, name: "Paramount+", dl: "15M", rev: "$45M", color: "#a3a3a3" },
    { rank: 2, name: "Netflix Game...", dl: "8M", rev: "$12M", color: "#737373" },
    { rank: 3, name: "ChatGPT", dl: "6M", rev: "$123M", color: "#525252" },
    { rank: 4, name: "Claude", dl: "4M", rev: "$18M", color: "#404040" },
  ];

  return (
    <div
      className="w-[220px] overflow-hidden rounded-[20px] border border-white/10 shadow-2xl"
      style={{
        background: "#000000",
        boxShadow: "0 0 0 1px rgba(255,255,255,0.07), 0 24px 48px rgba(0,0,0,0.6)",
      }}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-3 py-2.5">
        <div className="flex items-center gap-1.5 rounded-lg bg-white/10 px-2 py-1">
          <span className="text-[9px] font-bold text-white/80">◆ Friday</span>
        </div>
        <div>
          <p className="text-[10px] font-bold text-white">App Tracker</p>
          <p className="text-[8px] text-white/35">🇺🇸 Top 4 · 10 mai</p>
        </div>
        <div className="rounded-md bg-white/10 px-1.5 py-0.5">
          <span className="text-[8px] font-bold text-white/70">⬤ LIVE</span>
        </div>
      </div>

      {/* Divider */}
      <div className="h-px bg-white/10 mx-3" />

      {/* Apps */}
      <div className="space-y-0.5 p-2">
        {apps.map((app) => (
          <div key={app.rank} className="flex items-center gap-2 rounded-xl px-2 py-1.5">
            <span className="w-5 text-center text-[9px] font-bold" style={{ color: app.rank === 1 ? "#fbbf24" : "rgba(255,255,255,0.35)" }}>
              #{app.rank}
            </span>
            <div
              className="h-6 w-6 shrink-0 rounded-md"
              style={{ background: `${app.color}30`, border: `1px solid ${app.color}40` }}
            />
            <div className="flex-1 min-w-0">
              <p className="truncate text-[10px] font-medium text-white/90">{app.name}</p>
              <div className="flex items-center gap-2">
                <span className="text-[8px] text-white/45">↓ {app.dl}</span>
                <span className="text-[8px] text-white/50">{app.rev}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Footer */}
      <div className="h-px bg-white/10 mx-3" />
      <div className="flex items-center justify-between px-3 py-2">
        <span className="text-[8px] text-white/20">frid4y.agency</span>
        <div className="rounded-md bg-white/10 px-2 py-1">
          <span className="text-[8px] font-bold text-white/75">Ouvrir App Tracker →</span>
        </div>
      </div>
    </div>
  );
}
