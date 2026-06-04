import { NextResponse } from "next/server";

import { ensureTrackappProfileRow } from "@/lib/trackapp-profile-favorites-store";
import { createClient } from "@/lib/supabase/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** Crée la ligne `trackapp_profiles` après connexion email (OAuth passe par /trackapp/auth/callback). */
export async function POST() {
  const sb = await createClient();
  if (!sb) {
    return NextResponse.json({ error: "Supabase non configuré." }, { status: 503 });
  }

  const {
    data: { user },
  } = await sb.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Connexion requise." }, { status: 401 });
  }

  const ensured = await ensureTrackappProfileRow(sb, user.id);
  if (!ensured.ok) {
    return NextResponse.json({ error: ensured.error }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
