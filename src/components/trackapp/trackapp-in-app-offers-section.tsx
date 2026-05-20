import type { AppStoreInAppOffer, AppStoreInAppOffers } from "@/lib/apple-app-store-in-app-offers";
import { cn } from "@/lib/utils";

function kindLabel(kind: AppStoreInAppOffer["kind"]): string {
  if (kind === "subscription") return "Abonnement";
  if (kind === "one_time") return "Achat unique";
  return "Achat intégré";
}

function kindBadgeClass(kind: AppStoreInAppOffer["kind"]): string {
  if (kind === "subscription") return "border-violet-200 bg-violet-50 text-violet-800";
  if (kind === "one_time") return "border-sky-200 bg-sky-50 text-sky-800";
  return "border-slate-200 bg-slate-50 text-slate-600";
}

export function TrackappInAppOffersSection({
  data,
  className,
}: Readonly<{
  data: AppStoreInAppOffers;
  className?: string;
}>) {
  if (data.source !== "app-store-web" || data.offers.length === 0) {
    return (
      <section
        className={cn(
          "rounded-[24px] border border-dashed border-slate-200 bg-slate-50/80 p-5",
          className,
        )}
        aria-label="Abonnements in-app"
      >
        <h2 className="m-0 text-[1.25rem] font-bold tracking-tight text-[var(--dash-text)]">
          Abonnements &amp; achats in-app
        </h2>
        <p className="mt-3 text-[0.88rem] leading-relaxed text-[var(--dash-muted-light)]">
          Aucune offre listée sur la fiche App Store pour ce pays — l&apos;éditeur peut n&apos;afficher
          les prix que dans l&apos;app (paywall) ou ne pas publier d&apos;achats intégrés visibles.
        </p>
      </section>
    );
  }

  const subscriptions = data.offers.filter((o) => o.kind === "subscription");
  const others = data.offers.filter((o) => o.kind !== "subscription");

  return (
    <section
      className={cn(
        "rounded-[24px] border border-[var(--dash-border)] bg-white p-5 shadow-[var(--dash-shadow)]",
        className,
      )}
      aria-label="Abonnements in-app"
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="m-0 text-[1.25rem] font-bold tracking-tight text-[var(--dash-text)]">
            Abonnements &amp; achats in-app
          </h2>
          <p className="mt-1 text-[0.8rem] text-[var(--dash-muted-light)]">
            {data.offers.length} offre{data.offers.length > 1 ? "s" : ""} · fiche App Store (
            {data.country.toUpperCase()}) · {data.sectionTitle}
          </p>
        </div>
        <span className="rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-[0.72rem] font-bold uppercase tracking-wide text-emerald-800">
          Prix publics
        </span>
      </div>

      <p className="mt-4 text-[0.82rem] leading-relaxed text-slate-500">
        Montants tels qu&apos;affichés par Apple sur la fiche produit. Les promos, essais gratuits ou
        prix du paywall in-app peuvent différer.
      </p>

      {subscriptions.length > 0 ? (
        <div className="mt-5">
          <h3 className="m-0 text-[0.72rem] font-bold uppercase tracking-[0.14em] text-slate-400">
            Abonnements &amp; offres récurrentes
          </h3>
          <ul className="mt-3 divide-y divide-slate-100 rounded-2xl border border-slate-100">
            {subscriptions.map((offer) => (
              <OfferRow key={`${offer.name}-${offer.priceLabel}`} offer={offer} />
            ))}
          </ul>
        </div>
      ) : null}

      {others.length > 0 ? (
        <div className={subscriptions.length > 0 ? "mt-5" : "mt-5"}>
          <h3 className="m-0 text-[0.72rem] font-bold uppercase tracking-[0.14em] text-slate-400">
            Autres achats intégrés
          </h3>
          <ul className="mt-3 divide-y divide-slate-100 rounded-2xl border border-slate-100">
            {others.map((offer) => (
              <OfferRow key={`${offer.name}-${offer.priceLabel}`} offer={offer} />
            ))}
          </ul>
        </div>
      ) : null}
    </section>
  );
}

function OfferRow({ offer }: Readonly<{ offer: AppStoreInAppOffer }>) {
  return (
    <li className="flex flex-wrap items-center justify-between gap-3 px-4 py-3.5">
      <div className="min-w-0 flex-1">
        <p className="m-0 truncate font-semibold text-slate-900">{offer.name}</p>
        <span
          className={cn(
            "mt-1.5 inline-block rounded-full border px-2 py-0.5 text-[0.68rem] font-bold",
            kindBadgeClass(offer.kind),
          )}
        >
          {kindLabel(offer.kind)}
        </span>
      </div>
      <p className="m-0 shrink-0 text-[1.05rem] font-black tabular-nums tracking-tight text-slate-900">
        {offer.priceLabel}
      </p>
    </li>
  );
}
