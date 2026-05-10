import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

/**
 * La racine `/` est servie uniquement via `next.config.ts` → `beforeFiles` rewrite
 * vers `/legacy-agency/index.html` (fichier statique dans `public/`).
 * Évite une double réécriture middleware + config sur Edge (comportements divergents).
 */
export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (pathname === "/explorer" || pathname.startsWith("/explorer/")) {
    const url = request.nextUrl.clone();
    url.pathname = "/tracker";
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/explorer", "/explorer/:path*"],
};
