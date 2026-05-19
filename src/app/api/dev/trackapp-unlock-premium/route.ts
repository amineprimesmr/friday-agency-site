import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

import { persistTrackappPremium } from "@/lib/trackapp/stripe-sync";

function isDevUnlockEnabled(): boolean {
  return process.env.NODE_ENV !== "production" || process.env.TRACKAPP_DEV_UNLOCK === "1";
}

/** Débloque plan_unlocked_at pour l'utilisateur connecté (bypass Stripe temporaire). */
export async function POST() {
  if (!isDevUnlockEnabled()) {
    return NextResponse.json({ error: "Bypass dev désactivé." }, { status: 403 });
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnon) {
    return NextResponse.json({ error: "Supabase non configuré." }, { status: 503 });
  }

  const cookieStore = await cookies();
  const supabase = createServerClient(supabaseUrl, supabaseAnon, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll() {
        /* lecture seule */
      },
    },
  });

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user?.id) {
    return NextResponse.json({ error: "Connecte-toi d'abord." }, { status: 401 });
  }

  const ok = await persistTrackappPremium({
    userId: user.id,
    stripeCustomerId: "dev_bypass_customer",
    stripeSubscriptionId: `dev_bypass_${user.id.slice(0, 8)}`,
  });

  if (!ok) {
    return NextResponse.json(
      { error: "SUPABASE_SERVICE_ROLE_KEY manquant : impossible d'activer le premium." },
      { status: 503 },
    );
  }

  return NextResponse.json({ ok: true, redirect: "/trackapp/accueil" });
}
