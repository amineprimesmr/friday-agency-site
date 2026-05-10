import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import {
  searchApps,
  COUNTRY_MAP,
  type CountryCode,
  estimateMonthlyDownloads,
  estimateMonthlyRevenue,
  formatRatingCount,
} from "@/lib/apple-charts";

export const dynamic = "force-dynamic";

interface PageProps {
  params: Promise<{ name: string }>;
  searchParams: Promise<{ country?: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { name } = await params;
  return {
    title: `${decodeURIComponent(name)} — Profil développeur · App Store Tracker`,
  };
}

function Stars({ value }: { value: number }) {
  if (!value) return <span className="text-white/20">—</span>;
  return (
    <span className="flex items-center gap-0.5 text-amber-400 text-xs">
      {Array.from({ length: 5 }, (_, i) => (
        <span key={i} className={i < Math.floor(value) ? "" : value - Math.floor(value) >= 0.5 && i === Math.floor(value) ? "opacity-50" : "opacity-20"}>★</span>
      ))}
      <span className="ml-1 text-white/50">{value.toFixed(1)}</span>
    </span>
  );
}

export default async function DeveloperPage({ params, searchParams }: PageProps) {
  const { name } = await params;
  const { country = "us" } = await searchParams;
  const developerName = decodeURIComponent(name);
  const countryData = COUNTRY_MAP[country as CountryCode];

  // Search all apps by this developer
  const apps = await searchApps(developerName, country, 50);
  // Filter to only apps by this exact developer (or similar name)
  const developerApps = apps.filter(
    (a) =>
      a.artistName.toLowerCase().includes(developerName.toLowerCase()) ||
      developerName.toLowerCase().includes(a.artistName.toLowerCase()),
  );
  const displayApps = developerApps.length > 0 ? developerApps : apps.slice(0, 10);

  // Aggregate stats
  const totalRatings = displayApps.reduce((s, a) => s + a.userRatingCount, 0);
  const avgRating =
    displayApps.filter((a) => a.averageUserRating > 0).reduce((s, a) => s + a.averageUserRating, 0) /
    (displayApps.filter((a) => a.averageUserRating > 0).length || 1);

  // Meta Ad Library URL for this developer
  const metaLibraryUrl = `https://www.facebook.com/ads/library/?active_status=active&ad_type=all&country=ALL&q=${encodeURIComponent(developerName)}&search_type=keyword_unordered`;
  const tiktokUrl = `https://ads.tiktok.com/business/creativecenter/inspiration/topads/pc/en?search=${encodeURIComponent(developerName)}`;
  const googleUrl = `https://adstransparency.google.com/?region=anywhere&query=${encodeURIComponent(developerName)}`;

  return (
    <div className="mx-auto max-w-5xl space-y-8 px-4 py-8 sm:px-6">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-xs text-white/30">
        <Link href="/tracker" className="transition hover:text-white/60">Tableau de bord</Link>
        <span>/</span>
        <Link href="/tracker/search" className="transition hover:text-white/60">Recherche</Link>
        <span>/</span>
        <span className="text-white/55">{developerName}</span>
      </nav>

      {/* Developer hero */}
      <div className="rounded-2xl border border-white/[0.07] bg-white/[0.025] p-6">
        <div className="flex flex-wrap items-center gap-5">
          {/* Avatar placeholder */}
          <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-[22px] bg-gradient-to-br from-cyan-400/20 to-violet-500/20 text-3xl font-bold text-white/70 ring-1 ring-white/10">
            {developerName.charAt(0).toUpperCase()}
          </div>

          <div className="flex-1 space-y-2">
            <h1 className="text-2xl font-bold text-white">{developerName}</h1>
            <div className="flex flex-wrap gap-2">
              <span className="rounded-full border border-white/10 bg-white/[0.04] px-2.5 py-1 text-[11px] text-white/55">
                📱 {displayApps.length} apps
              </span>
              <span className="rounded-full border border-white/10 bg-white/[0.04] px-2.5 py-1 text-[11px] text-white/55">
                ⭐ {avgRating > 0 ? avgRating.toFixed(1) : "—"} moy.
              </span>
              <span className="rounded-full border border-white/10 bg-white/[0.04] px-2.5 py-1 text-[11px] text-white/55">
                💬 {formatRatingCount(totalRatings)} avis total
              </span>
              {countryData && (
                <span className="rounded-full border border-white/10 bg-white/[0.04] px-2.5 py-1 text-[11px] text-white/55">
                  {countryData.flag} {countryData.name}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Ad intelligence links */}
      <div>
        <h2 className="mb-3 text-[11px] font-bold uppercase tracking-[0.22em] text-white/40">
          Intelligence Publicitaire
        </h2>
        <div className="grid gap-3 sm:grid-cols-3">
          <a
            href={metaLibraryUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="group flex items-center gap-4 rounded-2xl border border-blue-400/15 bg-blue-400/[0.05] p-4 transition hover:border-blue-400/30 hover:bg-blue-400/10"
          >
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-500/20 text-blue-400">
              <svg viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5">
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
              </svg>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-blue-300 group-hover:text-blue-200">Meta Ad Library</p>
              <p className="text-[11px] text-white/40">Toutes les pubs Facebook & Instagram actives</p>
            </div>
            <span className="text-white/30 group-hover:text-white/60">↗</span>
          </a>

          <a
            href={tiktokUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="group flex items-center gap-4 rounded-2xl border border-white/[0.06] bg-white/[0.02] p-4 transition hover:border-white/15 hover:bg-white/[0.05]"
          >
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/[0.06] text-white text-base font-black">
              TT
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-white/80 group-hover:text-white">TikTok Creative Center</p>
              <p className="text-[11px] text-white/40">Top ads et créas performantes</p>
            </div>
            <span className="text-white/30 group-hover:text-white/60">↗</span>
          </a>

          <a
            href={googleUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="group flex items-center gap-4 rounded-2xl border border-red-400/15 bg-red-400/[0.03] p-4 transition hover:border-red-400/25 hover:bg-red-400/[0.07]"
          >
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-red-500/10 text-xl">
              🔴
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-red-300 group-hover:text-red-200">Google Transparency</p>
              <p className="text-[11px] text-white/40">UAC, YouTube, Search, Display</p>
            </div>
            <span className="text-white/30 group-hover:text-white/60">↗</span>
          </a>
        </div>
      </div>

      {/* Apps */}
      <div>
        <h2 className="mb-3 text-[11px] font-bold uppercase tracking-[0.22em] text-white/40">
          Apps publiées ({displayApps.length})
        </h2>
        <div className="space-y-2">
          {displayApps.map((app, i) => (
            <Link
              key={app.id}
              href={`/tracker/apps/${app.id}?country=${country}`}
              className="group flex items-start gap-4 rounded-2xl border border-white/[0.06] bg-white/[0.02] p-4 transition hover:border-white/15 hover:bg-white/[0.05]"
            >
              <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-2xl ring-1 ring-white/10">
                {app.artworkUrl ? (
                  <Image src={app.artworkUrl} alt={app.name} fill className="object-cover" sizes="56px" unoptimized />
                ) : (
                  <span className="flex h-full w-full items-center justify-center bg-white/5 text-lg font-bold text-white/40">
                    {app.name.charAt(0)}
                  </span>
                )}
              </div>

              <div className="min-w-0 flex-1">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="truncate font-semibold text-white/90 group-hover:text-white">{app.name}</p>
                    <p className="text-xs text-white/40">{app.category}</p>
                  </div>
                  <div className="flex shrink-0 flex-col items-end gap-1">
                    <span className={`rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${
                      app.price > 0 ? "bg-amber-400/10 text-amber-300" : "bg-emerald-400/10 text-emerald-300"
                    }`}>
                      {app.price > 0 ? `${app.price}€` : "Gratuit"}
                    </span>
                  </div>
                </div>
                <div className="mt-1.5 flex flex-wrap items-center gap-x-4 gap-y-1">
                  <Stars value={app.averageUserRating} />
                  {app.userRatingCount > 0 && (
                    <span className="text-[11px] text-white/30">{formatRatingCount(app.userRatingCount)} avis</span>
                  )}
                  <span className="text-[11px] text-violet-300">{estimateMonthlyDownloads(i + 1, country)}/mois</span>
                  <span className="text-[11px] text-emerald-300">{estimateMonthlyRevenue(i + 1, app.price, app.categoryId, country)}/mois</span>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {displayApps.length === 0 && (
          <div className="rounded-2xl border border-dashed border-white/10 py-20 text-center text-sm text-white/35">
            Aucune app trouvée pour ce développeur.
          </div>
        )}
      </div>
    </div>
  );
}
