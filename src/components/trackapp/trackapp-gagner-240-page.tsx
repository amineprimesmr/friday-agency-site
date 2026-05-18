"use client";

import Link from "next/link";

import { TrackappAffiliateDashboard } from "@/components/trackapp/trackapp-affiliate-dashboard";

import "@/styles/trackapp-affiliate-dashboard.css";
import "@/styles/trackapp-gagner-240-page.css";

type Props = Readonly<{
  showDashboard?: boolean;
}>;

const CONNEXION_HREF = `/trackapp/connexion?next=${encodeURIComponent("/trackapp/gagner-240")}`;

export function TrackappGagner240Page({ showDashboard = false }: Props) {
  if (!showDashboard) {
    return (
      <div className="trackapp-gagner-240-page">
        <div className="dashboard-main pb-16">
          <section className="dashboard-section text-center">
            <p className="trackapp-workspace-hero-kicker">Affiliation</p>
            <h1 className="trackapp-workspace-hero-title">Dashboard affiliation</h1>
            <p className="trackapp-workspace-hero-desc mx-auto max-w-[46ch]">
              Connecte-toi pour récupérer ton lien de parrainage, offrir −40&nbsp;% sur l&apos;abonnement à ton audience et
              suivre tes commissions.
            </p>
            <div className="mt-8">
              <Link
                href={CONNEXION_HREF}
                className="inline-flex min-h-11 items-center justify-center rounded-full bg-[#0f172a] px-7 text-[0.9rem] font-bold text-white no-underline transition hover:bg-[#111827]"
              >
                Se connecter
              </Link>
            </div>
          </section>
        </div>
      </div>
    );
  }

  return (
    <div className="trackapp-gagner-240-page">
      <div className="dashboard-main pb-16 px-3 sm:px-4">
        <TrackappAffiliateDashboard />
      </div>
    </div>
  );
}
