import { createServerClient } from "@supabase/ssr";
import { NextRequest, NextResponse } from "next/server";

/**
 * OAuth / magic-link Supabase (PKCE) — à ajouter dans Supabase Redirect URLs :
 * https://trackapp.fr/trackapp/auth/callback
 * https://*.vercel.app/trackapp/auth/callback
 * http://127.0.0.1:3000/trackapp/auth/callback
 */
export async function GET(request: NextRequest) {
  const origin = process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, "") ?? new URL(request.url).origin;
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const nextRaw = url.searchParams.get("next");

  let nextPath = "/trackapp/accueil";
  if (nextRaw?.startsWith("/") && !nextRaw.startsWith("//")) {
    try {
      const pathOnly = decodeURIComponent(nextRaw.split("#")[0]);
      if (pathOnly.startsWith("/trackapp/")) nextPath = pathOnly;
    } catch {
      nextPath = "/trackapp/accueil";
    }
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  const failRedirect = NextResponse.redirect(new URL(`/trackapp/connexion?error=auth_oauth`, origin));

  if (!code || !supabaseUrl || !anon) return failRedirect;

  let response = NextResponse.redirect(new URL(nextPath, origin));

  const supabase = createServerClient(supabaseUrl, anon, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value, options }) => {
          response.cookies.set(name, value, options);
        });
      },
    },
  });

  const { error } = await supabase.auth.exchangeCodeForSession(code);
  if (error) return failRedirect;

  return response;
}
