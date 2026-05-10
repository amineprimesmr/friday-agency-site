import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Raccourci iOS — App Stats par Friday Tracker",
  description: "Raccourci iOS natif : téléchargements & revenus réels SensorTower directement depuis le Share Sheet de l'App Store.",
};

export const dynamic = "force-static";

const STEPS = [
  {
    n: "1",
    icon: "⬇️",
    title: 'Télécharger le raccourci',
    desc: 'Clique "Obtenir le raccourci" ci-dessous — iOS ouvre directement l\'app Raccourcis.',
  },
  {
    n: "2",
    icon: "✅",
    title: "Ajouter",
    desc: 'Appuie sur "Ajouter le raccourci" dans la popup.',
  },
  {
    n: "3",
    icon: "📤",
    title: "Utiliser depuis l'App Store",
    desc: "Ouvre une app → Partager → App Stats — Friday Tracker. Le rapport s'affiche automatiquement.",
  },
];

export default function WidgetPage() {
  return (
    <div className="mx-auto max-w-3xl space-y-10 px-4 py-10 sm:px-6">

      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-xs text-white/30">
        <Link href="/tracker" className="transition hover:text-white/60">Tableau de bord</Link>
        <span>/</span>
        <span className="text-white/55">Raccourci iOS</span>
      </nav>

      {/* ── Hero card ── */}
      <div className="relative overflow-hidden rounded-2xl border border-emerald-400/20 bg-gradient-to-br from-emerald-500/10 via-emerald-500/[0.03] to-transparent p-8">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(52,211,153,0.12),transparent_70%)]" />

        <div className="relative flex flex-wrap items-start gap-10">

          {/* Left: text */}
          <div className="flex-1 min-w-[240px]">
            <div className="mb-3 flex items-center gap-2">
              <span className="text-2xl">⚡</span>
              <span className="text-[10px] font-bold uppercase tracking-widest text-emerald-300">Raccourci iOS Natif · Gratuit</span>
            </div>
            <h1 className="text-3xl font-bold text-white">
              App Stats<br />
              <span className="text-emerald-300">par Friday Tracker</span>
            </h1>
            <p className="mt-3 max-w-md text-sm text-white/55">
              Partage n&apos;importe quelle app depuis l&apos;App Store → le raccourci récupère
              <strong className="text-white/80"> téléchargements &amp; revenus réels</strong> (SensorTower)
              et affiche le rapport instantanément. Zéro saisie, zéro app tierce.
            </p>

            {/* Feature pills */}
            <div className="mt-5 flex flex-wrap gap-2">
              {[
                { icon: "📤", label: "Share Sheet" },
                { icon: "⚡", label: "SensorTower live" },
                { icon: "🔗", label: "Ouvre App Tracker" },
                { icon: "📱", label: "iOS 16+" },
              ].map(f => (
                <div key={f.label} className="flex items-center gap-1.5 rounded-full border border-white/[0.08] bg-white/[0.04] px-3 py-1.5 text-xs text-white/60">
                  <span>{f.icon}</span>
                  <span>{f.label}</span>
                </div>
              ))}
            </div>

            {/* CTAs */}
            <div className="mt-7 flex flex-wrap gap-3">
              <a
                href="/tracker/shortcut"
                className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-emerald-400 to-cyan-500 px-6 py-3 text-sm font-bold text-[#050508] shadow-lg shadow-emerald-500/20 transition hover:brightness-110 active:scale-95"
              >
                <span>⬇</span>
                <span>Obtenir le raccourci</span>
              </a>
              <div className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.04] px-4 py-3 text-xs text-white/40">
                <span>📱</span>
                <span>iPhone &amp; iPad</span>
              </div>
            </div>
          </div>

          {/* Right: result mockup */}
          <div className="shrink-0">
            <ResultMockup />
          </div>
        </div>

        {/* Steps */}
        <div className="relative mt-8 grid gap-3 sm:grid-cols-3">
          {STEPS.map((s) => (
            <div key={s.n} className="flex items-start gap-3 rounded-xl border border-white/[0.06] bg-black/30 p-4">
              <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-emerald-400/20 text-sm font-bold text-emerald-300">
                {s.n}
              </div>
              <div>
                <p className="text-xs font-semibold text-white/80">{s.icon} {s.title}</p>
                <p className="mt-0.5 text-[11px] text-white/40">{s.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Back CTA */}
      <div className="flex items-center justify-between rounded-2xl border border-white/[0.06] bg-white/[0.02] p-5">
        <div>
          <p className="font-semibold text-white/80">Analyser une app maintenant</p>
          <p className="text-xs text-white/40">Recherche · Classements · Profil développeur</p>
        </div>
        <Link href="/tracker/search"
          className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-cyan-500 to-violet-600 px-5 py-3 text-sm font-semibold text-white transition hover:brightness-110">
          🔍 Explorer →
        </Link>
      </div>

    </div>
  );
}

/* ── Mockup résultat du raccourci ── */
function ResultMockup() {
  return (
    <div
      className="w-[190px] overflow-hidden rounded-[20px] border border-white/10 shadow-2xl"
      style={{ background: "#1c1c1e", boxShadow: "0 0 0 1px rgba(255,255,255,0.08), 0 20px 40px rgba(0,0,0,0.7)" }}
    >
      {/* iOS notification bar */}
      <div className="flex items-center gap-2 border-b border-white/10 px-4 py-3">
        <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-500 text-base font-bold text-white">$</div>
        <div>
          <p className="text-xs font-semibold text-white">App Stats</p>
          <p className="text-[9px] text-white/40">Friday Tracker</p>
        </div>
      </div>
      {/* Result text */}
      <div className="px-4 py-4">
        <p className="text-[11px] font-semibold text-white">📱 TikTok</p>
        <div className="mt-3 space-y-1.5">
          <div className="flex items-center gap-2">
            <span className="text-[10px] text-white/40">⬇️</span>
            <span className="text-[10px] text-white/80">6m téléch./mois</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] text-white/40">💰</span>
            <span className="text-[10px] text-white/80">$123m revenus/mois</span>
          </div>
        </div>
        <div className="mt-3 border-t border-white/10 pt-3">
          <p className="text-[9px] text-white/30">⚡ SensorTower · Monde</p>
          <p className="text-[9px] text-white/30">🔗 Friday Tracker →</p>
        </div>
      </div>
      {/* iOS button */}
      <div className="border-t border-white/10 px-4 py-3">
        <div className="flex w-full items-center justify-center rounded-xl bg-white/10 py-2">
          <span className="text-[11px] font-semibold text-white">OK</span>
        </div>
      </div>
    </div>
  );
}
