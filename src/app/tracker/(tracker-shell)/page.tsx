import type { Metadata } from "next";
import { Suspense } from "react";
import { TopMoversGrid } from "@/components/tracker/top-movers-grid";
import { BuildNextShowcase } from "@/components/tracker/build-next-showcase";
import { MyfidLaunchStepsSection } from "@/components/tracker/myfid-launch-steps-section";
import { MyfidThreeStepsSection } from "@/components/tracker/myfid-three-steps-section";
import { TrackerLandingHeroTitle } from "@/components/tracker/tracker-landing-hero-title";
import { TrackerHeroSocialProofBadge } from "@/components/tracker/tracker-hero-social-proof-badge";
import { TrackerHeroTrackappCtas } from "@/components/tracker/tracker-hero-trackapp-ctas";
import { TrackerSaleNotificationsExperience } from "@/components/tracker/tracker-sale-notifications-experience";
import {
  listAppShowcaseVideoItemsEnriched,
  listAppShowcaseVideoItemsFallbackEnriched,
} from "@/lib/showcase-app-videos-enrich";

const TRACKER_ANCHOR_SCROLL =
  "scroll-mt-[calc(var(--tracker-header-offset)+1rem)]";

/** Au-delà de ce délai, on affiche les CA dérivés localement pour ne pas bloquer la landing. */
const SHOWCASE_ENRICH_BUDGET_MS = 8000;

export const metadata: Metadata = {
  title: "App Store Tracker — Trouvez les meilleures apps à copier",
};

export const revalidate = 900;

function TopMoversGridSkeleton() {
  return (
    <section
      aria-busy="true"
      aria-label="Chargement de la sélection d'apps"
      className="mx-auto max-w-xl sm:max-w-2xl"
      id="tracker-selection"
    >
      <div className="tracker-shimmer mx-auto mb-8 h-8 w-64 rounded-lg" aria-hidden />
      <div className="grid grid-cols-3 gap-2 sm:gap-3">
        {Array.from({ length: 6 }, (_, i) => (
          <div
            key={i}
            className="tracker-shimmer aspect-[4/5] rounded-2xl opacity-80"
            style={{ animationDelay: `${i * 40}ms` }}
          />
        ))}
      </div>
    </section>
  );
}

async function loadShowcaseVideos() {
  return Promise.race([
    listAppShowcaseVideoItemsEnriched().catch((err) => {
      console.error("[tracker] listAppShowcaseVideoItemsEnriched:", err);
      return listAppShowcaseVideoItemsFallbackEnriched();
    }),
    new Promise<Awaited<ReturnType<typeof listAppShowcaseVideoItemsEnriched>>>((resolve) =>
      setTimeout(
        () => resolve(listAppShowcaseVideoItemsFallbackEnriched()),
        SHOWCASE_ENRICH_BUDGET_MS,
      ),
    ),
  ]);
}

async function TrackerShowcaseSection() {
  const appShowcaseVideos = await loadShowcaseVideos();

  return (
    <div className="relative z-[1] mx-auto w-full max-w-[min(100%,110rem)] px-4 pb-16 pt-2 sm:px-6 sm:pb-28 sm:pt-4">
      <BuildNextShowcase videos={appShowcaseVideos} />
    </div>
  );
}

export default function TrackerDashboard() {
  return (
    <>
      <div
        id="tracker-app"
        className={`relative ${TRACKER_ANCHOR_SCROLL} z-0 -mt-[var(--tracker-header-offset)] bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,rgba(255,255,255,0.07),transparent)]`}
      >
        <div
          className="pointer-events-none absolute inset-x-0 top-0 z-0 min-h-[min(28rem,70vw)] bg-[radial-gradient(ellipse_72%_100%_at_50%_-12%,rgba(255,255,255,0.08),transparent_58%),radial-gradient(ellipse_46%_75%_at_92%_-5%,rgba(167,139,250,0.1),transparent_52%),radial-gradient(ellipse_40%_60%_at_8%_0%,rgba(56,189,248,0.06),transparent_55%)]"
          aria-hidden
        />
        <div className="relative z-[1] overflow-hidden">
          <div
            className="pointer-events-none absolute -bottom-32 -right-32 hidden h-[min(70vw,28rem)] w-[min(70vw,28rem)] rounded-full bg-gradient-to-br from-sky-400/12 via-violet-500/8 to-transparent blur-3xl md:block"
            aria-hidden
          />
          <div className="relative mx-auto max-w-4xl px-4 pt-[calc(var(--tracker-header-offset)+2.5rem)] text-center sm:pt-[calc(var(--tracker-header-offset)+3.5rem)]">
            <TrackerHeroSocialProofBadge />
            <TrackerLandingHeroTitle>Trouvez les meilleures apps à copier</TrackerLandingHeroTitle>
            <p className="tracker-landing-hero-description">
              Et créez votre app monétisable en 30&nbsp;jours.
            </p>
            <div className="mt-8 sm:mt-10">
              <TrackerSaleNotificationsExperience />
            </div>
            <TrackerHeroTrackappCtas />
          </div>
        </div>

        <Suspense fallback={null}>
          <TrackerShowcaseSection />
        </Suspense>
      </div>

      <div id="tracker-affiliation" className={TRACKER_ANCHOR_SCROLL}>
        <MyfidThreeStepsSection />
      </div>

      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
        <Suspense fallback={<TopMoversGridSkeleton />}>
          <TopMoversGrid />
        </Suspense>
      </div>

      <MyfidLaunchStepsSection />
    </>
  );
}
