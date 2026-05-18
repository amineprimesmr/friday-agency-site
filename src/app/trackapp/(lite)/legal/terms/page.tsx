import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Terms of Service — Trackapp",
  description: "Terms of Service for the Trackapp web application.",
};

export default function TermsOfServicePage() {
  return (
    <main className="mx-auto max-w-2xl px-4 py-14 text-[15px] leading-relaxed text-white/75">
      <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-white/38">Legal</p>
      <h1 className="mt-2 text-3xl font-semibold text-white">Terms of Service</h1>
      <p className="mt-4 text-[13px] text-white/45">
        Last updated: May 12, 2026 · Operated from France (EU). Draft for submission purposes — have counsel review before
        relying on these terms in disputes.
      </p>

      <section className="mt-10 space-y-4">
        <h2 className="text-lg font-semibold text-white">1. Agreement</h2>
        <p>
          By accessing or using Trackapp (&quot;Service&quot;), a web application operated by the Trackapp project
          (&quot;we&quot;, &quot;us&quot;), you agree to these Terms. If you disagree, do not use the Service.
        </p>
      </section>

      <section className="mt-8 space-y-4">
        <h2 className="text-lg font-semibold text-white">2. What Trackapp does</h2>
        <p>
          Trackapp provides dashboards and educational tooling related to mobile apps (including publicly available App Store
          information and, where permitted by third-party APIs, aggregated insights about commercial advertising). Features may
          change over time.
        </p>
      </section>

      <section className="mt-8 space-y-4">
        <h2 className="text-lg font-semibold text-white">3. Accounts & eligibility</h2>
        <p>
          Certain areas require registration (e.g. Supabase-powered authentication). You must provide accurate information and
          safeguard your credentials. You are responsible for activity under your account.
        </p>
      </section>

      <section className="mt-8 space-y-4">
        <h2 className="text-lg font-semibold text-white">4. Third-party services &amp; API data</h2>
        <p>
          The Service may query third-party developer APIs (for example TikTok Commercial Content / Research APIs and Meta
          Marketing / Ad Library APIs) strictly under their applicable developer terms. Output depends on platform availability,
          permissions, quotas, and geographic scope. We do not guarantee completeness or accuracy of third-party data.
        </p>
        <p>You must comply with TikTok, Meta, Apple, Stripe, Supabase, and any other integrated providers&apos; policies.</p>
      </section>

      <section className="mt-8 space-y-4">
        <h2 className="text-lg font-semibold text-white">5. Acceptable use</h2>
        <p>You will not misuse the Service: no scraping that violates third-party terms, no unlawful discrimination, no harassment,
          no attempt to bypass rate limits or security, and no redistribution of retrieved content contrary to platform policies.</p>
      </section>

      <section className="mt-8 space-y-4">
        <h2 className="text-lg font-semibold text-white">6. Subscriptions &amp; payments</h2>
        <p>
          Paid features may be billed via Stripe. Fees, taxes, and renewal terms are presented at checkout. Unless required by
          law, payments are non-refundable except as stated at purchase.
        </p>
      </section>

      <section className="mt-8 space-y-4">
        <h2 className="text-lg font-semibold text-white">7. Disclaimers</h2>
        <p>
          The Service is provided &quot;as is&quot;. To the maximum extent permitted by law, we disclaim warranties of
          merchantability, fitness for a particular purpose, and non-infringement. Analytics and estimates are informational only.
        </p>
      </section>

      <section className="mt-8 space-y-4">
        <h2 className="text-lg font-semibold text-white">8. Limitation of liability</h2>
        <p>
          To the maximum extent permitted by law, we are not liable for indirect, incidental, special, consequential, or punitive
          damages, or loss of profits, data, or goodwill. Aggregate liability shall not exceed the greater of €100 or amounts you
          paid us in the twelve months preceding the claim.
        </p>
      </section>

      <section className="mt-8 space-y-4">
        <h2 className="text-lg font-semibold text-white">9. Changes</h2>
        <p>We may update these Terms. Continued use after changes constitutes acceptance of the revised Terms.</p>
      </section>

      <section className="mt-8 space-y-4">
        <h2 className="text-lg font-semibold text-white">10. Contact</h2>
        <p>
          Legal notices: use the contact channel published on your production website footer once finalized (support email /
          company details).
        </p>
      </section>

      <p className="mt-12 text-[13px] text-white/40">
        <Link href="/trackapp/legal/privacy" className="text-violet-300 underline-offset-2 hover:underline">
          Privacy Policy
        </Link>
        {" · "}
        <Link href="/trackapp/legal/cgu" className="text-violet-300 underline-offset-2 hover:underline">
          CGU (FR)
        </Link>
      </p>
    </main>
  );
}
