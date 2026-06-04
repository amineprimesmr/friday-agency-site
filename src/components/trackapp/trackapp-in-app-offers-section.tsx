"use client";

import { useCallback, useState } from "react";

import type { AppStoreInAppOffer, AppStoreInAppOffers } from "@/lib/apple-app-store-in-app-offers";
import type { CountryCode } from "@/lib/apple-charts";
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
  data: initialData,
  appId,
  country,
  className,
}: Readonly<{
  data: AppStoreInAppOffers;
  appId: string;
  country: CountryCode;
  className?: string;
}>) {
  const [data, setData] = useState(initialData);
  const [refreshing, setRefreshing] = useState(false);

  const refresh = useCallback(async () => {
    setRefreshing(true);
    try {
      const res = await fetch(
        `/api/trackapp/in-app-offers?appId=${encodeURIComponent(appId)}&country=${encodeURIComponent(country)}&_=${Date.now()}`,
        { cache: "no-store" },
      );
      if (res.ok) {
        const json = (await res.json()) as AppStoreInAppOffers;
        setData(json);
      }
    } finally {
      setRefreshing(false);
    }
  }, [appId, country]);

  if (data.source !== "app-store-web" || data.offers.length === 0) {
    return (
      <section
        className={cn(
          "rounded-[24px] border border-dashed border-slate-200 bg-slate-50/80 p-5",
          className,
        )}
        aria-label="Abonnements in-app"
      >
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="m-0 text-[1.25rem] font-bold tracking-tight text-[var(--dash-text)]">
            Abonnements &amp; achats in-app
          </h2>
          <button
            type="button"
            className="rounded-full border border-slate-300 bg-white px-3 py-1.5 text-[0.78rem] font-semibold text-slate-700 transition hover:border-slate-400 disabled:opacity-50"
            onClick={() => void refresh()}
            disabled={refreshing}
          >
            {refreshing ? "Recherche…" : "Actualiser"}
          </button>
        </div>
        <p className="mt-3 text-[0.88rem] leading-relaxed text-[var(--dash-muted-light)]">
          Aucune offre détectée pour le moment. Apple ne liste pas toujours les abonnements sur le web.
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
      <h2 className="m-0 text-[1.25rem] font-bold tracking-tight text-[var(--dash-text)]">
        Abonnements &amp; achats in-app
      </h2>

      {subscriptions.length > 0 ? (
        <div className="mt-5">
          <h3 className="m-0 text-[0.72rem] font-bold uppercase tracking-[0.14em] text-slate-400">
            Abonnements
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
            Autres achats
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
