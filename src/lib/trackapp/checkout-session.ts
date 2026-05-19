import type Stripe from "stripe";

export function resolveTrackappOrigin(): string {
  const originRaw = process.env.NEXT_PUBLIC_APP_URL?.trim();
  if (!originRaw) return "http://127.0.0.1:3000";
  return /^https?:\/\//i.test(originRaw) ?
      originRaw.replace(/\/$/, "")
    : `http://${originRaw.replace(/\/$/, "")}`;
}

export function isTrackappCheckoutSessionPaid(sess: Stripe.Checkout.Session): boolean {
  return (
    sess.payment_status === "paid"
    || sess.payment_status === "no_payment_required"
    || sess.status === "complete"
  );
}

export function isTrackappCheckoutProduct(sess: Stripe.Checkout.Session): boolean {
  return sess.metadata?.product === "trackapp_full_access";
}

export function checkoutSessionCustomerEmail(sess: Stripe.Checkout.Session): string | null {
  const fromDetails =
    typeof sess.customer_details?.email === "string" ? sess.customer_details.email.trim().toLowerCase() : "";
  const fromField = typeof sess.customer_email === "string" ? sess.customer_email.trim().toLowerCase() : "";
  const email = fromDetails || fromField;
  return email.length > 3 && email.includes("@") ? email : null;
}

export function checkoutSessionPlanLabel(sess: Stripe.Checkout.Session): "monthly" | "yearly" {
  const meta = sess.metadata?.trackapp_plan ?? "";
  return meta === "subscription_monthly" ? "monthly" : "yearly";
}

export function maskEmail(email: string): string {
  const [local, domain] = email.split("@");
  if (!local || !domain) return email;
  const visible = local.length <= 2 ? local.slice(0, 1) : `${local.slice(0, 2)}***`;
  return `${visible}@${domain}`;
}

export function emailsMatch(a: string, b: string): boolean {
  return a.trim().toLowerCase() === b.trim().toLowerCase();
}
