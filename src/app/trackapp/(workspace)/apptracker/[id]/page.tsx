import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";

import {
  COUNTRY_MAP,
  daysSince,
  estimateMonthlyDownloads,
  formatBytes,
  formatEstimatedMonthlyRevenuePrecise,
  formatRatingCount,
  normalizeTrackerCountryParam,
  timeAgo,
  type CountryCode,
} from "@/lib/apple-charts";
import { getTrackappProfileFavorites } from "@/lib/trackapp-profile-favorites";
import { buildTrackerMetaAdLibraryContext } from "@/lib/tracker-meta-ad-resolution";
import { fetchAppDetailCached } from "@/lib/tracker-server-cache";
import { TrackappAppFavoriteButton } from "@/components/trackapp/trackapp-app-favorite-button";

export const revalidate = 900;

type PageProps = Readonly<{
  params: Promise<{ id: string }>;
  searchParams: Promise<{ country?: string }>;
}>;

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  const app = await fetchAppDetailCached(id);
  return {
    title: app ? `${app.name} — Apptracker` : "Apptracker — Trackapp",
    description: app?.description?.slice(0, 150),
  };
}

function Stars({ value }: Readonly<{ value: number }>) {
  if (!value) return <span className="text-slate-400">Pas encore de note</span>;
  const full = Math.floor(value);
  const half = value - full >= 0.5;
  return (
    <span className="flex items-center gap-0.5 text-amber-500">
      {Array.from({ length: 5 }, (_, i) => (
        <span key={i} className={i < full ? "" : half && i === full ? "opacity-55" : "opacity-20"}>
          ★
        </span>
      ))}
      <span className="ml-2 text-[0.88rem] font-semibold text-slate-700">{value.toFixed(1)}</span>
    </span>
  );
}

function MetricCard({ label, value, sub }: Readonly<{ label: string; value: string; sub?: string }>) {
  return (
    <div className="rounded-[20px] border border-[var(--dash-border)] bg-white p-4 shadow-[var(--dash-shadow)]">
      <p className="text-[0.72rem] font-bold uppercase tracking-[0.14em] text-slate-400">{label}</p>
      <p className="mt-2 text-[1.35rem] font-black tracking-tight text-[var(--dash-text)]">{value}</p>
      {sub ? <p className="mt-1 text-[0.8rem] text-[var(--dash-muted-light)]">{sub}</p> : null}
    </div>
  );
}

export default async function TrackappApptrackerDetailPage({ params, searchParams }: PageProps) {
  const { id } = await params;
  const sp = await searchParams;
  const country = normalizeTrackerCountryParam(sp.country);
  const appPromise = fetchAppDetailCached(id, country as CountryCode);
  const favoritesPromise = getTrackappProfileFavorites();
  const app = await appPromise;
  if (!app) notFound();

  const countryData = COUNTRY_MAP[country as CountryCode];
  const dlEst = estimateMonthlyDownloads(50, country);
  const revEst = formatEstimatedMonthlyRevenuePrecise(50, app.price, app.categoryId, country, app.id);
  const appAge = app.releaseDate ? daysSince(app.releaseDate) : Number.NaN;
  const screenshots = [...(app.screenshotUrls ?? []), ...(app.ipadScreenshotUrls ?? [])].slice(0, 6);
  const [metaLibraryContext, { loggedIn, appIds }] = await Promise.all([
    buildTrackerMetaAdLibraryContext({
      app,
      country,
    }),
    favoritesPromise,
  ]);
  const appFav = appIds.includes(app.id);

  return (
    <div className="relative z-[1] dashboard-main pb-16">
      <div className="mb-5">
        <Link href="/trackapp/apptracker" className="text-[0.88rem] font-semibold text-[var(--dash-muted-light)] no-underline hover:text-[var(--dash-text)]">
          ← Retour aux apps du mois
        </Link>
      </div>

      <section className="overflow-hidden rounded-[30px] border border-[var(--dash-border)] bg-white shadow-[var(--dash-shadow-lg)]">
        <div className="relative p-6 sm:p-8">
          <div className="pointer-events-none absolute inset-x-0 top-0 h-40 bg-gradient-to-b from-slate-100 to-transparent" aria-hidden />
          <div className="relative flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
            <div className="flex min-w-0 flex-col gap-5 sm:flex-row">
              <div className="relative h-28 w-28 shrink-0 overflow-hidden rounded-[28px] bg-slate-100 ring-1 ring-slate-200">
                {app.artworkUrl ? (
                  <Image src={app.artworkUrl} alt={app.name} fill className="object-cover" sizes="112px" priority />
                ) : null}
              </div>
              <div className="min-w-0">
                <p className="trackapp-workspace-hero-kicker mb-2">{countryData?.flag} {countryData?.name} · Apptracker</p>
                <h1 className="m-0 text-[clamp(2rem,5vw,3.4rem)] font-black leading-[0.98] tracking-[-0.06em] text-[var(--dash-text)]">
                  {app.name}
                </h1>
                <p className="mt-2 truncate text-[1rem] font-semibold text-[var(--dash-muted-light)]">{app.artistName}</p>
                <div className="mt-4 flex flex-wrap gap-2">
                  <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-[0.78rem] font-bold text-slate-600">{app.category || "App"}</span>
                  <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-[0.78rem] font-bold text-slate-600">{app.formattedPrice}</span>
                  {app.trackContentRating ? (
                    <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-[0.78rem] font-bold text-slate-600">{app.trackContentRating}</span>
                  ) : null}
                </div>
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-2 self-start sm:justify-end lg:items-start">
              {loggedIn ? (
                <TrackappAppFavoriteButton appId={app.id} initialFavorite={appFav} enabled />
              ) : null}
              <a
                href={app.trackViewUrl || app.url}
                target="_blank"
                rel="noreferrer"
                className="inline-flex min-h-11 shrink-0 items-center justify-center rounded-full bg-[#0f172a] px-5 text-[0.88rem] font-bold text-white no-underline transition hover:bg-[#111827]"
              >
                Ouvrir sur l&apos;App Store ↗
              </a>
            </div>
          </div>
        </div>
      </section>

      <section className="mt-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard label="Note" value={app.averageUserRating > 0 ? app.averageUserRating.toFixed(1) : "—"} sub={app.userRatingCount > 0 ? `${formatRatingCount(app.userRatingCount)} avis` : "Avis indisponibles"} />
        <MetricCard label="Téléchargements" value={dlEst} sub="estimation mensuelle" />
        <MetricCard label="Revenus" value={revEst} sub="estimation mensuelle" />
        <MetricCard label="Ancienneté" value={Number.isFinite(appAge) ? timeAgo(app.releaseDate) : "—"} sub={app.version ? `Version ${app.version}` : undefined} />
      </section>

      <section className="mt-5 grid gap-5 xl:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)]">
        <article className="rounded-[24px] border border-[var(--dash-border)] bg-white p-5 shadow-[var(--dash-shadow)]">
          <h2 className="m-0 text-[1.25rem] font-bold tracking-tight text-[var(--dash-text)]">Réseaux officiels</h2>
          {metaLibraryContext.officialWebsite ? (
            <a
              href={metaLibraryContext.officialWebsite}
              target="_blank"
              rel="noreferrer"
              className="mt-4 inline-flex rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-[0.82rem] font-bold text-slate-700 no-underline hover:bg-white"
            >
              Site officiel ↗
            </a>
          ) : null}
          {metaLibraryContext.socialProfiles.length > 0 ? (
            <div className="mt-4 flex flex-wrap gap-2">
              {metaLibraryContext.socialProfiles.map((profile) => (
                <a
                  key={`${profile.id}-${profile.url}`}
                  href={profile.url}
                  target="_blank"
                  rel="noreferrer"
                  className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-[0.82rem] font-bold text-slate-700 no-underline hover:bg-white"
                >
                  {profile.label}
                  {profile.hint ? ` · ${profile.hint}` : ""} ↗
                </a>
              ))}
            </div>
          ) : (
            <p className="mt-4 text-[0.9rem] leading-relaxed text-[var(--dash-muted-light)]">
              Aucun réseau officiel détecté pour l&apos;instant.
            </p>
          )}
        </article>

        <article className="rounded-[24px] border border-[var(--dash-border)] bg-white p-5 shadow-[var(--dash-shadow)]">
          <h2 className="m-0 text-[1.25rem] font-bold tracking-tight text-[var(--dash-text)]">Librairie Ads</h2>
          {metaLibraryContext.primaryMetaPageId ? (
            <>
              <p className="mt-3 text-[0.92rem] leading-relaxed text-[var(--dash-muted-light)]">
                Page Meta résolue :{" "}
                <strong className="text-slate-950">
                  {metaLibraryContext.entries[0]?.pageName ?? `ID ${metaLibraryContext.primaryMetaPageId}`}
                </strong>
                . Les créatives seront chargées uniquement via cette Page, sans recherche mot-clé.
              </p>
              <Link
                href={`/tracker/apps/${app.id}?country=${country}&tab=ads`}
                className="mt-4 inline-flex min-h-11 items-center justify-center rounded-full bg-[#0f172a] px-5 text-[0.88rem] font-bold text-white no-underline transition hover:bg-[#111827]"
              >
                Ouvrir les créatives page-only
              </Link>
            </>
          ) : (
            <>
              <p className="mt-3 text-[0.92rem] leading-relaxed text-[var(--dash-muted-light)]">
                Meta Ads Library : pas de page officielle validée. Les ads par mot-clé sont bloquées pour éviter les faux
                positifs.
              </p>
            </>
          )}
        </article>
      </section>

      <section className="mt-5 grid gap-5 xl:grid-cols-[minmax(0,1.1fr)_minmax(0,0.75fr)]">
        <article className="rounded-[24px] border border-[var(--dash-border)] bg-white p-5 shadow-[var(--dash-shadow)]">
          <h2 className="m-0 text-[1.25rem] font-bold tracking-tight text-[var(--dash-text)]">Description</h2>
          <p className="mt-4 whitespace-pre-wrap text-[0.92rem] leading-relaxed text-[var(--dash-muted-light)]">
            {app.description || "Aucune description disponible."}
          </p>
        </article>

        <article className="rounded-[24px] border border-[var(--dash-border)] bg-white p-5 shadow-[var(--dash-shadow)]">
          <h2 className="m-0 text-[1.25rem] font-bold tracking-tight text-[var(--dash-text)]">Signaux rapides</h2>
          <div className="mt-4 space-y-3">
            <div className="rounded-2xl bg-slate-50 p-4">
              <p className="text-[0.72rem] font-bold uppercase tracking-[0.14em] text-slate-400">Rating</p>
              <div className="mt-2"><Stars value={app.averageUserRating} /></div>
            </div>
            <div className="rounded-2xl bg-slate-50 p-4 text-[0.88rem] leading-relaxed text-slate-700">
              <strong className="text-slate-950">Taille :</strong> {formatBytes(app.fileSizeBytes)}
            </div>
            <div className="rounded-2xl bg-slate-50 p-4 text-[0.88rem] leading-relaxed text-slate-700">
              <strong className="text-slate-950">OS minimum :</strong> {app.minimumOsVersion || "—"}
            </div>
            <div className="rounded-2xl bg-slate-50 p-4 text-[0.88rem] leading-relaxed text-slate-700">
              <strong className="text-slate-950">Langues :</strong> {app.languageCodesISO2A?.slice(0, 8).join(", ") || "—"}
            </div>
          </div>
        </article>
      </section>

      {screenshots.length > 0 ? (
        <section className="mt-5 rounded-[24px] border border-[var(--dash-border)] bg-white p-5 shadow-[var(--dash-shadow)]">
          <h2 className="m-0 text-[1.25rem] font-bold tracking-tight text-[var(--dash-text)]">Screenshots App Store</h2>
          <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {screenshots.map((src) => (
              <div key={src} className="relative aspect-[9/19.5] overflow-hidden rounded-[22px] bg-slate-100 ring-1 ring-slate-200">
                <Image src={src} alt="" fill className="object-cover" sizes="(min-width: 1024px) 280px, 45vw" />
              </div>
            ))}
          </div>
        </section>
      ) : null}
    </div>
  );
}
