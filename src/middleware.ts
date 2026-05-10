import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Homepage → vitrine agence (legacy HTML)
  if (pathname === "/") {
    const url = request.nextUrl.clone();
    url.pathname = "/legacy-agency/index.html";
    return NextResponse.rewrite(url);
  }

  // Anciens liens /explorer → tracker
  if (pathname === "/explorer" || pathname.startsWith("/explorer/")) {
    const url = request.nextUrl.clone();
    url.pathname = "/tracker";
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/", "/explorer", "/explorer/:path*"],
};
