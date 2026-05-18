import type { Metadata } from "next";
import {
  fetchTopCharts,
  COUNTRY_MAP,
  TRACKER_DEFAULT_COUNTRY,
  type CountryCode,
  type MultiCountryApp,
} from "@/lib/apple-charts";
import { TopMoversGrid } from "@/components/tracker/top-movers-grid";
import { BuildNextShowcase } from "@/components/tracker/build-next-showcase";
import { MyfidLaunchStepsSection } from "@/components/tracker/myfid-launch-steps-section";
import { MyfidThreeStepsSection } from "@/components/tracker/myfid-three-steps-section";
import { HeroAppIconRotator } from "@/components/tracker/hero-app-icon-rotator";
import { TrackerHeroTrackappCtas } from "@/components/tracker/tracker-hero-trackapp-ctas";
import { TrackerSaleNotificationsStack } from "@/components/tracker/tracker-sale-notifications-stack";
import { listAppShowcaseVideoItems } from "@/lib/app-videos";

const TRACKER_ANCHOR_SCROLL =
  "scroll-mt-[calc(var(--tracker-header-offset)+1rem)]";

export const metadata: Metadata = {
  title: "App Store Tracker — Copiez une app et monétisez-la",
};

export const revalidate = 900;

const DASHBOARD_COUNTRIES: CountryCode[] = ["fr", "gb", "de", "jp", "br", "mx"];

type DashboardData = Awaited<ReturnType<typeof getDashboardDataCore>>;

async function getDashboardDataCore() {
  const countryResults = await Promise.all(
    DASHBOARD_COUNTRIES.map((c) =>
      fetchTopCharts(c, "top-free", 6).then((apps) =>
        apps.map(
          (app): MultiCountryApp => ({
            ...app,
            country: c,
            flag: COUNTRY_MAP[c]?.flag ?? "🌐",
          }),
        ),
      ),
    ),
  );

  const topMoversGrid: MultiCountryApp[] = countryResults.flat();

  return { topMoversGrid };
}

/** Données classements : ne fait jamais planter la page (réseau / Apple / cache Turbopack). */
async function getDashboardData(): Promise<DashboardData> {
  try {
    return await getDashboardDataCore();
  } catch (err) {
    console.error("[tracker] getDashboardData:", err);
    return { topMoversGrid: [] };
  }
}

export default async function TrackerDashboard() {
  const { topMoversGrid } = await getDashboardData();
  const appShowcaseVideos = listAppShowcaseVideoItems();

  const heroApps = topMoversGrid.filter((a) => a.country === TRACKER_DEFAULT_COUNTRY).slice(0, 3);

  return (
    <>
      {/* Hero : titre + halo (overflow masqué) puis carrousel vidéos */}
      <div
        id="tracker-app"
        className={`relative ${TRACKER_ANCHOR_SCROLL} z-0 -mt-[var(--tracker-header-offset)] bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,rgba(255,255,255,0.07),transparent)]`}
      >
        {/* Halo continue sous menu fixe (le main a un pt-réservé : sans ça le blur voit encore du noir) */}
        <div
          className="pointer-events-none absolute inset-x-0 top-0 z-0 min-h-[min(28rem,70vw)] bg-[radial-gradient(ellipse_72%_100%_at_50%_-12%,rgba(255,255,255,0.08),transparent_58%),radial-gradient(ellipse_46%_75%_at_92%_-5%,rgba(167,139,250,0.1),transparent_52%),radial-gradient(ellipse_40%_60%_at_8%_0%,rgba(56,189,248,0.06),transparent_55%)]"
          aria-hidden
        />
        <div className="relative z-[1] overflow-hidden">
          <div
            className="pointer-events-none absolute -bottom-32 -right-32 h-[min(70vw,28rem)] w-[min(70vw,28rem)] rounded-full bg-gradient-to-br from-sky-400/12 via-violet-500/8 to-transparent blur-3xl"
            aria-hidden
          />
          <div className="relative mx-auto max-w-4xl px-4 pt-[calc(var(--tracker-header-offset)+2.5rem)] text-center sm:pt-[calc(var(--tracker-header-offset)+3.5rem)]">
            <h1 className="bg-gradient-to-br from-white via-zinc-100 to-zinc-500 bg-clip-text pb-1.5 text-[clamp(2.5rem,9.5vw,6rem)] font-semibold leading-[1.04] tracking-[-0.035em] text-transparent sm:text-[clamp(2.65rem,10vw,6.25rem)]">
              Copiez une app{" "}
              <HeroAppIconRotator
                apps={heroApps.map((a) => ({ id: a.id, name: a.name, artworkUrl: a.artworkUrl }))}
              />{" "}
              et monétisez-la
            </h1>
            <div className="mt-8 sm:mt-10">
              <TrackerSaleNotificationsStack />
            </div>
            <TrackerHeroTrackappCtas />
          </div>
        </div>

        <div className="relative z-[1] mx-auto w-full max-w-[min(100%,110rem)] px-4 pb-16 pt-2 sm:px-6 sm:pb-28 sm:pt-4">
          <BuildNextShowcase videos={appShowcaseVideos} />
        </div>
      </div>

      <div id="tracker-affiliation" className={TRACKER_ANCHOR_SCROLL}>
        <MyfidThreeStepsSection />
      </div>

      <div className="mx-auto max-w-7xl space-y-10 px-4 py-10 sm:px-6">
        <TopMoversGrid />
      </div>

      <MyfidLaunchStepsSection />
    </>
  );
}
