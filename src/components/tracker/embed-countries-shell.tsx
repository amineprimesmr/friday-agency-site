"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

import { TrackappCountryRankingsGlobe } from "@/components/trackapp/trackapp-country-rankings-globe";
import type { CountryCode, CountryRanking } from "@/lib/apple-charts";
import { rankPresencePercent } from "@/lib/apple-charts";

import "@/styles/trackapp-country-rankings.css";

type EmbedTheme = "dark" | "light" | "system";
type EmbedView = "list" | "globe";

type Props = {
  appId: string;
  appName: string;
  artworkUrl: string;
  rankings: CountryRanking[];
  theme: EmbedTheme;
  view: EmbedView;
};

function sortCountries(a: CountryRanking, b: CountryRanking): number {
  if (a.rank === null && b.rank === null) return a.name.localeCompare(b.name, "fr");
  if (a.rank === null) return 1;
  if (b.rank === null) return -1;
  if (a.rank !== b.rank) return a.rank - b.rank;
  return a.name.localeCompare(b.name, "fr");
}

function rankTone(resolved: "dark" | "light", tier: "good" | "mid" | "low") {
  if (resolved === "light") {
    if (tier === "good") return "border-emerald-500/35 bg-emerald-500/[0.09] text-emerald-950";
    if (tier === "mid") return "border-slate-300 bg-slate-100 text-slate-800";
    return "border-slate-200 bg-white text-slate-600";
  }
  if (tier === "good") return "border-emerald-400/35 bg-emerald-500/[0.12] text-emerald-100";
  if (tier === "mid") return "border-white/15 bg-white/[0.08] text-white/88";
  return "border-white/10 bg-white/[0.04] text-white/45";
}

function rankBadgeClass(rank: number, resolved: "dark" | "light") {
  if (rank <= 10) return rankTone(resolved, "good");
  if (rank <= 50) return rankTone(resolved, "mid");
  return rankTone(resolved, "low");
}

export function EmbedCountriesShell({ appId, appName, artworkUrl, rankings, theme, view }: Props) {
  const [resolvedTheme, setResolvedTheme] = useState<"dark" | "light">(() =>
    theme === "light" ? "light" : "dark",
  );

  useEffect(() => {
    if (theme === "dark") {
      setResolvedTheme("dark");
      return;
    }
    if (theme === "light") {
      setResolvedTheme("light");
      return;
    }
    const mq = window.matchMedia("(prefers-color-scheme: light)");
    const apply = () => setResolvedTheme(mq.matches ? "light" : "dark");
    apply();
    mq.addEventListener("change", apply);
    return () => mq.removeEventListener("change", apply);
  }, [theme]);

  const sorted = useMemo(() => [...rankings].sort(sortCountries), [rankings]);
  const ranked = sorted.filter((r) => r.rank !== null) as (CountryRanking & { rank: number })[];
  const rankedCount = ranked.length;
  const [focusCountry, setFocusCountry] = useState<CountryCode | null>(
    () => ranked[0]?.country ?? null,
  );
  const focusRow = focusCountry ? sorted.find((r) => r.country === focusCountry) : null;

  const surface =
    resolvedTheme === "light"
      ? "border border-slate-200/90 bg-gradient-to-br from-white to-slate-100 text-slate-900 shadow-sm"
      : "border border-white/[0.1] bg-gradient-to-br from-neutral-950 to-neutral-900 text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]";

  const muted = resolvedTheme === "light" ? "text-slate-500" : "text-white/42";

  const tableBorder =
    resolvedTheme === "light" ? "border-slate-200/90" : "border-white/[0.06]";
  const theadCls =
    resolvedTheme === "light" ? "bg-slate-100/90 text-[10px] text-slate-500" : "bg-white/[0.04] text-[10px] text-white/40";
  const tbodyDivide =
    resolvedTheme === "light"
      ? "divide-y divide-slate-200 [&>tr:nth-child(even)]:bg-slate-50/65"
      : "divide-y divide-white/[0.05] [&>tr:nth-child(even)]:bg-white/[0.02]";

  return (
    <div className={`m-0 min-h-[380px] w-full rounded-2xl p-4 ${surface}`}>
      <header className="mb-4 flex gap-3">
        <div
          className={`relative h-14 w-14 shrink-0 overflow-hidden rounded-2xl ring-1 ring-inset ${resolvedTheme === "light" ? "ring-black/10" : "ring-white/12"}`}
        >
          {artworkUrl ? (
            <Image src={artworkUrl} alt="" fill className="object-cover" sizes="56px" unoptimized />
          ) : (
            <span
              className={`flex h-full w-full items-center justify-center text-lg font-bold ${resolvedTheme === "light" ? "bg-black/5 text-black/35" : "bg-white/[0.06] text-white/40"}`}
            >
              {appName.charAt(0)}
            </span>
          )}
        </div>
        <div className="min-w-0 flex-1">
          <p className={`truncate text-[10px] font-bold uppercase tracking-[0.22em] ${muted}`}>Top gratuit · Classements par pays</p>
          <h1 className="truncate text-lg font-semibold tracking-tight">{appName}</h1>
          <p className={`mt-1 text-[10px] ${muted}`}>
            Pays classés : {rankedCount}/{sorted.length}
          </p>
        </div>
      </header>

      {view === "globe" ? (
        <div className="trackapp-embed-country-globe mb-5">
          {ranked.length > 0 ? (
            <>
              <TrackappCountryRankingsGlobe
                rankings={sorted}
                focusCountry={focusCountry}
                onFocusCountry={setFocusCountry}
              />
              {focusRow ? (
                <div
                  className={`trackapp-embed-country-globe__tooltip ${resolvedTheme === "light" ? "trackapp-embed-country-globe__tooltip--light" : ""}`}
                  role="status"
                >
                  <span>{focusRow.flag}</span>
                  <span className="font-semibold">{focusRow.name}</span>
                  {focusRow.rank ? (
                    <span className="tabular-nums">
                      Rang <strong>#{focusRow.rank}</strong> · plateau {rankPresencePercent(focusRow.rank)}%
                    </span>
                  ) : (
                    <span>Hors top 100</span>
                  )}
                </div>
              ) : (
                <p className={`mt-2 text-center text-xs ${muted}`}>Glissez le globe · cliquez un pays ci-dessous</p>
              )}
            </>
          ) : (
            <p className={`rounded-xl border border-dashed px-4 py-8 text-center text-xs ${resolvedTheme === "light" ? "border-slate-200/95" : "border-white/[0.11]"} ${muted}`}>
              Aucune position dans les marchés suivis.
            </p>
          )}
        </div>
      ) : null}

      <div className={`overflow-hidden rounded-xl border ${tableBorder}`}>
        <table className="w-full border-collapse text-left text-[13px]">
          <thead>
            <tr className={theadCls}>
              <th className="px-3 py-2 font-semibold uppercase tracking-wide">Pays</th>
              <th className="px-3 py-2 font-semibold uppercase tracking-wide">Rang</th>
              <th className="hidden px-3 py-2 font-semibold uppercase tracking-wide sm:table-cell">Plateau</th>
            </tr>
          </thead>
          <tbody className={tbodyDivide}>
            {sorted.map((r) => {
              const rowActive = view === "globe" && focusCountry === r.country;
              return (
              <tr
                key={r.country}
                className={rowActive ? (resolvedTheme === "light" ? "bg-emerald-500/10" : "bg-emerald-500/[0.08]") : undefined}
              >
                <td className={`px-3 py-2.5 align-middle ${resolvedTheme === "light" ? "text-slate-800" : "text-white/80"}`}>
                  {view === "globe" ? (
                    <button
                      type="button"
                      className="flex w-full items-center gap-2 text-left tabular-nums transition hover:opacity-90"
                      onClick={() => setFocusCountry(r.country)}
                    >
                      <span className="text-base leading-none">{r.flag}</span>
                      <span className="text-[12px]">{r.name}</span>
                    </button>
                  ) : (
                    <span className="flex items-center gap-2 tabular-nums">
                      <span className="text-base leading-none">{r.flag}</span>
                      <span className="text-[12px]">{r.name}</span>
                    </span>
                  )}
                </td>
                <td className="whitespace-nowrap px-3 py-2.5 align-middle">
                  {r.rank ? (
                    <span
                      className={`inline-flex rounded-full border px-2 py-0.5 text-[11px] font-bold ${rankBadgeClass(r.rank, resolvedTheme)}`}
                    >
                      #{r.rank}
                    </span>
                  ) : (
                    <span className={`text-[11px] ${muted}`}>—</span>
                  )}
                </td>
                <td className="hidden px-3 py-2.5 align-middle sm:table-cell">
                  {r.rank ? (
                    <div className="flex flex-col gap-1.5 tabular-nums">
                      <span
                        className={`text-[11px] font-semibold ${resolvedTheme === "light" ? "text-slate-700" : "text-white/78"}`}
                      >
                        {rankPresencePercent(r.rank)}%
                      </span>
                      <div className={`h-1 w-full overflow-hidden rounded-full ${resolvedTheme === "light" ? "bg-slate-200" : "bg-white/[0.07]"}`}>
                        <div
                          className={`h-full rounded-full ${resolvedTheme === "light" ? "bg-emerald-500/85" : "bg-emerald-400/75"}`}
                          style={{ width: `${rankPresencePercent(r.rank)}%` }}
                        />
                      </div>
                    </div>
                  ) : (
                    <span className={`text-[11px] ${muted}`}>Hors plateau</span>
                  )}
                </td>
              </tr>
            );
            })}
          </tbody>
        </table>
      </div>

      <footer
        className={`mt-4 flex flex-wrap items-center justify-between gap-2 border-t pt-4 text-[10px] ${resolvedTheme === "light" ? "border-slate-200 text-slate-500" : "border-white/[0.06] text-white/35"}`}
      >
        <span>App Store Tracker</span>
        <Link
          href={`/tracker/apps/${appId}`}
          target="_blank"
          rel="noopener noreferrer"
          className={`font-semibold underline decoration-1 underline-offset-2 hover:opacity-90 ${resolvedTheme === "light" ? "text-slate-700" : "text-white/70"}`}
        >
          Ouvrir la fiche →
        </Link>
      </footer>
    </div>
  );
}
