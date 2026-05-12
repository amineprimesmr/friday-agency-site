import { NextResponse } from "next/server";
import type Stripe from "stripe";

import {
  isTrackappPaidCheckoutSession,
  unlockTrackappFromCheckoutSession,
  lockTrackappOnSubscriptionEnded,
} from "@/lib/trackapp/stripe-sync";
import { getStripe } from "@/lib/stripe";

export async function POST(req: Request) {
  const stripe = getStripe();
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!stripe || !secret) {
    return NextResponse.json({ received: true });
  }

  const signature = req.headers.get("stripe-signature");
  const payload = await req.text();

  if (!signature) {
    return NextResponse.json({ error: "Missing signature" }, { status: 400 });
  }

  let evt: Stripe.Event;

  try {
    evt = stripe.webhooks.constructEvent(payload, signature, secret);
  } catch {
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  try {
    if (evt.type === "checkout.session.completed") {
      const sess = evt.data.object as Stripe.Checkout.Session;
      const unlocked = await unlockTrackappFromCheckoutSession(sess);
      if (isTrackappPaidCheckoutSession(sess) && !unlocked) {
        throw new Error(`Unable to unlock Trackapp checkout session ${sess.id}`);
      }
    }

    if (evt.type === "customer.subscription.deleted") {
      const subscription = evt.data.object as Stripe.Subscription;
      await lockTrackappOnSubscriptionEnded(subscription);
    }
  } catch (hookErr) {
    console.warn("[stripe-webhook-trackapp]", hookErr);
    return NextResponse.json({ error: "Webhook processing failed" }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}
