import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

import { processCheckoutSessionCommission } from "@/lib/trackapp/affiliate/commissions";
import { attachReferrerIfEligible } from "@/lib/trackapp/affiliate/referral";
import {
  checkoutSessionCustomerEmail,
  emailsMatch,
  isTrackappCheckoutProduct,
  isTrackappCheckoutSessionPaid,
} from "@/lib/trackapp/checkout-session";
import { linkCheckoutSessionToUser } from "@/lib/trackapp/stripe-sync";
import { createAdminClient } from "@/lib/supabase/admin";
import { getStripe } from "@/lib/stripe";

type ActivateBody = {
  session_id?: string;
  first_name?: string;
  email?: string;
  password?: string;
};

/** Crée le compte Supabase après paiement Stripe (e-mail confirmé immédiatement). */
export async function POST(req: Request) {
  let body: ActivateBody;
  try {
    body = (await req.json()) as ActivateBody;
  } catch {
    return NextResponse.json({ error: "JSON invalide." }, { status: 400 });
  }

  const sessionId = body.session_id?.trim();
  const firstName = body.first_name?.trim().slice(0, 80) ?? "";
  const email = body.email?.trim().toLowerCase() ?? "";
  const password = body.password ?? "";

  if (!sessionId) {
    return NextResponse.json({ error: "session_id obligatoire." }, { status: 400 });
  }
  if (firstName.length < 2) {
    return NextResponse.json({ error: "Indique ton prénom (2 caractères minimum)." }, { status: 400 });
  }
  if (!email.includes("@") || email.length < 5) {
    return NextResponse.json({ error: "E-mail invalide." }, { status: 400 });
  }
  if (password.length < 8) {
    return NextResponse.json({ error: "Mot de passe : 8 caractères minimum." }, { status: 400 });
  }

  const stripe = getStripe();
  const admin = createAdminClient();

  if (!stripe) {
    return NextResponse.json({ error: "Stripe non configuré." }, { status: 503 });
  }
  if (!admin) {
    return NextResponse.json({ error: "SUPABASE_SERVICE_ROLE_KEY manquant." }, { status: 503 });
  }

  let session;
  try {
    session = await stripe.checkout.sessions.retrieve(sessionId, {
      expand: ["subscription", "customer"],
    });
  } catch {
    return NextResponse.json({ error: "Session Stripe invalide." }, { status: 404 });
  }

  if (!isTrackappCheckoutProduct(session) || !isTrackappCheckoutSessionPaid(session)) {
    return NextResponse.json({ error: "Paiement non confirmé." }, { status: 402 });
  }

  const stripeEmail = checkoutSessionCustomerEmail(session);
  if (stripeEmail && !emailsMatch(stripeEmail, email)) {
    return NextResponse.json(
      { error: `Utilise l'e-mail du paiement : ${stripeEmail}` },
      { status: 400 },
    );
  }

  const { data: created, error: createErr } = await admin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: {
      first_name: firstName,
      full_name: firstName,
    },
  });

  if (createErr || !created.user?.id) {
    const msg = createErr?.message ?? "Impossible de créer le compte.";
    const status = msg.toLowerCase().includes("already") ? 409 : 400;
    return NextResponse.json(
      {
        error:
          status === 409 ?
            "Un compte existe déjà avec cet e-mail. Connecte-toi pour lier ton abonnement."
          : msg,
      },
      { status },
    );
  }

  const userId = created.user.id;

  const link = await linkCheckoutSessionToUser({
    session,
    userId,
    userEmail: email,
  });

  if (!link.ok) {
    await admin.auth.admin.deleteUser(userId).catch(() => {});
    return NextResponse.json({ error: link.error }, { status: 403 });
  }

  const refCode = session.metadata?.referral_code?.trim();
  if (refCode) {
    await attachReferrerIfEligible(admin, userId, refCode);
  }

  await processCheckoutSessionCommission(admin, session);

  return NextResponse.json({ ok: true, email });
}
