import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { fetchRecentlyRanked, COUNTRIES, COUNTRY_MAP, type CountryCode } from "@/lib/apple-charts";

export const metadata: Metadata = { title: "Nouveautés App Store" };
export const revalidate = 900;

interface PageProps {
  searchParams: Promise<{ country?: string }>;
}

function formatDate(dateStr: string) {
  if (!dateStr) return "";
  return new Date(dateStr).toLocaleDateString("fr-FR", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export default async function NewReleasesPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const country = (params.country ?? "us") as CountryCode;
  const countryData = COUNTRY_MAP[country];

  const allApps = await fetchRecentlyRanked(country, 100);
  const newApps = allApps.slice(0, 25);
  const newGames = allApps
    .filter((a) => a.category === "Games" || a.categoryId === "6014")
    .slice(0, 12);

  return (
    <div className="mx-auto max-w-7xl space-y-10 px-4 py-8 sm:px-6">
      {/* Header + country filter */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white">Nouveautés</h1>
          <p className="mt-1 text-sm text-white/45">
            Apps récemment sorties dans le top classement · {countryData?.name ?? country}
          </p>
        </div>
        <form method="GET" className="flex items-center gap-2">
          <select
            name="country"
            defaultValue={country}
            className="rounded-xl border border-white/10 bg-white/[0.04] px-3 py-2 text-sm text-white outline-none focus:border-cyan-400/40"
          >
            {COUNTRIES.map((c) => (
              <option key={c.code} value={c.code} className="bg-[#0d0d1a]">
                {c.flag} {c.name}
              </option>
            ))}
          </select>
          <button
            type="submit"
            className="rounded-xl border border-white/10 bg-white/[0.04] px-3 py-2 text-sm text-white/70 transition hover:bg-white/[0.08] hover:text-white"
          >
            OK
          </button>
        </form>
      </div>

      {/* New Apps We Love */}
      {newApps.length > 0 && (
        <section>
          <h2 className="mb-4 text-xs font-bold uppercase tracking-[0.22em] text-white/40">
            Sorties récentes · Top Gratuit
          </h2>
          <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
            {newApps.map((app) => (
              <Link
                key={app.id}
                href={`/tracker/apps/${app.id}?country=${country}`}
                className="group flex flex-col gap-3 rounded-2xl border border-white/[0.06] bg-white/[0.02] p-4 transition hover:border-white/15 hover:bg-white/[0.05]"
              >
                <div className="relative mx-auto h-16 w-16 overflow-hidden rounded-2xl ring-1 ring-white/10">
                  {app.artworkUrl ? (
                    <Image
                      src={app.artworkUrl}
                      alt={app.name}
                      fill
                      className="object-cover"
                      sizes="64px"
                      unoptimized
                    />
                  ) : (
                    <span className="flex h-full w-full items-center justify-center bg-white/5 text-xl font-bold text-white/40">
                      {app.name.charAt(0)}
                    </span>
                  )}
                </div>
                <div className="text-center">
                  <p className="line-clamp-2 text-sm font-semibold leading-tight text-white/85 group-hover:text-white">
                    {app.name}
                  </p>
                  <p className="mt-1 truncate text-xs text-white/40">
                    {app.artistName}
                  </p>
                  <span className="mt-2 inline-block rounded-full bg-white/[0.06] px-2.5 py-0.5 text-[11px] text-white/50">
                    {app.category}
                  </span>
                </div>
                <p className="text-center text-[11px] text-white/30">
                  {formatDate(app.releaseDate)}
                </p>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* New Games We Love */}
      {newGames.length > 0 && (
        <section>
          <h2 className="mb-4 text-xs font-bold uppercase tracking-[0.22em] text-white/40">
            Sorties récentes · Jeux
          </h2>
          <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {newGames.map((app) => (
              <Link
                key={app.id}
                href={`/tracker/apps/${app.id}?country=${country}`}
                className="group flex items-center gap-3 rounded-2xl border border-white/[0.06] bg-white/[0.02] p-4 transition hover:border-white/15 hover:bg-white/[0.05]"
              >
                <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-xl ring-1 ring-white/10">
                  {app.artworkUrl ? (
                    <Image
                      src={app.artworkUrl}
                      alt={app.name}
                      fill
                      className="object-cover"
                      sizes="48px"
                      unoptimized
                    />
                  ) : (
                    <span className="flex h-full w-full items-center justify-center bg-white/5 text-base font-bold text-white/40">
                      {app.name.charAt(0)}
                    </span>
                  )}
                </div>
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-white/85 group-hover:text-white">
                    {app.name}
                  </p>
                  <p className="truncate text-xs text-white/40">
                    {app.artistName}
                  </p>
                  <p className="text-[11px] text-white/30">
                    {formatDate(app.releaseDate)}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {newApps.length === 0 && (
        <div className="rounded-2xl border border-dashed border-white/10 py-24 text-center text-sm text-white/35">
          Aucune app récente dans le top classement pour ce marché.
        </div>
      )}
    </div>
  );
}
