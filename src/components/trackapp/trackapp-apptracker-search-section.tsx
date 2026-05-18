import Link from "next/link";

import { TrackappApptrackerAppResultCard } from "@/components/trackapp/trackapp-apptracker-app-result-card";
import { TrackappApptrackerLiquidSearchForm } from "@/components/trackapp/trackapp-apptracker-liquid-search-form";
import { COUNTRY_MAP, type CountryCode, type SearchResult } from "@/lib/apple-charts";
import { TRACKAPP_APPTRACKER_SEARCH_EXAMPLES } from "@/lib/trackapp-apptracker-search";

type Props = Readonly<{
  action: "/trackapp/accueil" | "/trackapp/apptracker";
  q: string;
  country: CountryCode;
  results: SearchResult[];
}>;

export function TrackappApptrackerSearchSection({ action, q, country, results }: Props) {
  const countryData = COUNTRY_MAP[country];

  return (
    <>
      <TrackappApptrackerLiquidSearchForm action={action} defaultQuery={q} country={country} />

      {!q ? (
        <section className="rounded-[26px] border border-dashed border-slate-300 bg-white p-8 text-center shadow-[var(--dash-shadow)]">
          <p className="text-4xl">⌕</p>
          <h2 className="mt-4 text-xl font-bold tracking-tight text-[var(--dash-text)]">
            Cherche n&apos;importe quelle app
          </h2>
          <p className="mx-auto mt-2 max-w-lg text-[0.92rem] leading-relaxed text-[var(--dash-muted-light)]">
            Utilise la barre du haut ou cette page pour ouvrir une fiche Apptracker avec metrics, screenshots et
            analyse.
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-2">
            {TRACKAPP_APPTRACKER_SEARCH_EXAMPLES.map((term) => (
              <Link
                key={term}
                href={`${action}?q=${encodeURIComponent(term)}&country=${country}`}
                className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-[0.82rem] font-semibold text-slate-600 no-underline transition hover:border-slate-300 hover:bg-white"
              >
                {term}
              </Link>
            ))}
          </div>
        </section>
      ) : (
        <section>
          <div className="mb-4 flex flex-wrap items-end justify-between gap-2">
            <div>
              <h2 className="m-0 text-[1.35rem] font-bold tracking-tight text-[var(--dash-text)]">
                Résultats pour “{q}”
              </h2>
              <p className="mt-1 text-[0.9rem] text-[var(--dash-muted-light)]">
                {results.length} résultats · {countryData?.flag} {countryData?.name}
              </p>
            </div>
          </div>
          {results.length > 0 ? (
            <div className="grid gap-3">
              {results.map((app) => (
                <TrackappApptrackerAppResultCard key={app.id} app={app} country={country} />
              ))}
            </div>
          ) : (
            <div className="rounded-[24px] border border-dashed border-slate-300 bg-white py-16 text-center text-[var(--dash-muted-light)]">
              Aucun résultat. Essaie un nom plus précis.
            </div>
          )}
        </section>
      )}
    </>
  );
}
