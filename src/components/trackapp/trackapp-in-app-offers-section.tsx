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

function kindClass(kind: AppStoreInAppOffer["kind"]): string {
  if (kind === "subscription") return "ta-detail-offer-kind ta-detail-offer-kind--sub";
  return "ta-detail-offer-kind ta-detail-offer-kind--iap";
}

export function TrackappInAppOffersSection({
  data: initialData,
  appId,
  country,
  className,
  embedded = false,
}: Readonly<{
  data: AppStoreInAppOffers;
  appId: string;
  country: CountryCode;
  className?: string;
  embedded?: boolean;
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

  const empty = (
    <div className="ta-detail-empty">
      Aucune offre récupérée sur la fiche App Store pour le moment. Apple ne liste pas toujours les
      abonnements sur le web — le paywall peut n&apos;apparaître qu&apos;in-app.{" "}
      <button
        type="button"
        className="ta-detail-btn-ghost mt-3"
        onClick={() => void refresh()}
        disabled={refreshing}
      >
        {refreshing ? "Recherche…" : "Actualiser les prix"}
      </button>
    </div>
  );

  if (data.source !== "app-store-web" || data.offers.length === 0) {
    if (embedded) {
      return (
        <article className="ta-detail-card">
          <div className="ta-detail-card__head">
            <div>
              <p className="ta-detail-card__kicker">Revenus</p>
              <h2 className="ta-detail-card__title">Abonnements &amp; achats in-app</h2>
            </div>
          </div>
          <div className="ta-detail-card__body ta-detail-card__body--flush-top">{empty}</div>
        </article>
      );
    }
    return (
      <section className={cn("ta-detail-empty", className)} aria-label="Abonnements in-app">
        {empty}
      </section>
    );
  }

  const subscriptions = data.offers.filter((o) => o.kind === "subscription");
  const others = data.offers.filter((o) => o.kind !== "subscription");

  const content = (
    <>
      <p className="m-0 text-[0.82rem] leading-relaxed text-slate-500">
        Montants tels qu&apos;affichés par Apple. Promos, essais gratuits ou prix in-app peuvent
        différer.
      </p>

      {subscriptions.length > 0 ? (
        <div className="mt-4">
          <p className="m-0 mb-2 text-[0.68rem] font-bold uppercase tracking-[0.12em] text-slate-400">
            Abonnements récurrents
          </p>
          <ul className="ta-detail-offers-list">
            {subscriptions.map((offer) => (
              <OfferRow key={`${offer.name}-${offer.priceLabel}`} offer={offer} />
            ))}
          </ul>
        </div>
      ) : null}

      {others.length > 0 ? (
        <div className={subscriptions.length > 0 ? "mt-4" : "mt-4"}>
          <p className="m-0 mb-2 text-[0.68rem] font-bold uppercase tracking-[0.12em] text-slate-400">
            Autres achats intégrés
          </p>
          <ul className="ta-detail-offers-list">
            {others.map((offer) => (
              <OfferRow key={`${offer.name}-${offer.priceLabel}`} offer={offer} />
            ))}
          </ul>
        </div>
      ) : null}
    </>
  );

  if (embedded) {
    return (
      <article className="ta-detail-card">
        <div className="ta-detail-card__head">
          <div>
            <p className="ta-detail-card__kicker">Revenus</p>
            <h2 className="ta-detail-card__title">Abonnements &amp; achats in-app</h2>
            <p className="ta-detail-card__sub">
              {data.offers.length} offre{data.offers.length > 1 ? "s" : ""} · App Store (
              {data.country.toUpperCase()})
            </p>
          </div>
          <span className="ta-detail-badge ta-detail-badge--success">Prix publics</span>
        </div>
        <div className="ta-detail-card__body ta-detail-card__body--flush-top">{content}</div>
      </article>
    );
  }

  return (
    <section
      className={cn("ta-detail-card p-5", className)}
      aria-label="Abonnements in-app"
    >
      <div className="ta-detail-card__head !p-0">
        <div>
          <h2 className="ta-detail-card__title">Abonnements &amp; achats in-app</h2>
          <p className="ta-detail-card__sub">
            {data.offers.length} offre{data.offers.length > 1 ? "s" : ""} · {data.country.toUpperCase()}
          </p>
        </div>
        <span className="ta-detail-badge ta-detail-badge--success">Prix publics</span>
      </div>
      <div className="mt-4">{content}</div>
    </section>
  );
}

function OfferRow({ offer }: Readonly<{ offer: AppStoreInAppOffer }>) {
  return (
    <li>
      <div className="min-w-0 flex-1">
        <p className="ta-detail-offer-name">{offer.name}</p>
        <span className={kindClass(offer.kind)}>{kindLabel(offer.kind)}</span>
      </div>
      <p className="ta-detail-offer-price">{offer.priceLabel}</p>
    </li>
  );
}
