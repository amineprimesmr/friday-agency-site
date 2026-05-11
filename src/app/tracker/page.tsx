import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import {
  fetchTopCharts,
  fetchMovers,
  fetchRecentlyRanked,
  COUNTRIES,
  COUNTRY_MAP,
  type CountryCode,
  type MultiCountryApp,
} from "@/lib/apple-charts";
import { MetricsBar } from "@/components/tracker/metrics-bar";
import { TopMoversGrid } from "@/components/tracker/top-movers-grid";
import { MoversTable } from "@/components/tracker/movers-table";
import { FreshDrops } from "@/components/tracker/fresh-drops";
import { Watchlist } from "@/components/tracker/watchlist";
import { HeroAppIconRotator } from "@/components/tracker/hero-app-icon-rotator";

export const metadata: Metadata = {
  title: "App Store Tracker — Trouvez la meilleure app à lancer",
};

export const revalidate = 900;

const DASHBOARD_COUNTRIES: CountryCode[] = ["us", "fr", "gb", "de", "jp", "br", "mx"];

async function getDashboardData() {
  const [moversData, freshDrops, ...countryResults] = await Promise.all([
    fetchMovers("us", "gb"),
    fetchRecentlyRanked("us", 8),
    ...DASHBOARD_COUNTRIES.map((c) =>
      fetchTopCharts(c, "top-free", 6).then((apps) =>
        apps.map((app): MultiCountryApp => ({
          ...app,
          country: c,
          flag: COUNTRY_MAP[c]?.flag ?? "🌐",
        })),
      ),
    ),
  ]);

  const topMoversGrid: MultiCountryApp[] = countryResults.flat();
  const appsTracked = topMoversGrid.length * 4 + 200;

  return {
    moversData,
    freshDrops,
    topMoversGrid,
    stats: {
      appsTracked,
      countriesTracked: COUNTRIES.length,
      topGain: moversData.gainers[0]?.change ?? 0,
      newToday: freshDrops.length,
    },
  };
}

export default async function TrackerDashboard() {
  const { moversData, freshDrops, topMoversGrid, stats } = await getDashboardData();

  // Top 3 apps US pour la hero section
  const heroApps = topMoversGrid.filter((a) => a.country === "us").slice(0, 3);

  return (
    <>
      {/* ── Hero : headline centrée sous le menu ── */}
      <section className="relative overflow-hidden border-b border-white/[0.06] bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,rgba(255,255,255,0.07),transparent)]">
        {/* Halo bas-droite — renforce le dégradé du titre sans surcharger */}
        <div
          className="pointer-events-none absolute -bottom-32 -right-32 h-[min(70vw,28rem)] w-[min(70vw,28rem)] rounded-full bg-gradient-to-br from-sky-400/12 via-violet-500/8 to-transparent blur-3xl"
          aria-hidden
        />
        <div className="relative mx-auto max-w-4xl px-4 pb-12 pt-10 text-center sm:pb-16 sm:pt-14">
          <p className="mb-6 inline-flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.28em] text-white/40">
            <span className="h-px w-8 bg-gradient-to-r from-transparent to-white/25" aria-hidden />
            Intelligence App Store
            <span className="h-px w-8 bg-gradient-to-l from-transparent to-white/25" aria-hidden />
          </p>
          <h1 className="bg-gradient-to-br from-white via-zinc-100 to-zinc-500 bg-clip-text pb-1.5 text-[clamp(2.5rem,9.5vw,6rem)] font-semibold leading-[1.04] tracking-[-0.035em] text-transparent sm:text-[clamp(2.65rem,10vw,6.25rem)]">
            Trouvez la meilleure{" "}
            <HeroAppIconRotator
              apps={heroApps.map((a) => ({ id: a.id, name: a.name, artworkUrl: a.artworkUrl }))}
            />
            app à lancer
          </h1>
          <p className="mx-auto mt-6 max-w-lg text-pretty text-[15px] leading-relaxed text-white/45 sm:mt-7 sm:text-base">
            Classements temps réel, estimations, créatives publicitaires et signaux marché — tout pour comparer et prioriser votre prochain lancement.
          </p>
          <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:mt-11 sm:flex-row sm:gap-4">
            <Link
              href="/tracker/search"
              className="inline-flex min-h-11 w-full max-w-xs items-center justify-center rounded-2xl bg-white px-6 text-sm font-semibold text-neutral-950 shadow-[0_0_0_1px_rgba(255,255,255,0.08)] transition hover:bg-white/95 sm:w-auto sm:max-w-none"
            >
              Explorer les apps
            </Link>
            <a
              href="https://www.icloud.com/shortcuts/a9d9656c24474d00b18eafb57393977b"
              target="_blank"
              rel="noopener noreferrer"
              className="tracker-shiny-cta min-h-11 w-full max-w-xs sm:w-auto sm:max-w-none"
            >
              <span>Extension gratuite →</span>
            </a>
          </div>

          {heroApps.length > 0 && (
            <div className="mx-auto mt-12 flex max-w-xl flex-wrap items-center justify-center gap-2 sm:gap-3">
              <span className="w-full text-center text-[10px] font-medium uppercase tracking-[0.2em] text-white/30 sm:w-auto sm:text-left">
                Tendance US
              </span>
              {heroApps.map((app) => (
                <Link
                  key={app.id}
                  href={`/tracker/apps/${app.id}?country=us`}
                  className="group inline-flex items-center gap-2 rounded-xl border border-white/[0.08] bg-white/[0.03] px-3 py-2 transition hover:border-white/18 hover:bg-white/[0.06]"
                >
                  <span className="relative h-9 w-9 shrink-0 overflow-hidden rounded-lg ring-1 ring-white/10">
                    {app.artworkUrl ? (
                      <Image src={app.artworkUrl} alt={app.name} fill className="object-cover" sizes="36px" unoptimized />
                    ) : (
                      <span className="flex h-full w-full items-center justify-center bg-white/5 text-xs font-bold text-white/40">
                        {app.name.charAt(0)}
                      </span>
                    )}
                  </span>
                  <span className="text-left">
                    <span className="block text-xs font-medium text-white/85 group-hover:text-white">{app.name}</span>
                    <span className="text-[10px] text-white/35">Top gratuit · #{app.rank}</span>
                  </span>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>

      <MetricsBar stats={stats} />

      <div className="mx-auto max-w-7xl space-y-10 px-4 py-10 sm:px-6">

        {/* ── Top movers + Watchlist ── */}
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <TopMoversGrid apps={topMoversGrid} />
          </div>
          <div>
            <Watchlist />
          </div>
        </div>

        {/* ── Recherche rapide par catégorie ── */}
        <div>
          <h2 className="mb-4 text-xs font-bold uppercase tracking-[0.22em] text-white/40">
            Explorer par catégorie
          </h2>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 lg:grid-cols-8">
            {[
              { icon: "🎮", name: "Jeux", id: "6014" },
              { icon: "💰", name: "Finance", id: "6015" },
              { icon: "🏃", name: "Santé", id: "6013" },
              { icon: "📸", name: "Photo", id: "6008" },
              { icon: "🎵", name: "Musique", id: "6011" },
              { icon: "📚", name: "Éducation", id: "6017" },
              { icon: "⚡", name: "Productivité", id: "6007" },
              { icon: "🛍", name: "Shopping", id: "6024" },
            ].map((cat) => (
              <Link
                key={cat.id}
                href={`/tracker/top-charts?category=${cat.id}`}
                className="group flex flex-col items-center gap-1.5 rounded-2xl border border-white/[0.06] bg-white/[0.02] py-4 text-center transition hover:border-white/15 hover:bg-white/[0.05]"
              >
                <span className="text-2xl">{cat.icon}</span>
                <span className="text-[11px] font-medium text-white/60 group-hover:text-white/90">{cat.name}</span>
              </Link>
            ))}
          </div>
        </div>

        {/* ── Fresh Drops ── */}
        <FreshDrops apps={freshDrops} />

        {/* ── Gainers / Losers ── */}
        <div className="grid gap-6 lg:grid-cols-2">
          <MoversTable title="Gains Trans-marchés (US → UK)" apps={moversData.gainers} type="gainer" />
          <MoversTable title="Marché Local (US, hors UK)" apps={moversData.losers} type="loser" />
        </div>

        {/* ── Outils Intelligence ── */}
        <div>
          <h2 className="mb-4 text-xs font-bold uppercase tracking-[0.22em] text-white/40">
            Outils d&apos;intelligence
          </h2>
          <div className="grid gap-4 sm:grid-cols-3">
            {[
              {
                icon: "🔍",
                title: "Recherche universelle",
                desc: "500M+ apps — cherche par nom, développeur, mot-clé",
                href: "/tracker/search",
                accent: "from-white/12 to-white/[0.02]",
                border: "border-white/10",
              },
              {
                icon: "📣",
                title: "Intelligence publicitaire",
                desc: "Pubs Meta, TikTok, Google de chaque app",
                href: "/tracker/search",
                accent: "from-white/10 to-white/[0.02]",
                border: "border-white/10",
              },
              {
                icon: "🌍",
                title: "Classements mondiaux",
                desc: "14 pays · comparaison cross-market",
                href: "/tracker/top-charts",
                accent: "from-white/10 to-white/[0.02]",
                border: "border-white/10",
              },
            ].map((tool) => (
              <Link
                key={tool.title}
                href={tool.href}
                className={`group flex flex-col gap-3 rounded-2xl border ${tool.border} bg-gradient-to-br ${tool.accent} p-5 transition hover:brightness-110`}
              >
                <span className="text-3xl">{tool.icon}</span>
                <div>
                  <p className="font-semibold text-white/90 group-hover:text-white">{tool.title}</p>
                  <p className="mt-0.5 text-xs text-white/45">{tool.desc}</p>
                </div>
                <span className="text-xs text-white/30 group-hover:text-white/60">Accéder →</span>
              </Link>
            ))}
          </div>
        </div>

      </div>
    </>
  );
}
