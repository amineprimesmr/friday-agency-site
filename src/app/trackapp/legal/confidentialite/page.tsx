import Link from "next/link";

export default function ConfidentialiteTrackappPage() {
  return (
    <main className="mx-auto max-w-2xl px-4 py-14 text-[15px] leading-relaxed text-white/68">
      <h1 className="text-3xl font-semibold text-white">Politique de confidentialité</h1>
      <p className="mt-8 text-[13px] text-white/40">
        Version FR courte · version détaillée EN :{" "}
        <Link href="/trackapp/legal/privacy" className="text-violet-300 underline-offset-2 hover:underline">
          Privacy Policy
        </Link>
        .
      </p>
      <ul className="mt-10 list-disc space-y-4 ps-6">
        <li>Identification : données de compte hébergées par Supabase (email, hash mot de passe, métadonnées Trackapp).</li>
        <li>Finalités : authentifier, pré-remplir l&apos;onboarding, suivre votre abonnement Stripe.</li>
        <li>Conservation : liée aux politiques Supabase / Stripe jusqu&apos;à suppression de votre compte.</li>
        <li>
          Données TikTok : échanges serveur-à-serveur (jetons client) pour récupérer du contenu public conformément aux docs
          développeur ; pas de connexion compte TikTok utilisateur requise pour cette fonctionnalité.
        </li>
        <li>Contact RGPD : indiquez ici vos coordonnées dédiées.</li>
      </ul>
      <p className="mt-12 text-[13px] text-white/40">
        <Link href="/trackapp/legal/privacy" className="text-violet-300 underline-offset-2 hover:underline">
          Privacy Policy (EN)
        </Link>
        {" · "}
        <Link href="/trackapp/legal/tiktok-portal" className="text-violet-300 underline-offset-2 hover:underline">
          Textes TikTok à copier
        </Link>
      </p>
    </main>
  );
}
