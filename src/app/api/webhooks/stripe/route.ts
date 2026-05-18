import { NextResponse } from "next/server";
import type Stripe from "stripe";

import {
  processCheckoutSessionCommission,
  processInvoiceCommission,
  reverseCommissionByStripeEvent,
} from "@/lib/trackapp/affiliate/commissions";
import { unlockTrackappFromCheckoutSession, lockTrackappOnSubscriptionEnded } from "@/lib/trackapp/stripe-sync";
import { createAdminClient } from "@/lib/supabase/admin";
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

  const admin = createAdminClient();

  try {
    if (evt.type === "checkout.session.completed") {
      const sess = evt.data.object as Stripe.Checkout.Session;
      await unlockTrackappFromCheckoutSession(sess);
      if (admin) await processCheckoutSessionCommission(admin, sess);
    }

    if (evt.type === "invoice.paid") {
      const invoice = evt.data.object as Stripe.Invoice;
      if (admin) await processInvoiceCommission(admin, invoice);
    }

    if (evt.type === "customer.subscription.deleted") {
      const subscription = evt.data.object as Stripe.Subscription;
      await lockTrackappOnSubscriptionEnded(subscription);
    }

    if (evt.type === "charge.refunded" && admin) {
      const charge = evt.data.object as unknown as Record<string, unknown>;
      const invoiceRef = charge.invoice;
      const invoiceId =
        typeof invoiceRef === "string" ? invoiceRef
        : invoiceRef && typeof invoiceRef === "object" && "id" in invoiceRef
          && typeof (invoiceRef as { id: unknown }).id === "string" ?
          (invoiceRef as { id: string }).id
        : null;
      if (invoiceId) {
        await reverseCommissionByStripeEvent(admin, `invoice:${invoiceId}`);
      }
    }
  } catch (hookErr) {
    console.warn("[stripe-webhook-trackapp]", hookErr);
  }

  return NextResponse.json({ received: true });
}
