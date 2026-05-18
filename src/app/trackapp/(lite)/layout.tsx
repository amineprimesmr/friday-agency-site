/** Paiement, auth, pages légales : styles dédiés sans charger fidelity-app.css. */
import "@/styles/trackapp-auth-modal.css";
import "@/styles/trackapp-saas-pro-payment-page.css";
import "@/styles/trackapp-paiement-landing.css";

export default function TrackappLiteGroupLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return children;
}
