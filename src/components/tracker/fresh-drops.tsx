import Image from "next/image";
import { TrackerNavLink } from "@/components/tracker/tracker-navigation";
import type { AppEntry } from "@/lib/apple-charts";

function formatDate(dateStr: string) {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  return d.toLocaleDateString("fr-FR", { month: "short", day: "numeric" });
}

export function FreshDrops({ apps }: { apps: AppEntry[] }) {
  if (!apps.length) return null;

  return (
    <div>
      <h2 className="mb-3 text-xs font-bold uppercase tracking-[0.22em] text-white/40">
        Récemment dans le Top
      </h2>
      <div className="overflow-hidden rounded-2xl border border-white/[0.06]">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-white/[0.06] bg-white/[0.02]">
              <th className="px-4 py-2 text-left text-[10px] font-bold uppercase tracking-wider text-white/30">
                App
              </th>
              <th className="hidden px-4 py-2 text-left text-[10px] font-bold uppercase tracking-wider text-white/30 sm:table-cell">
                Développeur
              </th>
              <th className="px-4 py-2 text-left text-[10px] font-bold uppercase tracking-wider text-white/30">
                Catégorie
              </th>
              <th className="px-4 py-2 text-right text-[10px] font-bold uppercase tracking-wider text-white/30">
                Date
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/[0.04]">
            {apps.map((app, i) => (
              <tr
                key={app.id}
                className="tracker-rise group transition hover:bg-white/[0.03]"
                style={{ animationDelay: `${Math.min(i, 20) * 34}ms` }}
              >
                <td className="px-4 py-3">
                  <TrackerNavLink
                    href={`/tracker/apps/${app.id}`}
                    className="tracker-touch flex items-center gap-3 hover:underline"
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
                    <span className="line-clamp-1 text-sm font-medium text-white/80 group-hover:text-white">
                      {app.name}
                    </span>
                  </TrackerNavLink>
                </td>
                <td className="hidden px-4 py-3 text-xs text-white/45 sm:table-cell">
                  {app.artistName}
                </td>
                <td className="px-4 py-3">
                  <span className="rounded-full bg-white/[0.06] px-2.5 py-1 text-[11px] text-white/55">
                    {app.category}
                  </span>
                </td>
                <td className="px-4 py-3 text-right text-xs text-white/40">
                  {formatDate(app.releaseDate)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
