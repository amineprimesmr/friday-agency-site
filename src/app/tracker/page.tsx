import type { Metadata } from "next";
import Link from "next/link";
import {
  fetchTopCharts,
  fetchMovers,
  fetchRecentlyRanked,
  COUNTRY_MAP,
  type CountryCode,
  type MultiCountryApp,
} from "@/lib/apple-charts";
import { TopMoversGrid } from "@/components/tracker/top-movers-grid";
import { MoversTable } from "@/components/tracker/movers-table";
import { FreshDrops } from "@/components/tracker/fresh-drops";
import { Watchlist } from "@/components/tracker/watchlist";
import { BuildNextShowcase } from "@/components/tracker/build-next-showcase";
import { MyfidLaunchStepsSection } from "@/components/tracker/myfid-launch-steps-section";
import { MyfidThreeStepsSection } from "@/components/tracker/myfid-three-steps-section";
import { HeroAppIconRotator } from "@/components/tracker/hero-app-icon-rotator";
import { listAppShowcaseVideos } from "@/lib/app-videos";

const TRACKER_ANCHOR_SCROLL =
  "scroll-mt-[calc(5.75rem+env(safe-area-inset-top,0px)+1rem)] max-md:scroll-mt-[calc(6.375rem+env(safe-area-inset-top,0px)+1rem)]";

export const metadata: Metadata = {
  title: "App Store Tracker — Créez votre app et monétisez-la",
};

export const revalidate = 900;

const DASHBOARD_COUNTRIES: CountryCode[] = ["us", "fr", "gb", "de", "jp", "br", "mx"];

type DashboardData = Awaited<ReturnType<typeof getDashboardDataCore>>;

async function getDashboardDataCore() {
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

  return {
    moversData,
    freshDrops,
    topMoversGrid,
  };
}

/** Données classements : ne fait jamais planter la page (réseau / Apple / cache Turbopack). */
async function getDashboardData(): Promise<DashboardData> {
  try {
    return await getDashboardDataCore();
  } catch (err) {
    console.error("[tracker] getDashboardData:", err);
    return {
      moversData: { gainers: [], losers: [] },
      freshDrops: [],
      topMoversGrid: [],
    };
  }
}

export default async function TrackerDashboard() {
  const { moversData, freshDrops, topMoversGrid } = await getDashboardData();
  const appShowcaseVideos = listAppShowcaseVideos();

  const heroApps = topMoversGrid.filter((a) => a.country === "us").slice(0, 3);

  return (
    <>
      {/* Hero : titre + halo (overflow masqué) puis carrousel vidéos (ombres et débordements visibles) */}
      <div
        id="tracker-app"
        className={`border-b border-white/[0.06] bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,rgba(255,255,255,0.07),transparent)] ${TRACKER_ANCHOR_SCROLL}`}
      >
        <div className="relative overflow-hidden">
          <div
            className="pointer-events-none absolute -bottom-32 -right-32 h-[min(70vw,28rem)] w-[min(70vw,28rem)] rounded-full bg-gradient-to-br from-sky-400/12 via-violet-500/8 to-transparent blur-3xl"
            aria-hidden
          />
          <div className="relative mx-auto max-w-4xl px-4 pt-10 text-center sm:pt-14">
            <h1 className="bg-gradient-to-br from-white via-zinc-100 to-zinc-500 bg-clip-text pb-1.5 text-[clamp(2.5rem,9.5vw,6rem)] font-semibold leading-[1.04] tracking-[-0.035em] text-transparent sm:text-[clamp(2.65rem,10vw,6.25rem)]">
              Créez votre{" "}
              <HeroAppIconRotator
                apps={heroApps.map((a) => ({ id: a.id, name: a.name, artworkUrl: a.artworkUrl }))}
              />
              app et monétisez-la
            </h1>
            <p className="mx-auto mt-6 max-w-lg text-pretty text-[15px] leading-relaxed text-white/45 sm:mt-7 sm:text-base">
              Pubs, produits, emails, hooks, stratégies &amp; plus.
              <br />
              Tout au même endroit, actualisé chaque jour.
            </p>
            <div className="mt-10 flex justify-center px-2 sm:mt-11">
              <a
                href="https://www.icloud.com/shortcuts/a9d9656c24474d00b18eafb57393977b"
                target="_blank"
                rel="noopener noreferrer"
                className="tracker-extension-cta w-fit max-w-[min(100%,20rem)] sm:max-w-[min(100%,28rem)]"
              >
                <span>Extension gratuite →</span>
              </a>
            </div>
          </div>
        </div>

        <div className="relative mx-auto w-full max-w-[min(100%,110rem)] px-4 pb-16 pt-2 sm:px-6 sm:pb-28 sm:pt-4">
          <BuildNextShowcase videoSrcs={appShowcaseVideos} />
        </div>
      </div>

      <div id="tracker-affiliation" className={TRACKER_ANCHOR_SCROLL}>
        <MyfidThreeStepsSection />
      </div>

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
        <div id="tracker-ads-ia" className={TRACKER_ANCHOR_SCROLL}>
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

      <MyfidLaunchStepsSection />
    </>
  );
}
