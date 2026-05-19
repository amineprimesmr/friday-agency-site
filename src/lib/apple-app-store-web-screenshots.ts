import type { CountryCode } from "@/lib/apple-charts";

/** Timeout fetch page App Store (HTML public). */
const FETCH_MS = 10_000;

const MZ_SCREENSHOT_RE =
  /https:\/\/is\d+-ssl\.mzstatic\.com\/image\/thumb\/[^"'\s]+?\.jpg/gi;

export type AppStoreWebScreenshots = Readonly<{
  iphone: string[];
  ipad: string[];
  source: "app-store-web" | "unavailable";
}>;

function appStoreProductUrl(appId: string, country: CountryCode): string {
  return `https://apps.apple.com/${country}/app/id${appId}`;
}

/** Retire les variantes responsive (`/600x1300bb.jpg`, etc.). */
function screenshotBaseUrl(url: string): string {
  return url.replace(/\/\d+x\d+bb(?:-\d+)?\.(?:jpg|webp)$/i, "");
}

function sortScreenshotUrls(urls: string[]): string[] {
  return [...urls].sort((a, b) => {
    const na = Number(/AIAngle_(\d+)/i.exec(a)?.[1] ?? /_(\d+)\.jpg$/i.exec(a)?.[1] ?? 0);
    const nb = Number(/AIAngle_(\d+)/i.exec(b)?.[1] ?? /_(\d+)\.jpg$/i.exec(b)?.[1] ?? 0);
    return na - nb;
  });
}

/** URL d’affichage (qualité proche de la fiche App Store). */
function toDisplayScreenshotUrl(base: string): string {
  return `${screenshotBaseUrl(base)}/600x1300bb.jpg`;
}

function extractDeviceScreenshots(html: string, device: "iphone" | "ipad"): string[] {
  const needle = device === "iphone" ? "_iOS" : "_ipad";
  const bases = new Set<string>();

  for (const match of html.matchAll(MZ_SCREENSHOT_RE)) {
    const raw = match[0];
    if (!raw.includes(needle)) continue;
    bases.add(screenshotBaseUrl(raw));
  }

  return sortScreenshotUrls([...bases]).map(toDisplayScreenshotUrl);
}

/**
 * Screenshots de la fiche apps.apple.com (souvent plus récents que `itunes.apple.com/lookup`).
 * Ne nécessite pas Apify : HTML public + URLs mzstatic.
 */
export async function fetchAppStoreWebScreenshots(
  appId: string,
  country: CountryCode,
): Promise<AppStoreWebScreenshots> {
  const empty: AppStoreWebScreenshots = { iphone: [], ipad: [], source: "unavailable" };

  try {
    const res = await fetch(appStoreProductUrl(appId, country), {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
        Accept: "text/html,application/xhtml+xml",
        "Accept-Language": "fr-FR,fr;q=0.9,en;q=0.8",
      },
      /** Ne pas réutiliser un fetch iTunes/App Store périmé (regex cassée → fallback iTunes). */
      cache: "no-store",
      signal: AbortSignal.timeout(FETCH_MS),
    });
    if (!res.ok) return empty;

    const html = await res.text();
    const iphone = extractDeviceScreenshots(html, "iphone");
    const ipad = extractDeviceScreenshots(html, "ipad");

    if (!iphone.length && !ipad.length) return empty;

    return { iphone, ipad, source: "app-store-web" };
  } catch {
    return empty;
  }
}
