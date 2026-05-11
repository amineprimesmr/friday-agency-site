"use client";

import { useState, useTransition } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import {
  COUNTRIES,
  CHART_TYPES,
  APPLE_CATEGORIES,
  type AppEntry,
} from "@/lib/apple-charts";
import { cn } from "@/lib/utils";

interface Props {
  apps: AppEntry[];
  country: string;
  chart: string;
  category: string;
}

export function AppTable({ apps, country, chart, category }: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();
  const [search, setSearch] = useState("");

  function updateParam(key: string, value: string) {
    const params = new URLSearchParams(searchParams.toString());
    params.set(key, value);
    startTransition(() => {
      router.push(`${pathname}?${params.toString()}`, { scroll: false });
    });
  }

  const filtered = search.trim()
    ? apps.filter(
        (a) =>
          a.name.toLowerCase().includes(search.toLowerCase()) ||
          a.artistName.toLowerCase().includes(search.toLowerCase()),
      )
    : apps;

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        {/* Country */}
        <select
          value={country}
          onChange={(e) => updateParam("country", e.target.value)}
          className="rounded-xl border border-white/10 bg-white/[0.04] px-3 py-2 text-sm text-white outline-none focus:border-white/25"
        >
          {COUNTRIES.map((c) => (
            <option key={c.code} value={c.code} className="bg-[#0d0d1a]">
              {c.flag} {c.name}
            </option>
          ))}
        </select>

        {/* Chart type */}
        <select
          value={chart}
          onChange={(e) => updateParam("chart", e.target.value)}
          className="rounded-xl border border-white/10 bg-white/[0.04] px-3 py-2 text-sm text-white outline-none focus:border-white/25"
        >
          {CHART_TYPES.map((t) => (
            <option key={t.id} value={t.id} className="bg-[#0d0d1a]">
              {t.label}
            </option>
          ))}
        </select>

        {/* Category */}
        <select
          value={category}
          onChange={(e) => updateParam("category", e.target.value)}
          className="rounded-xl border border-white/10 bg-white/[0.04] px-3 py-2 text-sm text-white outline-none focus:border-white/25"
        >
          {APPLE_CATEGORIES.map((c) => (
            <option key={c.id} value={c.id} className="bg-[#0d0d1a]">
              {c.name}
            </option>
          ))}
        </select>

        {/* Search */}
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Rechercher…"
          className="ml-auto w-full max-w-xs rounded-xl border border-white/10 bg-white/[0.04] px-3 py-2 text-sm text-white placeholder:text-white/30 outline-none focus:border-white/25 sm:w-auto"
        />
      </div>

      {/* Table */}
      <div
        className={cn(
          "overflow-x-auto rounded-2xl border border-white/[0.06] transition-opacity",
          isPending && "opacity-60",
        )}
      >
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-white/[0.06] bg-white/[0.02]">
              <th className="w-12 px-4 py-3 text-left text-[10px] font-bold uppercase tracking-wider text-white/30">
                #
              </th>
              <th className="px-4 py-3 text-left text-[10px] font-bold uppercase tracking-wider text-white/30">
                App
              </th>
              <th className="hidden px-4 py-3 text-left text-[10px] font-bold uppercase tracking-wider text-white/30 md:table-cell">
                Développeur
              </th>
              <th className="hidden px-4 py-3 text-left text-[10px] font-bold uppercase tracking-wider text-white/30 lg:table-cell">
                Catégorie
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/[0.04]">
            {filtered.map((app) => (
              <tr
                key={app.id}
                className="group transition-colors hover:bg-white/[0.03]"
              >
                <td className="px-4 py-3">
                  <span className="font-mono text-sm font-bold text-white/40">
                    {app.rank}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <Link
                    href={`/tracker/apps/${app.id}?country=${country}`}
                    className="tracker-touch flex items-center gap-3"
                  >
                    <span className="relative h-10 w-10 shrink-0 overflow-hidden rounded-xl ring-1 ring-white/10">
                      {app.artworkUrl ? (
                        <Image
                          src={app.artworkUrl}
                          alt={app.name}
                          fill
                          className="object-cover"
                          sizes="40px"
                          unoptimized
                        />
                      ) : (
                        <span className="flex h-full w-full items-center justify-center bg-white/5 text-sm font-bold text-white/40">
                          {app.name.charAt(0)}
                        </span>
                      )}
                    </span>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-white/85 group-hover:text-white">
                        {app.name}
                      </p>
                      <p className="truncate text-xs text-white/40 md:hidden">
                        {app.artistName}
                      </p>
                    </div>
                  </Link>
                </td>
                <td className="hidden px-4 py-3 text-xs text-white/50 md:table-cell">
                  {app.artistName}
                </td>
                <td className="hidden px-4 py-3 lg:table-cell">
                  <span className="rounded-full bg-white/[0.06] px-2.5 py-1 text-[11px] text-white/55">
                    {app.category}
                  </span>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td
                  colSpan={5}
                  className="px-4 py-12 text-center text-sm text-white/30"
                >
                  Aucune app ne correspond à cette recherche.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <p className="text-right text-xs text-white/25">
        {filtered.length} apps · données Apple RSS
      </p>
    </div>
  );
}
