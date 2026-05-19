import { NextResponse } from "next/server";

const ALLOWED_HOSTS = [
  "cdninstagram.com",
  "fbcdn.net",
  "tiktokcdn.com",
  "tiktokcdn-us.com",
  "tiktokcdn-eu.com",
  "tiktokcdn-asia.com",
];

function isAllowedMediaUrl(raw: string): URL | null {
  try {
    const url = new URL(raw);
    if (url.protocol !== "https:") return null;
    const host = url.hostname.replace(/^www\./i, "").toLowerCase();
    if (!ALLOWED_HOSTS.some((allowed) => host === allowed || host.endsWith(`.${allowed}`))) return null;
    return url;
  } catch {
    return null;
  }
}

export const maxDuration = 20;

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const target = isAllowedMediaUrl(searchParams.get("url") ?? "");

  if (!target) {
    return NextResponse.json({ error: "URL média non autorisée" }, { status: 400 });
  }

  try {
    const upstream = await fetch(target.toString(), {
      headers: {
        Accept: "image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8",
        "User-Agent":
          "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125 Safari/537.36",
      },
      signal: AbortSignal.timeout(12_000),
      cache: "force-cache",
      next: { revalidate: 60 * 60 * 12 },
    });

    if (!upstream.ok || !upstream.body) {
      return NextResponse.json({ error: "Média indisponible" }, { status: 502 });
    }

    const contentType = upstream.headers.get("content-type") || "image/jpeg";
    if (!contentType.toLowerCase().startsWith("image/")) {
      return NextResponse.json({ error: "Type média non supporté" }, { status: 415 });
    }

    return new NextResponse(upstream.body, {
      status: 200,
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "public, s-maxage=43200, stale-while-revalidate=86400",
      },
    });
  } catch {
    return NextResponse.json({ error: "Proxy média indisponible" }, { status: 502 });
  }
}
