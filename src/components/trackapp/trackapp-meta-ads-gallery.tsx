import type { MetaAdsLibraryFetchResult } from "@/lib/meta-ads-library";
import { cn } from "@/lib/utils";

function formatDeliveryRange(start: string | null, stop: string | null): string {
  const fmt = (raw: string | null) => {
    if (!raw) return null;
    const d = new Date(raw);
    if (Number.isNaN(d.getTime())) return null;
    return d.toLocaleDateString("fr-FR", { day: "numeric", month: "short", year: "numeric" });
  };
  const a = fmt(start);
  const b = fmt(stop);
  if (a && b) return `${a} → ${b}`;
  if (a) return `depuis ${a}`;
  if (b) return `jusqu’au ${b}`;
  return "dates inconnues";
}

function platformLabel(p: string): string {
  const k = p.toLowerCase();
  if (k.includes("instagram")) return "Instagram";
  if (k.includes("facebook")) return "Facebook";
  if (k.includes("messenger")) return "Messenger";
  if (k.includes("audience")) return "Audience Network";
  return p;
}

function PlatformBadge({ platform }: { platform: string }) {
  const label = platformLabel(platform);
  const isIg = label === "Instagram";
  return (
    <span
      className={cn(
        "rounded-full px-2 py-0.5 text-[0.65rem] font-bold uppercase tracking-wide ring-1",
        isIg ? "bg-fuchsia-50 text-fuchsia-800 ring-fuchsia-200" : "bg-blue-50 text-blue-800 ring-blue-200",
      )}
    >
      {label}
    </span>
  );
}

function AdCard({ ad }: { ad: MetaAdsLibraryFetchResult["ads"][number] }) {
  const primaryText = ad.bodies[0] || ad.linkTitles[0] || "Publicité";
  const extraCards = Math.max(0, ad.bodies.length - 1);

  return (
    <article className="flex flex-col overflow-hidden rounded-[20px] border border-[var(--dash-border)] bg-white shadow-[var(--dash-shadow)]">
      <a
        href={ad.snapshotUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="group relative block aspect-[4/5] max-h-[320px] overflow-hidden bg-slate-100"
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={ad.snapshotUrl}
          alt=""
          className="h-full w-full object-cover object-top transition duration-300 group-hover:scale-[1.02]"
          loading="lazy"
          decoding="async"
        />
        <span className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/55 to-transparent px-3 py-2 text-[0.72rem] font-semibold text-white">
          Aperçu créa ↗
        </span>
      </a>
      <div className="flex flex-1 flex-col gap-2 p-3.5">
        <div className="flex flex-wrap gap-1.5">
          {ad.publisherPlatforms.length > 0 ? (
            ad.publisherPlatforms.map((p) => <PlatformBadge key={p} platform={p} />)
          ) : (
            <span className="text-[0.68rem] font-semibold uppercase tracking-wide text-slate-400">Meta</span>
          )}
        </div>
        <p className="line-clamp-3 text-[0.82rem] leading-snug text-[var(--dash-text)]">{primaryText}</p>
        {extraCards > 0 ? (
          <p className="text-[0.72rem] font-medium text-[var(--dash-muted-light)]">+{extraCards} variante(s)</p>
        ) : null}
        <p className="mt-auto text-[0.72rem] text-[var(--dash-muted-light)]">
          {formatDeliveryRange(ad.deliveryStart, ad.deliveryStop)}
        </p>
      </div>
    </article>
  );
}

export function TrackappMetaAdsGallery({
  result,
  pageName,
}: Readonly<{
  result: MetaAdsLibraryFetchResult;
  pageName?: string | null;
}>) {
  const title = pageName?.trim() || result.pageName?.trim() || `Page ${result.pageId}`;

  return (
    <div className="mt-8 border-t border-[var(--dash-border)] pt-8">
      <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="m-0 text-[0.72rem] font-bold uppercase tracking-[0.14em] text-slate-400">
            Publicités Meta
          </p>
          <h4 className="mt-1 text-[1.1rem] font-bold tracking-tight text-[var(--dash-text)]">
            Créas de {title}
          </h4>
          <p className="mt-1 max-w-[58ch] text-[0.84rem] leading-relaxed text-[var(--dash-muted-light)]">
            Uniquement les annonces liées à la page Facebook officielle (
            <code className="rounded bg-slate-100 px-1 text-[0.78rem]">view_all_page_id</code>
            ), jamais une recherche mot-clé.
          </p>
        </div>
        <a
          href={result.libraryUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex min-h-9 items-center justify-center rounded-full border border-indigo-200 bg-indigo-50 px-4 text-[0.78rem] font-bold text-indigo-900 no-underline transition hover:bg-indigo-100"
        >
          Meta Ad Library ↗
        </a>
      </div>

      {!result.ok ? (
        <div className="rounded-2xl border border-dashed border-amber-200 bg-amber-50 px-4 py-4 text-[0.88rem] leading-relaxed text-amber-950">
          <strong className="font-bold">Créas indisponibles.</strong>{" "}
          {result.error || "Impossible de charger les publicités pour cette page."}
        </div>
      ) : null}

      {result.ok && result.ads.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-4 py-8 text-center text-[0.88rem] text-slate-600">
          Aucune publicité archivée trouvée pour cette page dans le pays sélectionné. Essaie la vue complète dans
          Meta Ad Library.
        </div>
      ) : null}

      {result.ok && result.ads.length > 0 ? (
        <ul className="m-0 grid list-none grid-cols-1 gap-4 p-0 sm:grid-cols-2 lg:grid-cols-3">
          {result.ads.map((ad) => (
            <li key={ad.id}>
              <AdCard ad={ad} />
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}
