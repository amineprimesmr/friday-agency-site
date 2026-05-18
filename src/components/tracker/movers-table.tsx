import Image from "next/image";
import { TrackerNavLink } from "@/components/tracker/tracker-navigation";
import type { Mover } from "@/lib/apple-charts";

export function MoversTable({
  title,
  apps,
  type,
}: {
  title: string;
  apps: Mover[];
  type: "gainer" | "loser";
}) {
  const isGainer = type === "gainer";

  return (
    <div>
      <h2 className="mb-3 flex items-center gap-2 text-xs font-bold uppercase tracking-[0.22em] text-white/40">
        <span
          className={`h-2 w-2 rounded-full ${isGainer ? "bg-emerald-400" : "bg-rose-400"}`}
        />
        {title}
      </h2>
      <div className="overflow-hidden rounded-2xl border border-white/[0.06]">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-white/[0.06] bg-white/[0.02]">
              <th className="px-3 py-2 text-left text-[10px] font-bold uppercase tracking-wider text-white/30">
                RK
              </th>
              <th className="px-3 py-2 text-left text-[10px] font-bold uppercase tracking-wider text-white/30">
                CHG
              </th>
              <th className="px-3 py-2 text-left text-[10px] font-bold uppercase tracking-wider text-white/30">
                Pays
              </th>
              <th className="px-3 py-2 text-left text-[10px] font-bold uppercase tracking-wider text-white/30">
                App
              </th>
              <th className="hidden px-3 py-2 text-left text-[10px] font-bold uppercase tracking-wider text-white/30 md:table-cell">
                Catégorie
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/[0.04]">
            {apps.map((app, i) => (
              <tr
                key={app.id}
                className="tracker-rise group transition hover:bg-white/[0.03]"
                style={{ animationDelay: `${Math.min(i, 24) * 32}ms` }}
              >
                <td className="px-3 py-2.5 font-mono text-xs font-semibold text-white/60">
                  #{app.rank}
                </td>
                <td className="px-3 py-2.5">
                  <span
                    className={`rounded-full px-2 py-0.5 text-[11px] font-bold tabular-nums ${
                      isGainer
                        ? "bg-emerald-400/10 text-emerald-300"
                        : "bg-rose-400/10 text-rose-300"
                    }`}
                  >
                    {isGainer ? "+" : ""}
                    {app.change}
                  </span>
                </td>
                <td className="px-3 py-2.5 text-base">{app.flag}</td>
                <td className="px-3 py-2.5">
                  <TrackerNavLink
                    href={`/tracker/apps/${app.id}?country=${app.country}`}
                    className="tracker-touch flex items-center gap-2 hover:underline"
                  >
                    <span className="relative hidden h-8 w-8 shrink-0 overflow-hidden rounded-lg ring-1 ring-white/10 sm:block">
                      {app.artworkUrl ? (
                        <Image
                          src={app.artworkUrl}
                          alt={app.name}
                          fill
                          className="object-cover"
                          sizes="32px"
                          unoptimized
                        />
                      ) : (
                        <span className="flex h-full w-full items-center justify-center bg-white/5 text-xs font-bold text-white/40">
                          {app.name.charAt(0)}
                        </span>
                      )}
                    </span>
                    <span className="line-clamp-1 text-xs font-medium text-white/80 group-hover:text-white">
                      {app.name}
                    </span>
                  </TrackerNavLink>
                </td>
                <td className="hidden px-3 py-2.5 text-xs text-white/45 md:table-cell">
                  {app.category}
                </td>
              </tr>
            ))}
            {apps.length === 0 && (
              <tr>
                <td
                  colSpan={5}
                  className="px-3 py-8 text-center text-xs text-white/30"
                >
                  Aucune donnée disponible pour ce marché.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
