import Image from "next/image";
import Link from "next/link";

import { ShowcaseHeroHeader } from "@/components/tracker/showcase-hero-header";
import { TrackerNavLink } from "@/components/tracker/tracker-navigation";
import { getTrackerCuratedPotentialAppsCached } from "@/lib/tracker-server-cache";
import type { MultiCountryApp } from "@/lib/apple-charts";
import { cn } from "@/lib/utils";

import "@/styles/tracker-hero-liquid-cta.css";

const POTENTIAL_GRID_COLS = 3;
const POTENTIAL_VISIBLE_ROWS = 2;
const POTENTIAL_UNLOCKED_COUNT = POTENTIAL_GRID_COLS * POTENTIAL_VISIBLE_ROWS;

const tileClass =
  "tracker-touch tracker-rise group flex flex-col items-center gap-1.5 rounded-2xl border border-white/[0.06] bg-white/[0.02] p-3 text-center transition hover:border-white/15 hover:bg-white/[0.05]";

function PotentialAppTileContent({
  app,
  imageAlt = "",
  monthlyRevenueHint,
}: {
  app: MultiCountryApp;
  imageAlt?: string;
  monthlyRevenueHint: string;
}) {
  return (
    <>
      <div className="relative h-12 w-12 overflow-hidden rounded-xl ring-1 ring-white/10">
        {app.artworkUrl ? (
          <Image src={app.artworkUrl} alt={imageAlt} fill className="object-cover" sizes="48px" unoptimized />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-white/5 text-base font-bold text-white/40">
            {app.name.charAt(0)}
          </div>
        )}
      </div>
      <p className="line-clamp-2 text-[11px] font-medium leading-tight text-white/80 group-hover:text-white">{app.name}</p>
      <span
        title="Revenu mensuel indicatif (agrégé monde ou estimation — non contractuel)"
        className="max-w-[100%] truncate rounded-full bg-black/45 px-1.5 py-0.5 text-[9px] font-semibold tracking-tight text-emerald-200/95 ring-1 ring-white/12"
      >
        {monthlyRevenueHint}
      </span>
    </>
  );
}

export async function TopMoversGrid() {
  const apps = await getTrackerCuratedPotentialAppsCached();
  if (!apps.length) return null;

  const unlocked = apps.slice(0, POTENTIAL_UNLOCKED_COUNT);
  const lockedPreview = apps.slice(POTENTIAL_UNLOCKED_COUNT);

  const gridGap = "gap-2 sm:gap-2.5 md:gap-3";

  return (
    <section aria-labelledby="top-movers-heading">
      <div className="px-12 sm:px-0">
        <ShowcaseHeroHeader
          align="center"
          badgeLabel=" APP DATABASE "
          bleed={false}
          headingId="top-movers-heading"
          subFooter="weekly"
          title={"Notre sélection d'app à fort potentiel"}
        />
      </div>

      <div className={cn("mx-auto flex max-w-xl flex-col sm:max-w-2xl", gridGap)}>
        <div className={cn("grid grid-cols-3", gridGap)}>
          {unlocked.map((app, i) => (
            <TrackerNavLink
              key={`${app.country}-${app.id}-open-${String(i)}`}
              href={`/tracker/apps/${app.id}?country=${app.country}`}
              className={tileClass}
              style={{ animationDelay: `${Math.min(i, 22) * 26}ms` }}
            >
              <PotentialAppTileContent app={app} imageAlt={app.name} monthlyRevenueHint={app.monthlyRevenueHint} />
            </TrackerNavLink>
          ))}
        </div>

        {lockedPreview.length > 0 ? (
          <div className="relative overflow-hidden rounded-2xl ring-1 ring-white/[0.06]">
            <div className={cn("grid grid-cols-3", gridGap, "blur-sm saturate-[0.97]")} aria-hidden>
              {lockedPreview.map((app, i) => (
                <div key={`${app.country}-${app.id}-blur-${String(i)}`} className={cn(tileClass, "pointer-events-none")}>
                  <PotentialAppTileContent app={app} monthlyRevenueHint={app.monthlyRevenueHint} />
                </div>
              ))}
            </div>

            <div
              aria-hidden
              className="pointer-events-none absolute inset-0 bg-gradient-to-b from-black/6 via-black/14 to-black/38"
            />

            <div className="absolute inset-0 z-[1] flex items-center justify-center px-4 py-6 sm:px-6">
              <Link
                href="/trackapp/paiement"
                className="tracker-hero-liquidglass !mt-0"
              >
                <span className="tracker-hero-liquidglass__label">Commencer maintenant</span>
              </Link>
            </div>
          </div>
        ) : null}
      </div>
    </section>
  );
}
