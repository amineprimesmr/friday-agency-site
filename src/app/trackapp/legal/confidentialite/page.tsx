export default function ConfidentialiteTrackappPage() {
  return (
    <main className="mx-auto max-w-2xl px-4 py-14 text-[15px] leading-relaxed text-white/68">
      <h1 className="text-3xl font-semibold text-white">Politique de confidentialité</h1>
      <p className="mt-8 text-[13px] text-white/40">Version provisoire — complétez vos mentions légales et DPA avec Supabase.</p>
      <ul className="mt-10 list-disc space-y-4 ps-6">
        <li>Identification : données de compte hébergées par Supabase (email, hash mot de passe, métadonnées Trackapp).</li>
        <li>Finalités : authentifier, pré-remplir l&apos;onboarding, suivre votre abonnement Stripe.</li>
        <li>Conservation : liée aux politiques Supabase / Stripe jusqu&apos;à suppression de votre compte.</li>
        <li>Contact RGPD : indiquez ici vos coordonnées dédiées.</li>
      </ul>
    </main>
  );
}
