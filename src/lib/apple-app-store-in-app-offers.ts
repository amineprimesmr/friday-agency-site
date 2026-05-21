import type { CountryCode } from "@/lib/apple-charts";

const FETCH_MS = 9_000;
const RETRIES = 2;

/** Titres section IAP sur apps.apple.com (toutes langues storefront courantes). */
const IAP_SECTION_TITLE_PATTERNS = [
  /^achats\s+int[eé]gr[eé]s$/i,
  /^in[- ]?app\s+purchases?$/i,
  /^in[- ]?app[- ]?k[aä]ufe$/i,
  /^acquisti\s+in[- ]?app$/i,
  /^compras\s+integradas$/i,
  /^compras\s+dentro\s+da\s+app$/i,
];

const IAP_FALLBACK_COUNTRIES: readonly CountryCode[] = [
  "fr",
  "gb",
  "de",
  "ca",
  "es",
  "it",
  "au",
  "jp",
];

export type AppStoreInAppOfferKind = "subscription" | "one_time" | "unknown";

export type AppStoreInAppOffer = Readonly<{
  name: string;
  priceLabel: string;
  kind: AppStoreInAppOfferKind;
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

function normalizeIapTitle(title: string): string {
  return title
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{M}/gu, "");
}

function isIapSectionTitle(title: string): boolean {
  const t = normalizeIapTitle(title);
  if (!t) return false;
  return IAP_SECTION_TITLE_PATTERNS.some((re) => re.test(t));
}

function parsePriceLabel(label: string): { amount: number | null; currency: string | null } {
  const s = label.replace(/\u00a0/g, " ").trim();
  const m = s.match(/([\d]+(?:[.,]\d+)?)\s*(€|EUR|\$|US\$|USD|£|GBP)?/i);
  if (!m) return { amount: null, currency: null };
  const amount = Number.parseFloat(m[1].replace(",", "."));
  const currencyRaw = (m[2] ?? "€").toUpperCase();
  const currency =
    currencyRaw === "$" || currencyRaw === "US$" || currencyRaw === "USD"
      ? "USD"
      : currencyRaw === "€" || currencyRaw === "EUR"
        ? "EUR"
        : currencyRaw === "£" || currencyRaw === "GBP"
          ? "GBP"
          : currencyRaw;
  return {
    amount: Number.isFinite(amount) ? amount : null,
    currency,
  };
}

function inferOfferKind(name: string): AppStoreInAppOfferKind {
  const n = name.toLowerCase();
  if (
    /\b(week|weekly|hebdo|semaine|month|monthly|mensuel|mois|year|yearly|annual|annuel|an\b|subscription|abonnement|premium|pro\b|plus\b|unlimited|formation)/i.test(
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

function pairToOffer(name: string, priceLabel: string): AppStoreInAppOffer | null {
  const n = name.trim();
  const p = priceLabel.trim();
  if (!n || !p || p === "—" || p === "-") return null;
  const { amount, currency } = parsePriceLabel(p);
  return {
    name: n,
    priceLabel: p,
    kind: inferOfferKind(n),
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
      if (r.$kind !== "textPair") continue;
      if (typeof r.leadingText !== "string" || typeof r.trailingText !== "string") continue;
      const offer = pairToOffer(r.leadingText, r.trailingText);
      if (offer) offers.push(offer);
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
        const offer = pairToOffer(String(pair[0] ?? ""), String(pair[1] ?? ""));
        if (offer) offers.push(offer);
      }
    }
  }

  return offers;
}

function parseOffersFromEmbeddedJson(
  data: unknown,
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
    if (!isIapSectionTitle(title)) continue;
    sectionTitle = normalizeSectionTitle(title);
    collected.push(...extractPairsFromInformationItem(row));
  }

  if (!collected.length) return null;
  return { offers: sortOffers(dedupeOffers(collected)), sectionTitle };
}

/** Tous les blocs JSON embarqués (pas seulement le premier script). */
function extractEmbeddedProductJsonList(html: string): unknown[] {
  const out: unknown[] = [];
  const re = /<script[^>]*type="application\/json"[^>]*>([\s\S]*?)<\/script>/gi;
  let match: RegExpExecArray | null;
  while ((match = re.exec(html)) !== null) {
    try {
      out.push(JSON.parse(match[1]) as unknown);
    } catch {
      /* ignore */
    }
  }
  return out;
}

function parseOffersFromHtml(html: string): { offers: AppStoreInAppOffer[]; sectionTitle: string } | null {
  const blobs = extractEmbeddedProductJsonList(html);
  let best: { offers: AppStoreInAppOffer[]; sectionTitle: string } | null = null;

  for (const blob of blobs) {
    const parsed = parseOffersFromEmbeddedJson(blob);
    if (!parsed?.offers.length) continue;
    if (!best || parsed.offers.length > best.offers.length) best = parsed;
  }

  return best;
}

async function sleep(ms: number): Promise<void> {
  await new Promise((resolve) => setTimeout(resolve, ms));
}

async function fetchOffersForCountryOnce(
  appId: string,
  country: CountryCode,
): Promise<{ offers: AppStoreInAppOffer[]; sectionTitle: string } | null> {
  const res = await fetch(appStoreProductUrl(appId, country), {
    headers: {
      "User-Agent":
        "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
      Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
      "Accept-Language":
        country === "fr"
          ? "fr-FR,fr;q=0.9,en;q=0.5"
          : country === "de"
            ? "de-DE,de;q=0.9,en;q=0.5"
            : "en-US,en;q=0.9",
      "Cache-Control": "no-cache",
    },
    cache: "no-store",
    signal: AbortSignal.timeout(FETCH_MS),
  });
  if (!res.ok) return null;

  const html = await res.text();
  return parseOffersFromHtml(html);
}

async function fetchOffersForCountry(
  appId: string,
  country: CountryCode,
): Promise<{ offers: AppStoreInAppOffer[]; sectionTitle: string; country: CountryCode } | null> {
  for (let attempt = 0; attempt < RETRIES; attempt += 1) {
    try {
      const parsed = await fetchOffersForCountryOnce(appId, country);
      if (parsed?.offers.length) {
        return { ...parsed, country };
      }
    } catch {
      /* retry */
    }
    if (attempt < RETRIES - 1) await sleep(350 * (attempt + 1));
  }
  return null;
}

type CountryOffersResult = {
  offers: AppStoreInAppOffer[];
  sectionTitle: string;
  country: CountryCode;
};

/**
 * Offres IAP / abonnements listés sur apps.apple.com (section « Achats intégrés »).
 * Le storefront demandé (ex. `fr` → €) est prioritaire ; les autres pays ne servent
 * qu’en secours si la fiche locale ne liste aucun achat intégré.
 */
export async function fetchAppStoreInAppOffers(
  appId: string,
  country: CountryCode,
): Promise<AppStoreInAppOffers> {
  const empty: AppStoreInAppOffers = { offers: [], country, source: "unavailable" };
  const tryOrder = [country, ...IAP_FALLBACK_COUNTRIES.filter((c) => c !== country)];

  const settled = await Promise.all(
    tryOrder.map((cc) => fetchOffersForCountry(appId, cc)),
  );

  const primary = settled.find(
    (r): r is CountryOffersResult =>
      r != null && r.country === country && r.offers.length > 0,
  );
  if (primary) {
    return {
      offers: primary.offers,
      sectionTitle: primary.sectionTitle,
      country: primary.country,
      source: "app-store-web",
    };
  }

  let best: CountryOffersResult | null = null;
  for (const result of settled) {
    if (!result?.offers.length) continue;
    if (!best || result.offers.length > best.offers.length) best = result;
  }

  if (!best) return empty;

  return {
    offers: best.offers,
    sectionTitle: best.sectionTitle,
    country: best.country,
    source: "app-store-web",
  };
}
