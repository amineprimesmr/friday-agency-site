import { NextResponse } from "next/server";
import { getStripe } from "@/lib/stripe";

export async function POST(req: Request) {
  const stripe = getStripe();
  if (!stripe) {
    return NextResponse.json(
      { error: "Stripe non configuré. Ajoutez STRIPE_SECRET_KEY dans .env.local." },
      { status: 503 },
    );
  }

  let priceId = process.env.STRIPE_PRICE_ID_MONTHLY ?? "";
  try {
    const body = (await req.json()) as { priceId?: string };
    if (body.priceId) priceId = body.priceId;
  } catch {
    /* ignore */
  }

  if (!priceId) {
    return NextResponse.json(
      {
        error:
          "STRIPE_PRICE_ID_MONTHLY ou priceId manquant. Créez un prix récurrent dans Stripe.",
      },
      { status: 500 },
    );
  }

  const origin =
    process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, "") ?? new URL(req.url).origin;

  const session = await stripe.checkout.sessions.create({
    mode: "subscription",
    line_items: [{ price: priceId, quantity: 1 }],
    success_url: `${origin}/api/auth/callback?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${origin}/pricing`,
    allow_promotion_codes: true,
  });

  if (!session.url) {
    return NextResponse.json({ error: "URL de checkout introuvable." }, { status: 500 });
  }

  return NextResponse.json({ url: session.url });
}
