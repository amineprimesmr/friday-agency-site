import { NextResponse } from "next/server";

import {
  checkoutSessionCustomerEmail,
  checkoutSessionPlanLabel,
  isTrackappCheckoutProduct,
  isTrackappCheckoutSessionPaid,
  maskEmail,
} from "@/lib/trackapp/checkout-session";
import { getStripe } from "@/lib/stripe";

/** Vérifie une session Stripe post-paiement (sans auth — l'ID de session sert de jeton). */
export async function GET(req: Request) {
  const url = new URL(req.url);
  const sessionId = url.searchParams.get("session_id")?.trim();

  if (!sessionId) {
    return NextResponse.json({ error: "session_id obligatoire." }, { status: 400 });
  }

  const stripe = getStripe();
  if (!stripe) {
    return NextResponse.json({ error: "Stripe non configuré." }, { status: 503 });
  }

  let session;
  try {
    session = await stripe.checkout.sessions.retrieve(sessionId, {
      expand: ["subscription", "customer"],
    });
  } catch {
    return NextResponse.json({ error: "Session Stripe invalide ou expirée." }, { status: 404 });
  }

  if (!isTrackappCheckoutProduct(session)) {
    return NextResponse.json({ error: "Session Trackapp invalide." }, { status: 403 });
  }

  const paid = isTrackappCheckoutSessionPaid(session);
  const email = checkoutSessionCustomerEmail(session);

  return NextResponse.json({
    paid,
    email,
    email_masked: email ? maskEmail(email) : null,
    plan: checkoutSessionPlanLabel(session),
    already_linked: Boolean(session.metadata?.supabase_user_id?.trim()),
  });
}
