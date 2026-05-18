import Link from "next/link";

export default function CguTrackappPage() {
  return (
    <main className="mx-auto max-w-2xl px-4 py-14 text-[15px] leading-relaxed text-white/68">
      <h1 className="text-3xl font-semibold text-white">Conditions générales d&apos;utilisation</h1>
      <p className="mt-8 text-[13px] text-white/40">
        Version FR courte · pour les portails développeurs (TikTok, etc.), utilisez les pages légales{" "}
        <Link href="/trackapp/legal/terms" className="text-violet-300 underline-offset-2 hover:underline">
          EN — Terms
        </Link>
        .
      </p>
      <ul className="mt-10 list-disc space-y-4 ps-6">
        <li>Le service fournit une checklist logicielle éducative (prompts) et ne remplace pas un accompagnement juridique.</li>
        <li>
          Vous conservez vos propres usages vis-à-vis d&apos;Apple, des stores et des licences des apps observées dans le Tracker.
        </li>
        <li>Les souscriptions Stripe font l&apos;objet du contrat de vente défini avec Stripe conformément aux tarifs communiqués.</li>
        <li>
          Des données publiques issues d&apos;API développeur (ex. TikTok Research / Meta Ad Library) peuvent être affichées sous
          réserve des droits accordés par ces plateformes.
        </li>
      </ul>
      <p className="mt-12 text-[13px] text-white/40">
        <Link href="/trackapp/legal/terms" className="text-violet-300 underline-offset-2 hover:underline">
          Terms of Service (EN)
        </Link>
        {" · "}
        <Link href="/trackapp/legal/tiktok-portal" className="text-violet-300 underline-offset-2 hover:underline">
          Textes TikTok à copier
        </Link>
      </p>
    </main>
  );
}
