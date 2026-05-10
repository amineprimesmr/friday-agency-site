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

export const metadata: Metadata = {
  title: "App Store Tracker — Classements iOS en temps réel",
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
      <MetricsBar stats={stats} />

      <div className="mx-auto max-w-7xl space-y-10 px-4 py-8 sm:px-6">

        {/* ── Hero CTA ── */}
        <div className="relative overflow-hidden rounded-2xl border border-white/[0.08] bg-gradient-to-br from-white/[0.06] via-white/[0.02] to-transparent p-6 sm:p-8">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(255,255,255,0.04),transparent_65%)]" />
          <div className="relative flex flex-wrap items-center justify-between gap-6">
            <div>
              <div className="mb-2 flex items-center gap-2">
                <span className="flex h-1.5 w-1.5 animate-pulse rounded-full bg-white/50" />
                <span className="text-[10px] font-bold uppercase tracking-widest text-white/45">Données live · Apple RSS + iTunes API</span>
              </div>
              <h1 className="text-2xl font-bold text-white sm:text-3xl">
                Analyse n&apos;importe quelle app iOS
              </h1>
              <p className="mt-1.5 max-w-lg text-sm text-white/50">
                Classements, estimations téléchargements & revenus, publicités Meta/TikTok/Google, profil développeur. 500M+ apps indexées.
              </p>
            </div>
            <div className="flex flex-col gap-2 sm:flex-row">
              <Link
                href="/tracker/search"
                className="flex items-center gap-2 rounded-2xl bg-white px-5 py-3 text-sm font-semibold text-neutral-950 transition hover:bg-white/90"
              >
                🔍 Explorer les apps
              </Link>
              <Link
                href="/tracker/top-charts"
                className="flex items-center gap-2 rounded-2xl border border-white/10 bg-white/[0.06] px-5 py-3 text-sm font-semibold text-white/80 transition hover:bg-white/[0.1] hover:text-white"
              >
                📊 Voir les classements
              </Link>
            </div>
          </div>

          {/* Mini preview des top apps */}
          {heroApps.length > 0 && (
            <div className="relative mt-6 flex gap-3">
              {heroApps.map((app) => (
                <Link
                  key={app.id}
                  href={`/tracker/apps/${app.id}?country=us`}
                  className="group flex items-center gap-2 rounded-xl border border-white/[0.08] bg-white/[0.04] px-3 py-2 transition hover:border-white/20 hover:bg-white/[0.08]"
                >
                  <span className="relative h-8 w-8 shrink-0 overflow-hidden rounded-lg ring-1 ring-white/10">
                    {app.artworkUrl ? (
                      <Image src={app.artworkUrl} alt={app.name} fill className="object-cover" sizes="32px" unoptimized />
                    ) : (
                      <span className="flex h-full w-full items-center justify-center bg-white/5 text-xs font-bold text-white/40">{app.name.charAt(0)}</span>
                    )}
                  </span>
                  <div>
                    <p className="text-xs font-medium text-white/80 group-hover:text-white">{app.name}</p>
                    <p className="text-[10px] text-white/35">#{app.rank} US</p>
                  </div>
                </Link>
              ))}
              <span className="flex items-center text-xs text-white/25">+{topMoversGrid.filter((a) => a.country === "us").length - 3} apps →</span>
            </div>
          )}
        </div>

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
