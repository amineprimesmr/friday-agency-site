import Image from "next/image";
import { estimateMonthlyDownloads, type AppEntry, type CountryCode } from "@/lib/apple-charts";

type Props = {
  appName: string;
  artworkUrl: string;
  categoryLabel: string;
  apps: AppEntry[];
  currentId: string;
  country: CountryCode;
};

/** Liste « apps proches » pour iframe /embed/similar — liens vers le tracker (nouvel onglet). */
export function EmbedSimilarShell({
  appName,
  artworkUrl,
  categoryLabel,
  apps,
  currentId,
  country,
}: Props) {
  const trackerBase = "/tracker";

  return (
    <div className="box-border w-full min-w-0 rounded-2xl border border-white/[0.1] bg-gradient-to-br from-neutral-950 to-neutral-900 p-4 text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.06)] sm:p-5">
      <header className="mb-4 flex gap-3">
        <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-xl ring-1 ring-white/12">
          {artworkUrl ? (
            <Image src={artworkUrl} alt="" fill className="object-cover" sizes="48px" unoptimized />
          ) : (
            <span className="flex h-full w-full items-center justify-center bg-white/[0.06] text-lg font-bold text-white/40">
              {appName.charAt(0)}
            </span>
          )}
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-white/40">Apps proches · même catégorie</p>
          <h1 className="truncate text-base font-semibold tracking-tight">{appName}</h1>
          <p className="mt-0.5 truncate text-[11px] text-white/45">{categoryLabel}</p>
        </div>
      </header>

      <ul className="space-y-1">
        {apps.map((app) => (
          <li key={app.id}>
            <a
              href={`${trackerBase}/apps/${app.id}?country=${encodeURIComponent(country)}`}
              target="_blank"
              rel="noopener noreferrer"
              className={`flex items-center gap-3 rounded-xl px-2 py-2.5 transition hover:bg-white/[0.06] ${app.id === currentId ? "bg-white/[0.08] ring-1 ring-white/12" : ""}`}
            >
              <span className="w-7 shrink-0 text-center font-mono text-[11px] font-semibold tabular-nums text-white/40">
                #{app.rank}
              </span>
              <span className="relative h-9 w-9 shrink-0 overflow-hidden rounded-lg ring-1 ring-white/10">
                {app.artworkUrl ? (
                  <Image src={app.artworkUrl} alt="" fill className="object-cover" sizes="36px" unoptimized />
                ) : (
                  <span className="flex h-full w-full items-center justify-center bg-white/5 text-xs font-bold text-white/35">
                    {app.name.charAt(0)}
                  </span>
                )}
              </span>
              <span className="min-w-0 flex-1 truncate text-[13px] font-medium text-white/88">{app.name}</span>
              <span className="shrink-0 text-[11px] tabular-nums text-white/40">{estimateMonthlyDownloads(app.rank, country)}</span>
            </a>
          </li>
        ))}
      </ul>
      {apps.length === 0 ? (
        <p className="py-8 text-center text-sm text-white/35">Aucune app proche pour cet extrait.</p>
      ) : null}
    </div>
  );
}
