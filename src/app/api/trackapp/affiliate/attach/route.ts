import { cookies } from "next/headers";
import { NextResponse } from "next/server";

import { AFFILIATE_REF_COOKIE } from "@/lib/trackapp/affiliate/config";
import { attachReferrerIfEligible } from "@/lib/trackapp/affiliate/referral";
import { getTrackappRouteUser } from "@/lib/trackapp/supabase-route";
import { createAdminClient } from "@/lib/supabase/admin";

export async function POST(req: Request) {
  const user = await getTrackappRouteUser();
  if (!user?.id) {
    return NextResponse.json({ error: "Connexion requise." }, { status: 401 });
  }

  const admin = createAdminClient();
  if (!admin) {
    return NextResponse.json({ error: "Service indisponible." }, { status: 503 });
  }

  let referralCode: string | null = null;

  try {
    const body = (await req.json()) as { referralCode?: string };
    if (body.referralCode?.trim()) referralCode = body.referralCode.trim();
  } catch {
    /* body optionnel */
  }

  if (!referralCode) {
    const cookieStore = await cookies();
    referralCode = cookieStore.get(AFFILIATE_REF_COOKIE)?.value?.trim() ?? null;
  }

  if (!referralCode) {
    return NextResponse.json({ ok: false, reason: "no_code" }, { status: 400 });
  }

  const result = await attachReferrerIfEligible(admin, user.id, referralCode);
  if (!result.ok) {
    return NextResponse.json({ ok: false, reason: result.reason }, { status: 409 });
  }

  const response = NextResponse.json({ ok: true });
  response.cookies.set(AFFILIATE_REF_COOKIE, "", { maxAge: 0, path: "/" });
  return response;
}
