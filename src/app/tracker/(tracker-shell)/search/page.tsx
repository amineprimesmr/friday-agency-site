import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { TrackerNavLink } from "@/components/tracker/tracker-navigation";
import {
  searchApps,
  COUNTRIES,
  APPLE_CATEGORIES,
  COUNTRY_MAP,
  formatBytes,
  type SearchResult,
  formatRatingCount,
  estimateMonthlyDownloads,
  estimateMonthlyRevenue,
  normalizeTrackerCountryParam,
  type CountryCode,
} from "@/lib/apple-charts";

export const metadata: Metadata = { title: "Recherche — App Store Tracker" };
export const dynamic = "force-dynamic";

interface PageProps {
  searchParams: Promise<{ q?: string; country?: string; category?: string }>;
}

function Stars({ value }: { value: number }) {
  if (!value) return <span className="text-white/20">—</span>;
  return (
    <span className="flex items-center gap-0.5 text-amber-400 text-xs">
      {Array.from({ length: 5 }, (_, i) => (
        <span key={i} className={i < Math.floor(value) ? "" : value - Math.floor(value) >= 0.5 && i === Math.floor(value) ? "opacity-50" : "opacity-20"}>
          ★
        </span>
      ))}
      <span className="ml-1 text-white/50">{value.toFixed(1)}</span>
    </span>
  );
}

function AppCard({ app, country }: { app: SearchResult; country: CountryCode }) {
  const dlEst = estimateMonthlyDownloads(app.rank || 50, country);
  const revEst = estimateMonthlyRevenue(app.rank || 50, app.price, app.categoryId, country);

  return (
    <TrackerNavLink
      href={`/tracker/apps/${app.id}?country=${country}`}
      className="group flex items-start gap-4 rounded-2xl border border-white/[0.06] bg-white/[0.02] p-4 transition hover:border-white/15 hover:bg-white/[0.05]"
    >
      <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-2xl ring-1 ring-white/10">
        {app.artworkUrl ? (
          <Image src={app.artworkUrl} alt={app.name} fill className="object-cover" sizes="64px" unoptimized />
        ) : (
          <span className="flex h-full w-full items-center justify-center bg-white/5 text-xl font-bold text-white/40">
            {app.name.charAt(0)}
          </span>
        )}
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <p className="truncate font-semibold text-white/90 group-hover:text-white">{app.name}</p>
            <p className="truncate text-xs text-white/40">{app.artistName}</p>
          </div>
          <span className={`shrink-0 rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${
            app.price > 0
              ? "bg-amber-400/10 text-amber-300"
              : "bg-emerald-400/10 text-emerald-300"
          }`}>
            {app.price > 0 ? `${app.price}€` : "Gratuit"}
          </span>
        </div>

        <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1">
          <Stars value={app.averageUserRating} />
          {app.userRatingCount > 0 && (
            <span className="text-[11px] text-white/30">{formatRatingCount(app.userRatingCount)} avis</span>
          )}
          <span className="rounded-full bg-white/[0.05] px-2 py-0.5 text-[11px] text-white/45">
            {app.category}
          </span>
          {app.fileSizeBytes && (
            <span className="text-[11px] text-white/30">{formatBytes(app.fileSizeBytes)}</span>
          )}
        </div>

        <div className="mt-2 flex items-end gap-4">
          <div>
            <p className="text-[10px] text-white/30">Téléch. estimés</p>
            <p className="text-xs font-bold text-violet-300">
              {dlEst}
              <span className="font-normal text-white/30">/mois</span>
            </p>
          </div>
          <div>
            <p className="text-[10px] text-white/30">Revenus estimés</p>
            <p className="text-xs font-bold text-emerald-300">
              {revEst}
              <span className="font-normal text-white/30">/mois</span>
            </p>
          </div>
        </div>
      </div>
    </TrackerNavLink>
  );
}

export default async function SearchPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const q = params.q ?? "";
  const country = normalizeTrackerCountryParam(params.country);
  const category = params.category ?? "all";

  const results = q ? await searchApps(q, country, 40, category) : [];
  const countryData = COUNTRY_MAP[country];

  return (
    <div className="mx-auto max-w-5xl space-y-6 px-4 py-8 sm:px-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white">Recherche</h1>
        <p className="mt-0.5 text-sm text-white/40">
          500M+ apps indexées · iTunes Search API
        </p>
      </div>

      {/* Search form */}
      <form method="GET" className="space-y-3">
        <div className="flex gap-2">
          <div className="relative flex-1">
            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/30">
              🔍
            </span>
            <input
              name="q"
              defaultValue={q}
              placeholder="Nom d'app, développeur, mot-clé…"
              autoFocus
              className="w-full rounded-2xl border border-white/10 bg-white/[0.04] py-3 pl-10 pr-4 text-sm text-white placeholder:text-white/30 outline-none focus:border-white/25 focus:bg-white/[0.06]"
            />
          </div>
          <button
            type="submit"
            className="rounded-2xl bg-white px-6 py-3 text-sm font-semibold text-neutral-950 transition hover:bg-white/90"
          >
            Rechercher
          </button>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-2">
          {/* Country */}
          <select
            name="country"
            defaultValue={country}
            className="rounded-xl border border-white/10 bg-white/[0.04] px-3 py-2 text-xs text-white outline-none focus:border-white/25"
          >
            {COUNTRIES.map((c) => (
              <option key={c.code} value={c.code} className="bg-[#0d0d1a]">
                {c.flag} {c.name}
              </option>
            ))}
          </select>

          {/* Category */}
          <select
            name="category"
            defaultValue={category}
            className="rounded-xl border border-white/10 bg-white/[0.04] px-3 py-2 text-xs text-white outline-none focus:border-white/25"
          >
            {APPLE_CATEGORIES.map((c) => (
              <option key={c.id} value={c.id} className="bg-[#0d0d1a]">
                {c.name}
              </option>
            ))}
          </select>

          {/* Keep q in hidden field when changing filters */}
          <input type="hidden" name="q" value={q} />
        </div>
      </form>

      {/* Results */}
      {q && (
        <div>
          <p className="mb-4 text-xs text-white/35">
            {results.length > 0
              ? `${results.length} résultats pour "${q}" · ${countryData?.flag} ${countryData?.name}`
              : `Aucun résultat pour "${q}"`}
          </p>

          {results.length > 0 ? (
            <div className="space-y-2">
              {results.map((app) => (
                <AppCard key={app.id} app={app} country={country} />
              ))}
            </div>
          ) : (
            <div className="rounded-2xl border border-dashed border-white/10 py-20 text-center text-sm text-white/35">
              Aucune app trouvée. Essaye un autre terme.
            </div>
          )}
        </div>
      )}

      {/* Empty state */}
      {!q && (
        <div className="rounded-2xl border border-dashed border-white/[0.08] bg-white/[0.01] py-20 text-center">
          <p className="text-4xl">🔍</p>
          <p className="mt-4 text-sm font-medium text-white/50">
            Cherche n&apos;importe quelle app
          </p>
          <p className="mt-1 text-xs text-white/30">
            Accès à 500M+ apps · Données iTunes en temps réel
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-2">
            {["TikTok", "Duolingo", "Cal AI", "BeReal", "ChatGPT", "Snapchat"].map((term) => (
              <Link
                key={term}
                href={`/tracker/search?q=${encodeURIComponent(term)}&country=${country}`}
                className="rounded-full border border-white/[0.08] bg-white/[0.03] px-3 py-1.5 text-xs text-white/50 transition hover:border-white/20 hover:text-white/80"
              >
                {term}
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
