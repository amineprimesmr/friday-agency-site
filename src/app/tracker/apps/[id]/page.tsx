import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  fetchAppDetail,
  fetchCountryRankings,
  fetchCategoryApps,
  fetchSensorTowerApp,
  COUNTRY_MAP,
  type CountryCode,
  type CountryRanking,
  type AppEntry,
  formatRatingCount,
  formatBytes,
  estimateMonthlyDownloads,
  estimateMonthlyRevenue,
  timeAgo,
  daysSince,
} from "@/lib/apple-charts";
import { WatchButton } from "@/components/tracker/watch-button";
import { AppScreenshots } from "@/components/tracker/app-screenshots";
import { AppDescription } from "@/components/tracker/app-description";
import { AppCreatives } from "@/components/tracker/app-creatives";
import { AppAds } from "@/components/tracker/app-ads";
import { AppTabs } from "@/components/tracker/app-tabs";
import { Suspense } from "react";

export const revalidate = 900;

interface PageProps {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ country?: string; tab?: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  const app = await fetchAppDetail(id);
  if (!app) return {};
  return {
    title: `${app.name} — App Intelligence · App Store Tracker`,
    description: `Classements, estimations téléchargements & revenus, publicités Meta/TikTok. ${app.description?.slice(0, 120)}`,
  };
}

/* ── Helpers ────────────────────────────────────────────────────────────────── */

function Stars({ value, size = "md" }: { value: number; size?: "sm" | "md" | "lg" }) {
  const full = Math.floor(value);
  const half = value - full >= 0.5;
  const cls = { sm: "text-xs", md: "text-sm", lg: "text-base" }[size];
  return (
    <span className={`flex items-center gap-0.5 text-amber-400 ${cls}`}>
      {Array.from({ length: 5 }, (_, i) => (
        <span key={i} className={i < full ? "" : half && i === full ? "opacity-50" : "opacity-20"}>★</span>
      ))}
    </span>
  );
}

function RankBadge({ rank }: { rank: number | null }) {
  if (!rank) return <span className="text-xs text-white/25">—</span>;
  const color =
    rank <= 10 ? "bg-emerald-400/15 text-emerald-300 border-emerald-400/20"
    : rank <= 50 ? "bg-amber-400/15 text-amber-300 border-amber-400/20"
    : "bg-white/[0.06] text-white/50 border-white/10";
  return (
    <span className={`inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-bold tabular-nums ${color}`}>
      #{rank}
    </span>
  );
}

function StatPill({ label, value, color = "text-white/70" }: { label: string; value: string; color?: string }) {
  return (
    <div className="flex flex-col items-center rounded-xl border border-white/[0.06] bg-white/[0.02] px-4 py-3 text-center">
      <p className={`text-sm font-bold tabular-nums ${color}`}>{value}</p>
      <p className="mt-0.5 text-[10px] text-white/35">{label}</p>
    </div>
  );
}

/* ── Sidebar panels ─────────────────────────────────────────────────────────── */

function CountryRankingsPanel({ rankings, rankedCount }: { rankings: CountryRanking[]; rankedCount: number }) {
  const sorted = [...rankings].sort((a, b) => {
    if (a.rank === null && b.rank === null) return 0;
    if (a.rank === null) return 1;
    if (b.rank === null) return -1;
    return a.rank - b.rank;
  });

  return (
    <div className="rounded-2xl border border-white/[0.07] bg-white/[0.025] p-5">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-[11px] font-bold uppercase tracking-[0.22em] text-white/40">Classements par pays</h2>
        <span className="rounded-full bg-white/[0.06] px-2 py-0.5 text-[11px] text-white/40">
          {rankedCount}/{rankings.length} pays
        </span>
      </div>
      <div className="space-y-1">
        {sorted.map((r) => (
          <div
            key={r.country}
            className={`flex items-center gap-3 rounded-xl px-3 py-2 transition ${r.rank ? "bg-white/[0.03] hover:bg-white/[0.06]" : "opacity-35"}`}
          >
            <span className="text-base leading-none">{r.flag}</span>
            <span className="flex-1 text-xs text-white/65">{r.name}</span>
            <RankBadge rank={r.rank} />
            {r.rank && (
              <div className="h-1.5 w-16 overflow-hidden rounded-full bg-white/[0.06]">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-cyan-400 to-violet-500"
                  style={{ width: `${Math.max(4, 100 - (r.rank / 100) * 100)}%` }}
                />
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

function CompetitorsPanel({ apps, currentId, country, category }: {
  apps: AppEntry[];
  currentId: string;
  country: string;
  category: string;
}) {
  return (
    <div className="rounded-2xl border border-white/[0.07] bg-white/[0.025] p-5">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-[11px] font-bold uppercase tracking-[0.22em] text-white/40">Concurrents</h2>
        <span className="rounded-full bg-white/[0.06] px-2 py-0.5 text-[11px] text-white/40">{category}</span>
      </div>
      <div className="space-y-1.5">
        {apps.map((app) => (
          <Link
            key={app.id}
            href={`/tracker/apps/${app.id}?country=${country}`}
            className={`group flex items-center gap-3 rounded-xl px-3 py-2 transition hover:bg-white/[0.06] ${app.id === currentId ? "bg-cyan-400/[0.05]" : ""}`}
          >
            <span className="font-mono text-xs font-semibold text-white/35">#{app.rank}</span>
            <span className="relative h-8 w-8 shrink-0 overflow-hidden rounded-lg ring-1 ring-white/10">
              {app.artworkUrl ? (
                <Image src={app.artworkUrl} alt={app.name} fill className="object-cover" sizes="32px" unoptimized />
              ) : (
                <span className="flex h-full w-full items-center justify-center bg-white/5 text-xs font-bold text-white/40">
                  {app.name.charAt(0)}
                </span>
              )}
            </span>
            <span className={`flex-1 truncate text-xs font-medium group-hover:text-white ${app.id === currentId ? "text-cyan-300" : "text-white/70"}`}>
              {app.name}
            </span>
            <span className="shrink-0 text-[11px] text-white/30">{estimateMonthlyDownloads(app.rank, country)}</span>
          </Link>
        ))}
        {apps.length === 0 && (
          <p className="py-6 text-center text-xs text-white/25">Aucun concurrent trouvé</p>
        )}
      </div>
    </div>
  );
}

/* ── Page ───────────────────────────────────────────────────────────────────── */

export default async function AppDetailPage({ params, searchParams }: PageProps) {
  const { id } = await params;
  const { country = "us", tab = "overview" } = await searchParams;

  const [app, countryRankings, competitors, stData] = await Promise.all([
    fetchAppDetail(id, country as CountryCode),
    fetchCountryRankings(id),
    fetchCategoryApps("", country, id, 12),
    fetchSensorTowerApp(id),
  ]);

  if (!app) notFound();

  const categoryCompetitors = await fetchCategoryApps(app.primaryGenreId, country, id, 12);

  const currentRanking = countryRankings.find((r) => r.country === country);
  const currentRank = currentRanking?.rank ?? null;
  const countryData = COUNTRY_MAP[country as CountryCode];
  const rankedCount = countryRankings.filter((r) => r.rank !== null).length;

  const now = new Date();
  const monthLabel = now.toLocaleDateString("fr-FR", { month: "long", year: "numeric" });
  const ageYears = app.releaseDate ? Math.floor(daysSince(app.releaseDate) / 365) : null;

  const activeTab = (["overview", "ads", "rankings"].includes(tab) ? tab : "overview") as "overview" | "ads" | "rankings";

  return (
    <div className="mx-auto max-w-[1380px] px-4 py-8 sm:px-6">
      {/* Breadcrumb */}
      <nav className="mb-6 flex items-center gap-2 text-xs text-white/30">
        <Link href="/tracker" className="transition hover:text-white/60">Tableau de bord</Link>
        <span>/</span>
        <Link href="/tracker/top-charts" className="transition hover:text-white/60">Classements</Link>
        <span>/</span>
        <span className="text-white/55">{app.name}</span>
      </nav>

      {/* Hero — full width */}
      <div className="relative mb-6 overflow-hidden rounded-2xl border border-white/[0.07] bg-white/[0.025] p-6">
        {/* Top-right badge */}
        <div className="absolute right-4 top-4 flex items-center gap-2">
          {app.price === 0 && (
            <span className="rounded-full border border-emerald-400/20 bg-emerald-400/10 px-2.5 py-1 text-[10px] font-bold uppercase tracking-widest text-emerald-300">
              Gratuit
            </span>
          )}
          <span className="rounded-full border border-cyan-400/20 bg-cyan-400/10 px-2.5 py-1 text-[10px] font-bold uppercase tracking-widest text-cyan-300">
            APP STORE TRACKER
          </span>
        </div>

        <div className="flex flex-wrap items-start gap-5">
          {/* Icon */}
          <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-[22px] shadow-2xl ring-1 ring-white/15">
            {app.artworkUrl ? (
              <Image src={app.artworkUrl} alt={app.name} fill className="object-cover" sizes="96px" unoptimized priority />
            ) : (
              <span className="flex h-full w-full items-center justify-center bg-white/5 text-4xl font-bold text-white/40">
                {app.name.charAt(0)}
              </span>
            )}
          </div>

          {/* Info */}
          <div className="flex-1 space-y-2.5">
            <div>
              <h1 className="text-2xl font-bold leading-tight text-white sm:text-3xl">{app.name}</h1>
              <Link
                href={`/tracker/developer/${encodeURIComponent(app.artistName)}?country=${country}`}
                className="mt-0.5 text-sm text-cyan-400/80 hover:text-cyan-300 transition"
              >
                {app.artistName} ↗
              </Link>
            </div>

            {/* Tags */}
            <div className="flex flex-wrap items-center gap-2">
              <span className="flex items-center gap-1 rounded-full border border-white/10 bg-white/[0.04] px-2.5 py-1 text-[11px] text-white/55">
                📂 {app.primaryGenreName}
              </span>
              {app.fileSizeBytes && (
                <span className="flex items-center gap-1 rounded-full border border-white/10 bg-white/[0.04] px-2.5 py-1 text-[11px] text-white/55">
                  💾 {formatBytes(app.fileSizeBytes)}
                </span>
              )}
              {ageYears !== null && ageYears >= 0 && (
                <span className="flex items-center gap-1 rounded-full border border-white/10 bg-white/[0.04] px-2.5 py-1 text-[11px] text-white/55">
                  📅 {ageYears === 0 ? "Moins d'1 an" : `${ageYears} an${ageYears > 1 ? "s" : ""}`}
                </span>
              )}
              {app.minimumOsVersion && (
                <span className="flex items-center gap-1 rounded-full border border-white/10 bg-white/[0.04] px-2.5 py-1 text-[11px] text-white/55">
                  📱 iOS {app.minimumOsVersion}+
                </span>
              )}
              {app.trackContentRating && (
                <span className="flex items-center gap-1 rounded-full border border-white/10 bg-white/[0.04] px-2.5 py-1 text-[11px] text-white/55">
                  🔞 {app.trackContentRating}
                </span>
              )}
              {countryData && (
                <span className="flex items-center gap-1 rounded-full border border-white/10 bg-white/[0.04] px-2.5 py-1 text-[11px] text-white/55">
                  {countryData.flag} {countryData.name}
                </span>
              )}
            </div>

            {/* Rating row */}
            {app.averageUserRating > 0 && (
              <div className="flex items-center gap-2">
                <Stars value={app.averageUserRating} size="md" />
                <span className="text-sm font-semibold text-white/80">{app.averageUserRating.toFixed(1)}</span>
                <span className="text-xs text-white/35">({formatRatingCount(app.userRatingCount)} notes)</span>
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex flex-col gap-2">
            <WatchButton id={app.id} name={app.name} artworkUrl={app.artworkUrl} category={app.primaryGenreName} />
            {app.trackViewUrl && (
              <a
                href={app.trackViewUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-cyan-400 to-violet-500 px-4 py-2.5 text-sm font-semibold text-[#050508] transition hover:brightness-110"
              >
                Voir sur App Store ↗
              </a>
            )}
            <Link
              href={`/tracker/developer/${encodeURIComponent(app.artistName)}?country=${country}`}
              className="flex items-center gap-1.5 rounded-xl border border-white/10 bg-white/[0.04] px-4 py-2.5 text-sm font-medium text-white/60 transition hover:border-white/20 hover:text-white"
            >
              👤 Profil développeur
            </Link>
          </div>
        </div>

        {/* Stats row — 4 big metrics */}
        <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
          <div className="relative flex flex-col gap-1.5 overflow-hidden rounded-2xl border border-white/[0.07] bg-white/[0.025] p-4">
            <span className="absolute right-3 top-3 flex items-center gap-1 rounded-full bg-emerald-400/10 px-2 py-0.5 text-[10px] font-medium text-emerald-300">
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-400" />LIVE
            </span>
            <p className="text-[10px] font-bold uppercase tracking-widest text-white/30"># Rang</p>
            <p className="text-3xl font-bold tabular-nums text-cyan-300">{currentRank ? `#${currentRank}` : "—"}</p>
            <p className="text-[11px] text-white/40">Top Gratuit · {countryData?.name ?? country}</p>
          </div>
          <div className="flex flex-col gap-1.5 overflow-hidden rounded-2xl border border-white/[0.07] bg-white/[0.025] p-4">
            <p className="text-[10px] font-bold uppercase tracking-widest text-white/30">★ Notes</p>
            <p className="text-3xl font-bold tabular-nums text-amber-300">
              {app.averageUserRating > 0 ? app.averageUserRating.toFixed(1) : "—"}
            </p>
            <p className="text-[11px] text-white/40">{formatRatingCount(app.userRatingCount)} avis · {timeAgo(app.currentVersionReleaseDate)}</p>
          </div>
          <div className="flex flex-col gap-1.5 overflow-hidden rounded-2xl border border-white/[0.07] bg-white/[0.025] p-4">
            {stData ? (
              <span className="inline-flex w-fit items-center gap-1 rounded-full bg-violet-400/10 px-2 py-0.5 text-[10px] font-medium text-violet-300">
                ⚡ SensorTower · Monde
              </span>
            ) : (
              <span className="inline-flex w-fit items-center gap-1 rounded-full bg-white/[0.05] px-2 py-0.5 text-[10px] font-medium text-white/35">
                Est. · {monthLabel}
              </span>
            )}
            <p className="text-[10px] font-bold uppercase tracking-widest text-white/30">⬇ Téléch.</p>
            <p className="text-3xl font-bold tabular-nums text-violet-300">
              {stData
                ? stData.downloadsString.toUpperCase()
                : currentRank ? estimateMonthlyDownloads(currentRank, country) : "—"}
            </p>
            <p className="text-[11px] text-white/40">/mois · {stData ? "données réelles" : "estimation"}</p>
          </div>
          <div className="flex flex-col gap-1.5 overflow-hidden rounded-2xl border border-white/[0.07] bg-white/[0.025] p-4">
            {stData ? (
              <span className="inline-flex w-fit items-center gap-1 rounded-full bg-emerald-400/10 px-2 py-0.5 text-[10px] font-medium text-emerald-300">
                ⚡ SensorTower · Monde
              </span>
            ) : (
              <span className="inline-flex w-fit items-center gap-1 rounded-full bg-white/[0.05] px-2 py-0.5 text-[10px] font-medium text-white/35">
                Est. · {monthLabel}
              </span>
            )}
            <p className="text-[10px] font-bold uppercase tracking-widest text-white/30">$ Revenus</p>
            <p className="text-3xl font-bold tabular-nums text-emerald-300">
              {stData
                ? stData.revenueString.toUpperCase()
                : currentRank ? estimateMonthlyRevenue(currentRank, app.price, app.primaryGenreId, country) : "—"}
            </p>
            <p className="text-[11px] text-white/40">/mois · {stData ? "données réelles" : "estimation"}</p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="mb-6">
        <Suspense>
          <AppTabs active={activeTab} />
        </Suspense>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_340px]">
        {/* ── LEFT ── */}
        <div className="space-y-5 min-w-0">
          {activeTab === "overview" && (
            <>
              {/* Screenshots */}
              {(app.screenshotUrls.length > 0 || app.ipadScreenshotUrls.length > 0) && (
                <div className="rounded-2xl border border-white/[0.07] bg-white/[0.02] p-5">
                  <AppScreenshots urls={app.screenshotUrls} ipadUrls={app.ipadScreenshotUrls} />
                </div>
              )}

              {/* What's new */}
              {app.releaseNotes && (
                <div className="rounded-2xl border border-white/[0.07] bg-white/[0.02] p-5">
                  <div className="mb-3 flex items-center justify-between">
                    <h2 className="text-[11px] font-bold uppercase tracking-[0.22em] text-white/40">Nouveautés de cette version</h2>
                    <span className="flex items-center gap-1 rounded-full bg-white/[0.05] px-2.5 py-0.5 text-[11px] text-white/40">
                      v{app.version} · {timeAgo(app.currentVersionReleaseDate)}
                    </span>
                  </div>
                  <p className="whitespace-pre-line text-sm leading-relaxed text-white/60">
                    {app.releaseNotes.slice(0, 800)}{app.releaseNotes.length > 800 ? "…" : ""}
                  </p>
                </div>
              )}

              {/* Description */}
              {app.description && <AppDescription text={app.description} />}

              {/* Informations */}
              <div className="rounded-2xl border border-white/[0.07] bg-white/[0.02] p-5">
                <h2 className="mb-4 text-[11px] font-bold uppercase tracking-[0.22em] text-white/40">Informations</h2>
                <div className="divide-y divide-white/[0.05]">
                  {[
                    { label: "Éditeur", value: app.sellerName || app.artistName },
                    { label: "Bundle ID", value: app.bundleId },
                    { label: "Version", value: app.version },
                    { label: "Taille", value: formatBytes(app.fileSizeBytes) },
                    { label: "Catégorie", value: app.primaryGenreName },
                    { label: "Prix", value: app.price > 0 ? `${app.price}€` : "Gratuit" },
                    { label: "Compatibilité", value: app.minimumOsVersion ? `iOS ${app.minimumOsVersion}+` : "—" },
                    { label: "Âge", value: app.trackContentRating || "—" },
                    {
                      label: "Mis à jour",
                      value: app.currentVersionReleaseDate
                        ? new Date(app.currentVersionReleaseDate).toLocaleDateString("fr-FR", { year: "numeric", month: "long", day: "numeric" })
                        : "—",
                    },
                    {
                      label: "Sorti",
                      value: app.releaseDate
                        ? new Date(app.releaseDate).toLocaleDateString("fr-FR", { year: "numeric", month: "long", day: "numeric" })
                        : "—",
                    },
                    {
                      label: "Langues",
                      value: app.languageCodesISO2A.length > 0
                        ? `${app.languageCodesISO2A.slice(0, 6).join(", ")}${app.languageCodesISO2A.length > 6 ? ` +${app.languageCodesISO2A.length - 6}` : ""}`
                        : "—",
                    },
                  ]
                    .filter((r) => r.value && r.value !== "—")
                    .map(({ label, value }) => (
                      <div key={label} className="flex items-start justify-between gap-4 py-2.5 text-sm">
                        <span className="shrink-0 text-white/40">{label}</span>
                        <span className="text-right font-medium text-white/75 break-all">{value}</span>
                      </div>
                    ))}
                </div>
              </div>

              {/* Creatives */}
              {app.screenshotUrls.length > 0 && (
                <div className="rounded-2xl border border-white/[0.07] bg-white/[0.02] p-5">
                  <AppCreatives appName={app.name} urls={app.screenshotUrls} />
                </div>
              )}
            </>
          )}

          {activeTab === "ads" && (
            <div className="rounded-2xl border border-white/[0.07] bg-white/[0.02] p-5">
              <div className="mb-5">
                <h2 className="text-[11px] font-bold uppercase tracking-[0.22em] text-white/40">Intelligence Publicitaire</h2>
                <p className="mt-0.5 text-xs text-white/30">
                  Pubs actives Meta, TikTok, Google liées à {app.name}
                </p>
              </div>
              <AppAds appName={app.name} developerName={app.sellerName || app.artistName} bundleId={app.bundleId} />
            </div>
          )}

          {activeTab === "rankings" && (
            <>
              {/* Full country table */}
              <div className="rounded-2xl border border-white/[0.07] bg-white/[0.02] p-5">
                <h2 className="mb-4 text-[11px] font-bold uppercase tracking-[0.22em] text-white/40">
                  Classements par pays — Top Gratuit
                </h2>
                <div className="overflow-hidden rounded-xl border border-white/[0.06]">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-white/[0.06] bg-white/[0.02]">
                        <th className="px-4 py-2.5 text-left text-[10px] font-bold uppercase tracking-wider text-white/30">Pays</th>
                        <th className="px-4 py-2.5 text-right text-[10px] font-bold uppercase tracking-wider text-white/30">Rang</th>
                        <th className="px-4 py-2.5 text-right text-[10px] font-bold uppercase tracking-wider text-white/30">Téléch. est.</th>
                        <th className="px-4 py-2.5 text-right text-[10px] font-bold uppercase tracking-wider text-white/30">Rev. est.</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/[0.04]">
                      {[...countryRankings]
                        .sort((a, b) => {
                          if (a.rank === null && b.rank === null) return 0;
                          if (a.rank === null) return 1;
                          if (b.rank === null) return -1;
                          return a.rank - b.rank;
                        })
                        .map((r) => (
                          <tr key={r.country} className={`transition hover:bg-white/[0.03] ${!r.rank ? "opacity-40" : ""}`}>
                            <td className="px-4 py-3">
                              <div className="flex items-center gap-2">
                                <span className="text-base">{r.flag}</span>
                                <span className="text-xs text-white/70">{r.name}</span>
                              </div>
                            </td>
                            <td className="px-4 py-3 text-right">
                              <RankBadge rank={r.rank} />
                            </td>
                            <td className="px-4 py-3 text-right text-xs font-mono text-violet-300">
                              {r.rank ? estimateMonthlyDownloads(r.rank, r.country) : "—"}
                            </td>
                            <td className="px-4 py-3 text-right text-xs font-mono text-emerald-300">
                              {r.rank ? estimateMonthlyRevenue(r.rank, app.price, app.primaryGenreId, r.country) : "—"}
                            </td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>
                <p className="mt-3 text-[11px] text-white/25">
                  Téléchargements & revenus : estimations basées sur les benchmarks publics SensorTower/data.ai. Non contractuelles.
                </p>
              </div>

              {/* Market presence */}
              <div className="rounded-2xl border border-white/[0.07] bg-white/[0.02] p-5">
                <h2 className="mb-4 text-[11px] font-bold uppercase tracking-[0.22em] text-white/40">Présence mondiale</h2>
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                  <StatPill label="Pays classés" value={`${rankedCount}/14`} color="text-cyan-300" />
                  <StatPill
                    label="Meilleur rang"
                    value={countryRankings.find((r) => r.rank !== null)?.rank ? `#${Math.min(...countryRankings.filter((r) => r.rank !== null).map((r) => r.rank as number))}` : "—"}
                    color="text-emerald-300"
                  />
                  <StatPill
                    label="Téléch. totaux est."
                    value={(() => {
                      const total = countryRankings.reduce((sum, r) => {
                        if (!r.rank) return sum;
                        const n = parseInt(estimateMonthlyDownloads(r.rank, r.country).replace(/[^0-9.]/g, ""));
                        const mult = estimateMonthlyDownloads(r.rank, r.country).includes("M") ? 1_000_000 : estimateMonthlyDownloads(r.rank, r.country).includes("K") ? 1_000 : 1;
                        return sum + n * mult;
                      }, 0);
                      if (total >= 1_000_000) return `${(total / 1_000_000).toFixed(1)}M`;
                      if (total >= 1_000) return `${Math.round(total / 1_000)}K`;
                      return String(total);
                    })()}
                    color="text-violet-300"
                  />
                  <StatPill label="Version" value={app.version || "—"} color="text-white/70" />
                </div>
              </div>
            </>
          )}
        </div>

        {/* ── RIGHT SIDEBAR ── */}
        <div className="space-y-5 lg:sticky lg:top-6 lg:self-start">
          <CountryRankingsPanel rankings={countryRankings} rankedCount={rankedCount} />
          <CompetitorsPanel
            apps={categoryCompetitors.length >= 5 ? categoryCompetitors : competitors}
            currentId={id}
            country={country}
            category={app.primaryGenreName}
          />
        </div>
      </div>
    </div>
  );
}
