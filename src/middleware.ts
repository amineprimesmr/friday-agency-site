import { createServerClient } from "@supabase/ssr";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

import {
  AFFILIATE_REF_COOKIE,
  AFFILIATE_REF_COOKIE_MAX_AGE_SEC,
} from "@/lib/trackapp/affiliate/config";

function withReferralCookie(request: NextRequest, response: NextResponse): NextResponse {
  const ref = request.nextUrl.searchParams.get("ref")?.trim().toLowerCase();
  if (ref && ref.length >= 4 && ref.length <= 32) {
    response.cookies.set(AFFILIATE_REF_COOKIE, ref, {
      maxAge: AFFILIATE_REF_COOKIE_MAX_AGE_SEC,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
    });
  }
  return response;
}

const PREMIUM_EXEMPT_PREFIXES = [
  "/trackapp/paiement",
  "/trackapp/activation",
  "/trackapp/connexion",
  "/trackapp/inscription",
  "/trackapp/mot-de-passe-oublie",
  "/trackapp/onboarding",
  "/trackapp/legal",
  "/trackapp/auth",
  "/trackapp/deconnexion",
];

const PROTECT_PREFIXES = [
  "/trackapp/accueil",
  "/trackapp/apptracker",
  "/trackapp/creer-mon-app",
  "/trackapp/ads",
  "/trackapp/organique",
  "/trackapp/logiciels",
  "/trackapp/ressources",
  "/trackapp/favoris",
  "/trackapp/gagner-240",
];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  let response = NextResponse.next({
    request: { headers: request.headers },
  });
  response = withReferralCookie(request, response);

  if (pathname === "/explorer" || pathname.startsWith("/explorer/")) {
    const url = request.nextUrl.clone();
    url.pathname = "/tracker";
    return withReferralCookie(request, NextResponse.redirect(url));
  }

  if (pathname === "/tracker/new-releases" || pathname.startsWith("/tracker/new-releases/")) {
    const url = request.nextUrl.clone();
    url.pathname = "/tracker";
    return withReferralCookie(request, NextResponse.redirect(url));
  }

  const isResourcesApi = pathname.startsWith("/api/trackapp/ressources");
  const isFavoritesApi = pathname.startsWith("/api/trackapp/favorites");
  const isAffiliateApi = pathname.startsWith("/api/trackapp/affiliate");

  if (!pathname.startsWith("/trackapp") && !isResourcesApi && !isFavoritesApi && !isAffiliateApi) {
    return response;
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  const needsAuth =
    PROTECT_PREFIXES.some((p) => pathname === p || pathname.startsWith(`${p}/`))
    || isResourcesApi
    || isFavoritesApi
    || isAffiliateApi;

  /** En local tu peux ouvrir l’UI SaaS sans session ; la page serve les données maquette. */
  const skipTrackappAuth = process.env.NODE_ENV !== "production";

  if (skipTrackappAuth && needsAuth) {
    return response;
  }

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

  if (needsAuth && !user && !skipTrackappAuth) {
    if (pathname.startsWith("/api/")) {
      return NextResponse.json(
        { error: "Non autorisé. Connecte-toi pour accéder aux ressources." },
        { status: 401 },
      );
    }

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

  const isPremiumExempt = PREMIUM_EXEMPT_PREFIXES.some(
    (p) => pathname === p || pathname.startsWith(`${p}/`),
  );

  if (needsAuth && user && !skipTrackappAuth && !isPremiumExempt) {
    const { data: profile } = await supabase
      .from("trackapp_profiles")
      .select("plan_unlocked_at")
      .eq("id", user.id)
      .maybeSingle();

    if (!profile?.plan_unlocked_at) {
      if (pathname.startsWith("/api/")) {
        return NextResponse.json({ error: "Abonnement Trackapp requis." }, { status: 402 });
      }

      const payUrl = request.nextUrl.clone();
      payUrl.pathname = "/trackapp/paiement";
      payUrl.search = "";
      const redirectResponse = NextResponse.redirect(payUrl);
      response.cookies.getAll().forEach((cookie) => {
        redirectResponse.cookies.set(cookie);
      });
      return redirectResponse;
    }
  }

  return response;
}

export const config = {
  matcher: [
    "/explorer",
    "/explorer/:path*",
    "/trackapp",
    "/trackapp/:path*",
    "/api/trackapp/ressources/:path*",
    "/api/trackapp/favorites",
    "/api/trackapp/favorites/:path*",
    "/api/trackapp/affiliate",
    "/api/trackapp/affiliate/:path*",
  ],
};
