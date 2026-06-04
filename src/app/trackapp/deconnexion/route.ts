import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

import { TRACKAPP_LANDING_PATH } from "@/lib/trackapp-landing-paths";
import { createClient } from "@/lib/supabase/server";

const PREMIUM_COOKIE = "trackapp_plan_unlocked";

export async function GET(request: NextRequest) {
  const sb = await createClient();
  if (sb) {
    await sb.auth.signOut();
  }
  const url = request.nextUrl.clone();
  url.pathname = TRACKAPP_LANDING_PATH;
  url.search = "";
  const response = NextResponse.redirect(url);
  response.cookies.set(PREMIUM_COOKIE, "", { maxAge: 0, path: "/" });
  return response;
}
