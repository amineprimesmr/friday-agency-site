import { NextResponse } from "next/server";

import {
  createConnectOnboardingLink,
  getOrCreateConnectAccount,
  stripeConnectConfigured,
} from "@/lib/trackapp/affiliate/stripe-connect";
import { appOriginFromEnv, getTrackappRouteUser } from "@/lib/trackapp/supabase-route";
import { createAdminClient } from "@/lib/supabase/admin";
import { getStripe } from "@/lib/stripe";

export async function POST() {
  const user = await getTrackappRouteUser();
  if (!user?.email) {
    return NextResponse.json({ error: "Connexion requise." }, { status: 401 });
  }

  if (!stripeConnectConfigured()) {
    return NextResponse.json({ error: "Stripe non configuré." }, { status: 503 });
  }

  const stripe = getStripe();
  const admin = createAdminClient();
  if (!stripe || !admin) {
    return NextResponse.json({ error: "Service indisponible." }, { status: 503 });
  }

  const accountId = await getOrCreateConnectAccount(stripe, admin, user.id, user.email);
  if (!accountId) {
    return NextResponse.json({ error: "Impossible de créer le compte Connect." }, { status: 500 });
  }

  const url = await createConnectOnboardingLink(stripe, accountId, appOriginFromEnv());
  return NextResponse.json({ url });
}
