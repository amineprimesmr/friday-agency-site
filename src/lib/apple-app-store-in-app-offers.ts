import type { CountryCode } from "@/lib/apple-charts";

const FETCH_MS = 12_000;

const IAP_SECTION_TITLES = new Set([
  "achats intégrés",
  "in-app purchases",
  "in-app purchase",
  "achats integres",
]);

export type AppStoreInAppOfferKind = "subscription" | "one_time" | "unknown";

export type AppStoreInAppOffer = Readonly<{
  name: string;
  priceLabel: string;
  kind: AppStoreInAppOfferKind;
  /** Montant numérique si parseable (ex. 22.99). */
  priceAmount: number | null;
  currency: string | null;
}>;

export type AppStoreInAppOffers = Readonly<{
  offers: readonly AppStoreInAppOffer[];
  sectionTitle: string;
  country: CountryCode;
  source: "app-store-web";
}> | Readonly<{
  offers: readonly [];
  country: CountryCode;
  source: "unavailable";
}>;

function appStoreProductUrl(appId: string, country: CountryCode): string {
  return `https://apps.apple.com/${country}/app/id${appId}`;
}

function parsePriceLabel(label: string): { amount: number | null; currency: string | null } {
  const s = label.replace(/\u00a0/g, " ").trim();
  const m = s.match(/([\d]+(?:[.,]\d+)?)\s*(€|EUR|\$|US\$|USD)?/i);
  if (!m) return { amount: null, currency: null };
  const amount = Number.parseFloat(m[1].replace(",", "."));
  const currencyRaw = (m[2] ?? "€").toUpperCase();
  const currency =
    currencyRaw === "$" || currencyRaw === "US$" || currencyRaw === "USD"
      ? "USD"
      : currencyRaw === "€" || currencyRaw === "EUR"
        ? "EUR"
        : currencyRaw;
  return {
    amount: Number.isFinite(amount) ? amount : null,
    currency,
  };
}

function inferOfferKind(name: string): AppStoreInAppOfferKind {
  const n = name.toLowerCase();
  if (
    /\b(week|weekly|hebdo|semaine|month|monthly|mensuel|mois|year|yearly|annual|annuel|an\b|subscription|abonnement|premium|pro\b|plus\b|unlimited)/i.test(
      n,
    ) &&
    !/\b(restore|coin|gem|credit|token|pack|boost)\b/i.test(n)
  ) {
    return "subscription";
  }
  if (/\b(restore|unlock|lifetime|à vie|vie\b|one.?time|achat unique)\b/i.test(n)) {
    return "one_time";
  }
  if (/\b(plan|tier|membership|family)\b/i.test(n)) {
    return "subscription";
  }
  return "unknown";
}

function normalizeSectionTitle(title: string): string {
  const t = title.trim();
  return t || "Achats intégrés";
}

function dedupeOffers(offers: AppStoreInAppOffer[]): AppStoreInAppOffer[] {
  const seen = new Set<string>();
  const out: AppStoreInAppOffer[] = [];
  for (const o of offers) {
    const key = `${o.name.toLowerCase()}|${o.priceLabel}`;
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(o);
  }
  return out;
}

function sortOffers(offers: AppStoreInAppOffer[]): AppStoreInAppOffer[] {
  const rank: Record<AppStoreInAppOfferKind, number> = {
    subscription: 0,
    unknown: 1,
    one_time: 2,
  };
  return [...offers].sort((a, b) => {
    const ka = rank[a.kind] - rank[b.kind];
    if (ka !== 0) return ka;
    const pa = a.priceAmount ?? 0;
    const pb = b.priceAmount ?? 0;
    return pb - pa;
  });
}

function pairToOffer(name: string, priceLabel: string): AppStoreInAppOffer {
  const { amount, currency } = parsePriceLabel(priceLabel);
  return {
    name: name.trim(),
    priceLabel: priceLabel.trim(),
    kind: inferOfferKind(name),
    priceAmount: amount,
    currency,
  };
}

function extractPairsFromInformationItem(item: Record<string, unknown>): AppStoreInAppOffer[] {
  const offers: AppStoreInAppOffer[] = [];

  const itemsV3 = item.items_V3;
  if (Array.isArray(itemsV3)) {
    for (const row of itemsV3) {
      if (!row || typeof row !== "object") continue;
      const r = row as Record<string, unknown>;
      if (r.$kind === "textPair" && typeof r.leadingText === "string" && typeof r.trailingText === "string") {
        offers.push(pairToOffer(r.leadingText, r.trailingText));
      }
    }
  }

  const nestedItems = item.items;
  if (Array.isArray(nestedItems)) {
    for (const nested of nestedItems) {
      if (!nested || typeof nested !== "object") continue;
      const textPairs = (nested as Record<string, unknown>).textPairs;
      if (!Array.isArray(textPairs)) continue;
      for (const pair of textPairs) {
        if (!Array.isArray(pair) || pair.length < 2) continue;
        const name = String(pair[0] ?? "");
        const price = String(pair[1] ?? "");
        if (name && price) offers.push(pairToOffer(name, price));
      }
    }
  }

  return offers;
}

function parseOffersFromEmbeddedJson(
  data: unknown,
  _country: CountryCode,
): { offers: AppStoreInAppOffer[]; sectionTitle: string } | null {
  if (!data || typeof data !== "object") return null;
  const root = data as Record<string, unknown>;
  const rows = root.data;
  if (!Array.isArray(rows) || !rows[0] || typeof rows[0] !== "object") return null;

  const pageData = (rows[0] as Record<string, unknown>).data as Record<string, unknown> | undefined;
  const information = (pageData?.shelfMapping as Record<string, unknown> | undefined)
    ?.information as Record<string, unknown> | undefined;
  const infoItems = information?.items;
  if (!Array.isArray(infoItems)) return null;

  let sectionTitle = "Achats intégrés";
  const collected: AppStoreInAppOffer[] = [];

  for (const item of infoItems) {
    if (!item || typeof item !== "object") continue;
    const row = item as Record<string, unknown>;
    const title = typeof row.title === "string" ? row.title : "";
    if (!IAP_SECTION_TITLES.has(title.trim().toLowerCase())) continue;
    sectionTitle = normalizeSectionTitle(title);
    collected.push(...extractPairsFromInformationItem(row));
  }

  if (!collected.length) return null;
  return { offers: sortOffers(dedupeOffers(collected)), sectionTitle };
}

function extractEmbeddedProductJson(html: string): unknown | null {
  const match = html.match(
    /<script[^>]*type="application\/json"[^>]*>([\s\S]*?)<\/script>/i,
  );
  if (!match?.[1]) return null;
  try {
    return JSON.parse(match[1]) as unknown;
  } catch {
    return null;
  }
}

const IAP_FALLBACK_COUNTRIES: readonly CountryCode[] = ["fr", "gb", "de", "ca", "es"];

async function fetchOffersForCountry(
  appId: string,
  country: CountryCode,
): Promise<{ offers: AppStoreInAppOffer[]; sectionTitle: string } | null> {
  try {
    const res = await fetch(appStoreProductUrl(appId, country), {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
        Accept: "text/html,application/xhtml+xml",
        "Accept-Language": `${country === "fr" ? "fr-FR,fr" : "en-US,en"};q=0.9`,
      },
      cache: "no-store",
      signal: AbortSignal.timeout(FETCH_MS),
    });
    if (!res.ok) return null;

    const html = await res.text();
    const embedded = extractEmbeddedProductJson(html);
    const parsed = parseOffersFromEmbeddedJson(embedded, country);
    if (!parsed?.offers.length) return null;
    return parsed;
  } catch {
    return null;
  }
}

/**
 * Offres d’achats intégrés / abonnements affichées sur la fiche apps.apple.com.
 * Essaie le pays demandé puis fr / us / gb / de si la section IAP est vide.
 */
export async function fetchAppStoreInAppOffers(
  appId: string,
  country: CountryCode,
): Promise<AppStoreInAppOffers> {
  const empty: AppStoreInAppOffers = { offers: [], country, source: "unavailable" };
  const tryOrder = [country, ...IAP_FALLBACK_COUNTRIES.filter((c) => c !== country)];

  for (const cc of tryOrder) {
    const parsed = await fetchOffersForCountry(appId, cc);
    if (parsed?.offers.length) {
      return {
        offers: parsed.offers,
        sectionTitle: parsed.sectionTitle,
        country: cc,
        source: "app-store-web",
      };
    }
  }
  return empty;
}
