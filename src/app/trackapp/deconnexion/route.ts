import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

import { createClient } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
  const sb = await createClient();
  if (sb) {
    await sb.auth.signOut();
  }
  const url = request.nextUrl.clone();
  url.pathname = "/trackapp";
  url.search = "";
  return NextResponse.redirect(url);
}
