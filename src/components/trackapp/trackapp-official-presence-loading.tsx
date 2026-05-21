"use client";

import { cn } from "@/lib/utils";

export function TrackappOfficialPresenceLoading({ embedded = false }: Readonly<{ embedded?: boolean }>) {
  return (
    <section
      className={cn(
        "overflow-hidden bg-white",
        embedded
          ? "ta-detail-card"
          : "mt-5 rounded-[28px] border border-[var(--dash-border)] shadow-[var(--dash-shadow-lg)]",
      )}
      aria-busy="true"
      aria-label="Validation des liens officiels en cours"
    >
      <div className="border-b border-[var(--dash-border)] px-5 py-5 sm:px-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="space-y-2">
            <div className="h-3 w-32 animate-pulse rounded-full bg-slate-200" />
            <div className="h-7 w-48 animate-pulse rounded-lg bg-slate-200" />
            <div className="h-4 w-64 max-w-full animate-pulse rounded bg-slate-100" />
          </div>
          <div className="flex gap-2">
            <div className="h-9 w-24 animate-pulse rounded-full bg-slate-200" />
            <div className="h-9 w-28 animate-pulse rounded-full bg-slate-100" />
          </div>
        </div>
        <div className="mt-4 flex items-center gap-3 rounded-2xl border border-lime-200/80 bg-lime-50/90 px-4 py-3">
          <span className="relative flex h-5 w-5 shrink-0">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-lime-400 opacity-60" />
            <span className="relative inline-flex h-5 w-5 animate-spin rounded-full border-2 border-lime-300 border-t-lime-700" />
          </span>
          <p className="text-[0.88rem] font-semibold text-lime-900">
            Validation des réseaux officiels… (15–45 s)
          </p>
        </div>
      </div>

      <div className="p-5 sm:p-6">
        <div className="mb-3 h-3 w-28 animate-pulse rounded bg-slate-200" />
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }, (_, i) => (
            <div
              key={i}
              className="h-[118px] animate-pulse rounded-[14px] border border-slate-100 bg-slate-50"
              style={{ animationDelay: `${i * 80}ms` }}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
