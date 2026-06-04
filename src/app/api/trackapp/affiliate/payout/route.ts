import { NextResponse } from "next/server";

import { AFFILIATE_MIN_PAYOUT_CENTS } from "@/lib/trackapp/affiliate/config";
import { requestAffiliatePayout } from "@/lib/trackapp/affiliate/stripe-connect";
import { getTrackappRouteUser } from "@/lib/trackapp/supabase-route";
import { createAdminClient } from "@/lib/supabase/admin";
import { getStripe } from "@/lib/stripe";

const ERROR_MESSAGES: Record<string, string> = {
  connect_required: "Configurez d’abord votre compte bancaire (Stripe Connect).",
  connect_not_ready: "Termine la configuration Stripe pour recevoir des virements.",
  below_minimum: `Solde disponible insuffisant (minimum ${AFFILIATE_MIN_PAYOUT_CENTS / 100} €).`,
  payout_record_failed: "Erreur lors de la préparation du virement.",
};

export async function POST() {
  const user = await getTrackappRouteUser();
  if (!user?.id) {
    return NextResponse.json({ error: "Connexion requise." }, { status: 401 });
  }

  const stripe = getStripe();
  const admin = createAdminClient();
  if (!stripe || !admin) {
    return NextResponse.json({ error: "Service indisponible." }, { status: 503 });
  }

  const result = await requestAffiliatePayout({ stripe, admin, userId: user.id });

  if (!result.ok) {
    const message = ERROR_MESSAGES[result.error] ?? result.error;
    return NextResponse.json({ error: message, code: result.error }, { status: 400 });
  }

  return NextResponse.json({
    ok: true,
    transferId: result.transferId,
    amountCents: result.amountCents,
  });
}
