import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Privacy Policy — Trackapp",
  description: "Privacy Policy for the Trackapp web application.",
};

export default function PrivacyPolicyEnPage() {
  return (
    <main className="mx-auto max-w-2xl px-4 py-14 text-[15px] leading-relaxed text-white/75">
      <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-white/38">Legal</p>
      <h1 className="mt-2 text-3xl font-semibold text-white">Privacy Policy</h1>
      <p className="mt-4 text-[13px] text-white/45">
        Last updated: May 12, 2026 · Draft — align with your final DPA / hosting agreements (Supabase, Stripe).
      </p>

      <section className="mt-10 space-y-4">
        <h2 className="text-lg font-semibold text-white">1. Who we are</h2>
        <p>
          Trackapp (&quot;we&quot;) operates a web application at your configured production domain (for example trackapp.fr).
          This Policy explains how we process personal data when you use the Service.
        </p>
      </section>

      <section className="mt-8 space-y-4">
        <h2 className="text-lg font-semibold text-white">2. Data we collect</h2>
        <ul className="list-disc space-y-2 ps-6">
          <li>
            <strong className="text-white/90">Account data</strong> — email address and authentication metadata processed by
            Supabase when you sign up or sign in.
          </li>
          <li>
            <strong className="text-white/90">Billing data</strong> — handled by Stripe when you purchase a paid plan (we do not
            store full card numbers).
          </li>
          <li>
            <strong className="text-white/90">Usage &amp; technical data</strong> — standard server logs, device/browser
            metadata, and diagnostics needed to operate and secure the Service.
          </li>
          <li>
            <strong className="text-white/90">Third-party API outputs</strong> — aggregated public commercial content we retrieve
            via TikTok Commercial Content / Research APIs (and similar APIs) to display in dashboards. This is generally not your
            personal TikTok profile data.
          </li>
        </ul>
      </section>

      <section className="mt-8 space-y-4">
        <h2 className="text-lg font-semibold text-white">3. Purposes &amp; legal bases (GDPR)</h2>
        <ul className="list-disc space-y-2 ps-6">
          <li>Providing and securing the Service (performance of a contract / legitimate interest).</li>
          <li>Billing and fraud prevention (performance of a contract / legitimate interest).</li>
          <li>Compliance with legal obligations where applicable.</li>
        </ul>
      </section>

      <section className="mt-8 space-y-4">
        <h2 className="text-lg font-semibold text-white">4. TikTok &amp; Meta integrations</h2>
        <p>
          Where enabled, our servers obtain client credentials tokens from TikTok and query Commercial Content / Research
          endpoints server-side. End users do not need to connect their personal TikTok account for this read-only library view.
          Tokens and secrets stay on the server environment (for example Vercel environment variables).
        </p>
      </section>

      <section className="mt-8 space-y-4">
        <h2 className="text-lg font-semibold text-white">5. Processors &amp; transfers</h2>
        <p>
          We rely on subprocessors such as Supabase (authentication/database), Stripe (payments), and hosting providers. Their
          locations and terms govern international transfers; sign DPAs as required for your organization.
        </p>
      </section>

      <section className="mt-8 space-y-4">
        <h2 className="text-lg font-semibold text-white">6. Retention</h2>
        <p>
          We retain account and billing records as needed for legal, tax, and operational purposes, then delete or anonymize when
          no longer necessary.
        </p>
      </section>

      <section className="mt-8 space-y-4">
        <h2 className="text-lg font-semibold text-white">7. Your rights</h2>
        <p>
          Depending on jurisdiction, you may request access, rectification, erasure, restriction, portability, or objection.
          Contact us using the channel published on the production site. You may lodge a complaint with your supervisory authority.
        </p>
      </section>

      <section className="mt-8 space-y-4">
        <h2 className="text-lg font-semibold text-white">8. Children</h2>
        <p>The Service is not directed at children under 16 (or the minimum age in your region).</p>
      </section>

      <section className="mt-8 space-y-4">
        <h2 className="text-lg font-semibold text-white">9. Changes</h2>
        <p>We may update this Policy. Material changes will be indicated by revising the date above.</p>
      </section>

      <section className="mt-8 space-y-4">
        <h2 className="text-lg font-semibold text-white">10. Contact</h2>
        <p>Add your GDPR / privacy contact email and postal details before production marketing.</p>
      </section>

      <p className="mt-12 text-[13px] text-white/40">
        <Link href="/trackapp/legal/terms" className="text-violet-300 underline-offset-2 hover:underline">
          Terms of Service
        </Link>
        {" · "}
        <Link href="/trackapp/legal/confidentialite" className="text-violet-300 underline-offset-2 hover:underline">
          Confidentialité (FR)
        </Link>
      </p>
    </main>
  );
}
