import Image from "next/image";
import Link from "next/link";
import type { MultiCountryApp } from "@/lib/apple-charts";

export function TopMoversGrid({ apps }: { apps: MultiCountryApp[] }) {
  if (!apps.length) return null;

  return (
    <div>
      <h2 className="mb-4 text-xs font-bold uppercase tracking-[0.22em] text-white/40">
        Top Tendances
      </h2>
      <div className="grid grid-cols-3 gap-2 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6">
        {apps.map((app, i) => (
          <Link
            key={`${app.country}-${app.id}-${i}`}
            href={`/tracker/apps/${app.id}?country=${app.country}`}
            className="tracker-touch tracker-rise group flex flex-col items-center gap-1.5 rounded-2xl border border-white/[0.06] bg-white/[0.02] p-3 text-center transition hover:border-white/15 hover:bg-white/[0.05]"
            style={{ animationDelay: `${Math.min(i, 22) * 26}ms` }}
          >
            <div className="relative h-12 w-12 overflow-hidden rounded-xl ring-1 ring-white/10">
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
                <div className="flex h-full w-full items-center justify-center bg-white/5 text-base font-bold text-white/40">
                  {app.name.charAt(0)}
                </div>
              )}
            </div>
            <p className="line-clamp-2 text-[11px] font-medium leading-tight text-white/80 group-hover:text-white">
              {app.name}
            </p>
            <span className="rounded-full bg-black/40 px-2 py-0.5 text-[10px] font-semibold text-white/50 ring-1 ring-white/10">
              {app.flag}#{app.rank}
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
}
