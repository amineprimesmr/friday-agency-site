/**
 * TikTok Research API — Ad Library (`/v2/research/adlib/ad/query`).
 * Auth : client_credentials → Bearer (voir Client Access Token Management).
 * @see https://developers.tiktok.com/doc/commercial-content-api-query-ads
 * @see https://developers.tiktok.com/doc/client-access-token-management
 *
 * Accès produit « Research API » / scope `research.adlib.basic` requis sur le portail développeur.
 */

export type TikTokAdLibraryRow = {
  id: string;
  firstShown?: string;
  lastShown?: string;
  status?: string;
  statusStatement?: string;
  videoUrls: string[];
  imageUrls: string[];
  reach?: string;
  advertiserBusinessId?: string;
  advertiserName?: string;
  paidForBy?: string;
};

export type TikTokAdLibraryResult = {
  ads: TikTokAdLibraryRow[];
  hasMore: boolean;
  searchId: string | null;
  tiktokError?: { message: string; code?: string; logId?: string };
};

const TOKEN_URL = "https://open.tiktokapis.com/v2/oauth/token/";
const QUERY_URL = "https://open.tiktokapis.com/v2/research/adlib/ad/query/";

const ADLIB_FIELDS = [
  "ad.id",
  "ad.first_shown_date",
  "ad.last_shown_date",
  "ad.status",
  "ad.status_statement",
  "ad.videos",
  "ad.image_urls",
  "ad.reach",
  "advertiser.business_id",
  "advertiser.business_name",
  "advertiser.paid_for_by",
].join(",");

/** Lib TikTok : données à partir du 2022-10-01 */
const MIN_PUBLISHED = "20221001";

let tokenCache: { token: string; expiresAtMs: number } | null = null;

function toYyyyMmDdUtc(d: Date): string {
  const y = d.getUTCFullYear();
  const m = String(d.getUTCMonth() + 1).padStart(2, "0");
  const day = String(d.getUTCDate()).padStart(2, "0");
  return `${y}${m}${day}`;
}

function defaultPublishedRange(daysBack = 60): { min: string; max: string } {
  const end = new Date();
  const start = new Date(end.getTime() - daysBack * 24 * 60 * 60 * 1000);
  let min = toYyyyMmDdUtc(start);
  const max = toYyyyMmDdUtc(end);
  if (min < MIN_PUBLISHED) min = MIN_PUBLISHED;
  return { min, max };
}

function stringifyId(raw: unknown): string {
  if (raw === null || raw === undefined) return "";
  if (typeof raw === "bigint") return raw.toString();
  if (typeof raw === "number" && !Number.isSafeInteger(raw)) return String(raw);
  return String(raw);
}

function normalizeShown(raw: unknown): string | undefined {
  if (raw === undefined || raw === null) return undefined;
  const s = String(raw);
  if (/^\d{8}$/.test(s)) {
    const y = s.slice(0, 4);
    const m = s.slice(4, 6);
    const d = s.slice(6, 8);
    try {
      return new Date(`${y}-${m}-${d}T12:00:00.000Z`).toLocaleDateString("fr-FR", {
        day: "numeric",
        month: "short",
        year: "numeric",
      });
    } catch {
      return s;
    }
  }
  return s;
}

async function getClientAccessToken(): Promise<{ token: string | null; oauthMessage?: string }> {
  const clientKey = process.env.TIKTOK_CLIENT_KEY?.trim();
  const clientSecret = process.env.TIKTOK_CLIENT_SECRET?.trim();
  if (!clientKey || !clientSecret) {
    return { token: null };
  }

  const now = Date.now();
  if (tokenCache && tokenCache.expiresAtMs > now + 120_000) {
    return { token: tokenCache.token };
  }

  const body = new URLSearchParams({
    client_key: clientKey,
    client_secret: clientSecret,
    grant_type: "client_credentials",
  });

  const res = await fetch(TOKEN_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      "Cache-Control": "no-cache",
    },
    body,
    cache: "no-store",
  });

  const json = (await res.json()) as {
    access_token?: string;
    expires_in?: number;
    error?: string;
    error_description?: string;
    message?: string;
  };

  if (!res.ok || !json.access_token) {
    const msg =
      json.error_description ?? json.message ?? json.error ?? `OAuth HTTP ${res.status}`;
    return { token: null, oauthMessage: msg };
  }

  const ttlSec = json.expires_in ?? 7200;
  tokenCache = {
    token: json.access_token,
    expiresAtMs: now + ttlSec * 1000,
  };
  return { token: tokenCache.token };
}

function parseReach(raw: unknown): string | undefined {
  if (!raw || typeof raw !== "object") return undefined;
  const r = raw as { unique_users_seen?: string };
  return typeof r.unique_users_seen === "string" ? r.unique_users_seen : undefined;
}

function parseVideos(raw: unknown): string[] {
  if (!Array.isArray(raw)) return [];
  const urls: string[] = [];
  for (const v of raw) {
    if (v && typeof v === "object" && typeof (v as { url?: string }).url === "string") {
      urls.push((v as { url: string }).url);
    }
  }
  return urls;
}

function parseImages(raw: unknown): string[] {
  if (!Array.isArray(raw)) return [];
  return raw.filter((x): x is string => typeof x === "string");
}

function parseAdvertiser(raw: unknown): {
  businessId?: string;
  businessName?: string;
  paidForBy?: string;
} {
  if (!raw || typeof raw !== "object") return {};
  const a = raw as Record<string, unknown>;
  const businessId =
    stringifyId(a.business_id ?? (a as { buisness_id?: unknown }).buisness_id) || undefined;
  return {
    businessId,
    businessName: typeof a.business_name === "string" ? a.business_name : undefined,
    paidForBy:
      typeof a.paid_for_by === "string"
        ? a.paid_for_by
        : typeof a.paid_by === "string"
          ? a.paid_by
          : undefined,
  };
}

export async function queryTikTokAdLibrary(params: {
  searchTerm: string;
  /** ISO 3166-1 alpha-2 (ex. US). Omit or ALL pour tous pays. */
  countryCode?: string;
  maxCount?: number;
  searchId?: string;
  /** Fenêtre personnalisée (YYYYMMDD), sinon ~60 derniers jours */
  dateMin?: string;
  dateMax?: string;
}): Promise<TikTokAdLibraryResult> {
  const term = params.searchTerm.trim().slice(0, 50);
  if (!term) {
    return { ads: [], hasMore: false, searchId: null, tiktokError: { message: "Terme de recherche vide" } };
  }

  const { token, oauthMessage } = await getClientAccessToken();
  if (!token) {
    return {
      ads: [],
      hasMore: false,
      searchId: null,
      tiktokError: {
        message:
          oauthMessage ??
          "TIKTOK_CLIENT_KEY / TIKTOK_CLIENT_SECRET non configurés ou jeton OAuth refusé",
      },
    };
  }

  const maxCount = Math.min(Math.max(params.maxCount ?? 12, 1), 50);
  const range =
    params.dateMin && params.dateMax
      ? { min: params.dateMin, max: params.dateMax }
      : defaultPublishedRange(60);

  const cc = params.countryCode?.trim().toUpperCase();
  const filters: Record<string, unknown> = {
    ad_published_date_range: range,
  };
  if (cc && cc !== "ALL") {
    filters.country_code = cc;
  }

  const bodyPayload: Record<string, unknown> = {
    filters,
    search_term: term,
    search_type: "fuzzy_phrase",
    max_count: maxCount,
  };
  if (params.searchId) {
    bodyPayload.search_id = params.searchId;
  }

  const url = `${QUERY_URL}?fields=${encodeURIComponent(ADLIB_FIELDS)}`;

  const res = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(bodyPayload),
    cache: "no-store",
  });

  const json = (await res.json()) as {
    data?: {
      ads?: Array<{
        ad?: Record<string, unknown>;
        advertiser?: Record<string, unknown>;
      }>;
      has_more?: boolean | string;
      search_id?: string;
    };
    error?: { code?: string; message?: string; log_id?: string };
  };

  const metaErr = json.error;
  if (!res.ok || (metaErr && metaErr.code && metaErr.code !== "ok")) {
    const msg = metaErr?.message ?? `HTTP ${res.status}`;
    return {
      ads: [],
      hasMore: false,
      searchId: null,
      tiktokError: {
        message: msg,
        code: metaErr?.code,
        logId: metaErr?.log_id,
      },
    };
  }

  const rows = json.data?.ads ?? [];
  const ads: TikTokAdLibraryRow[] = [];

  for (const row of rows) {
    const ad = row.ad;
    if (!ad || typeof ad !== "object") continue;
    const adv = parseAdvertiser(row.advertiser);
    ads.push({
      id: stringifyId(ad.id),
      firstShown: normalizeShown(ad.first_shown_date),
      lastShown: normalizeShown(ad.last_shown_date),
      status: typeof ad.status === "string" ? ad.status : undefined,
      statusStatement: typeof ad.status_statement === "string" ? ad.status_statement : undefined,
      videoUrls: parseVideos(ad.videos),
      imageUrls: parseImages(ad.image_urls),
      reach: parseReach(ad.reach),
      advertiserBusinessId: adv.businessId,
      advertiserName: adv.businessName,
      paidForBy: adv.paidForBy,
    });
  }

  const hasRaw = json.data?.has_more;
  const hasMore = hasRaw === true || hasRaw === "true";
  const searchId = typeof json.data?.search_id === "string" ? json.data.search_id : null;

  return { ads, hasMore, searchId, tiktokError: undefined };
}
