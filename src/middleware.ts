import { createServerClient } from "@supabase/ssr";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

const PROTECT_PREFIXES = ["/trackapp/espace", "/trackapp/onboarding"];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (pathname === "/explorer" || pathname.startsWith("/explorer/")) {
    const url = request.nextUrl.clone();
    url.pathname = "/tracker";
    return NextResponse.redirect(url);
  }

  if (!pathname.startsWith("/trackapp")) {
    return NextResponse.next();
  }

  let response = NextResponse.next({
    request: { headers: request.headers },
  });

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  const needsAuth = PROTECT_PREFIXES.some((p) => pathname === p || pathname.startsWith(`${p}/`));

  if (!supabaseUrl || !supabaseAnonKey) {
    return response;
  }

  const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) => {
          request.cookies.set(name, value);
        });
        response = NextResponse.next({
          request: { headers: request.headers },
        });
        cookiesToSet.forEach(({ name, value, options }) => {
          response.cookies.set(name, value, options);
        });
      },
    },
  });

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (needsAuth && !user) {
    const signUrl = request.nextUrl.clone();
    signUrl.pathname = "/trackapp/connexion";
    const nextFull = pathname + request.nextUrl.search;
    signUrl.searchParams.set("next", nextFull);
    const redirectResponse = NextResponse.redirect(signUrl);
    response.cookies.getAll().forEach((cookie) => {
      redirectResponse.cookies.set(cookie);
    });
    return redirectResponse;
  }

  return response;
}

export const config = {
  matcher: [
    "/explorer",
    "/explorer/:path*",
    "/trackapp",
    "/trackapp/:path*",
  ],
};
