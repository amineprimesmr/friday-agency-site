import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Marketing Studio — Trackapp",
  description: "Acquisition payante et organique — Ads et contenus sociaux.",
};

export default function TrackappMarketingPage() {
  return (
    <div className="relative z-[1] dashboard-main pb-16">
      <section className="dashboard-section">
        <p className="trackapp-workspace-hero-kicker">Outil Trackapp</p>
        <h1 className="trackapp-workspace-hero-title">Marketing Studio</h1>
      </section>

      <section id="ads" className="dashboard-section scroll-mt-24" aria-labelledby="marketing-ads-heading">
        <h2 id="marketing-ads-heading" className="m-0 text-[1.2rem] font-bold tracking-tight text-[var(--dash-text)]">
          Ads
        </h2>
      </section>

      <section
        id="organique"
        className="dashboard-section scroll-mt-24"
        aria-labelledby="marketing-organique-heading"
      >
        <h2 id="marketing-organique-heading" className="m-0 text-[1.2rem] font-bold tracking-tight text-[var(--dash-text)]">
          Organique
        </h2>
      </section>
    </div>
  );
}
