"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo, useState } from "react";

export type MarketRow = {
  id: string;
  name: string;
  artworkUrl: string;
  rank: number;
  revenueUsd: number;
  sharePct: number;
};

const PALETTE = ["#3b82f6", "#34d399", "#fb923c", "#c084fc", "#f87171", "#facc15", "#2dd4bf", "#fb7185"];
const OTHERS_COLOR = "rgba(255,255,255,0.22)";

function formatUsdFr(n: number): string {
  return new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: n >= 10_000 ? 0 : n >= 1000 ? 0 : 1,
    minimumFractionDigits: 0,
  }).format(n);
}

type DonutSegment = { key: string; pct: number; color: string };

function buildDonutSegments(sortedByRev: MarketRow[], totalUsd: number): DonutSegment[] {
  if (totalUsd <= 0) return [];
  const maxSlices = 7;
  if (sortedByRev.length <= maxSlices) {
    return sortedByRev.map((r, i) => ({
      key: r.id,
      pct: (r.revenueUsd / totalUsd) * 100,
      color: PALETTE[i % PALETTE.length],
    }));
  }
  const head = sortedByRev.slice(0, maxSlices);
  const tailSum = sortedByRev.slice(maxSlices).reduce((s, r) => s + r.revenueUsd, 0);
  const out: DonutSegment[] = head.map((r, i) => ({
    key: r.id,
    pct: (r.revenueUsd / totalUsd) * 100,
    color: PALETTE[i % PALETTE.length],
  }));
  if (tailSum > 0) {
    out.push({ key: "others", pct: (tailSum / totalUsd) * 100, color: OTHERS_COLOR });
  }
  return out;
}

function conicGradientFromSegments(segments: DonutSegment[]): string {
  if (segments.length === 0) return "conic-gradient(from -90deg, #262626 0% 100%)";
  const sum = segments.reduce((s, seg) => s + Math.max(seg.pct, 0), 0) || 1;
  const parts: string[] = [];
  let acc = 0;
  for (const seg of segments) {
    const pct = (Math.max(seg.pct, 0) / sum) * 100;
    const start = acc;
    acc += pct;
    parts.push(`${seg.color} ${start}% ${Math.min(acc, 100)}%`);
  }
  return `conic-gradient(from -90deg, ${parts.join(", ")})`;
}

type Props = {
  rows: MarketRow[];
  totalUsd: number;
  currentAppId: string;
  country: string;
};

export function CategoryRevenueShare({ rows, totalUsd, currentAppId, country }: Props) {
  const [hoverId, setHoverId] = useState<string | null>(null);

  const sortedByRev = useMemo(() => [...rows].sort((a, b) => b.revenueUsd - a.revenueUsd), [rows]);

  const segments = useMemo(() => buildDonutSegments(sortedByRev, totalUsd), [sortedByRev, totalUsd]);

  const gradient = useMemo(() => conicGradientFromSegments(segments), [segments]);

  const segmentColorByAppId = useMemo(() => {
    const m = new Map<string, string>();
    sortedByRev.slice(0, 7).forEach((r, i) => m.set(r.id, PALETTE[i % PALETTE.length]));
    sortedByRev.slice(7).forEach((r) => m.set(r.id, OTHERS_COLOR));
    return m;
  }, [sortedByRev]);

  if (rows.length === 0 || totalUsd <= 0) {
    return null;
  }

  const activeId = hoverId ?? currentAppId;

  return (
    <div className="rounded-2xl border border-white/[0.07] bg-white/[0.025] p-5">
      <div className="mb-5">
        <h2 className="text-[11px] font-bold uppercase tracking-[0.22em] text-white/40">Partage des revenus (estimé)</h2>
      </div>

      <div className="flex flex-col items-center gap-8 lg:flex-row lg:items-start lg:justify-between">
        <div className="relative shrink-0">
          <div
            className="relative mx-auto aspect-square w-[min(15rem,78vw)] rounded-full p-[10px] shadow-[0_0_0_1px_rgba(255,255,255,0.06)]"
            role="img"
            aria-label={`Répartition estimée du marché échantillon : total ${formatUsdFr(totalUsd)}`}
          >
            <div className="h-full w-full rounded-full" style={{ background: gradient }} />
            <div className="absolute inset-[20%] flex flex-col items-center justify-center rounded-full bg-neutral-950/95 text-center ring-1 ring-white/[0.08]">
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/38">Marché échantillon</p>
              <p className="mt-1 text-2xl font-bold tabular-nums tracking-tight text-white sm:text-[1.65rem]">
                {formatUsdFr(totalUsd)}
              </p>
              <p className="mt-0.5 text-[10px] text-white/35">/ mois · USD</p>
            </div>
          </div>
        </div>

        <div className="min-h-0 w-full min-w-0 flex-1">
          <ul className="max-h-[min(22rem,52vh)] space-y-1 overflow-y-auto overscroll-contain pr-1">
            {sortedByRev.map((row) => {
              const bar = segmentColorByAppId.get(row.id) ?? OTHERS_COLOR;
              const dim = hoverId !== null && hoverId !== row.id;
              return (
                <li key={row.id}>
                  <Link
                    href={`/tracker/apps/${row.id}?country=${country}`}
                    className={`flex items-center gap-3 rounded-xl px-2 py-2 transition ${
                      row.id === currentAppId ? "bg-white/[0.08] ring-1 ring-white/15" : "hover:bg-white/[0.05]"
                    } ${dim ? "opacity-45" : "opacity-100"}`}
                    onMouseEnter={() => setHoverId(row.id)}
                    onMouseLeave={() => setHoverId(null)}
                    onFocus={() => setHoverId(row.id)}
                    onBlur={() => setHoverId(null)}
                  >
                    <span
                      className="h-9 w-1 shrink-0 rounded-full"
                      style={{ backgroundColor: bar }}
                      aria-hidden
                    />
                    <span className="relative h-9 w-9 shrink-0 overflow-hidden rounded-lg ring-1 ring-white/10">
                      {row.artworkUrl ? (
                        <Image src={row.artworkUrl} alt="" fill className="object-cover" sizes="36px" unoptimized />
                      ) : (
                        <span className="flex h-full w-full items-center justify-center bg-white/[0.05] text-[11px] font-bold text-white/40">
                          {row.name.charAt(0)}
                        </span>
                      )}
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <p className="truncate text-[13px] font-medium text-white/88">{row.name}</p>
                        {row.id === activeId ? (
                          <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-white/70" aria-hidden />
                        ) : null}
                      </div>
                      <p className="text-[10px] text-white/32">Rang top gratuit · #{row.rank}</p>
                    </div>
                    <div className="shrink-0 text-right">
                      <p className="text-sm font-semibold tabular-nums text-white/90">{formatUsdFr(row.revenueUsd)}</p>
                      <p className="text-[11px] tabular-nums text-white/42">{row.sharePct.toFixed(1).replace(".", ",")} %</p>
                    </div>
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      </div>
    </div>
  );
}
