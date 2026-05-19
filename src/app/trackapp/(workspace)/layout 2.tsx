/** Styles shell workspace (sidebar, topbar, ~200 Ko) — chargés uniquement pour les routes du groupe, pas pour paiement/légal. */
import "@/styles/fidelity-port/fidelity-app.css";
import "@/styles/fidelity-port/app-desktop-topbar.css";
import "@/styles/fidelity-port/app-saas-shell.css";

export default function TrackappWorkspaceGroupLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return children;
}
