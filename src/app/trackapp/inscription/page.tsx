import { InscriptionFormWrapper } from "@/components/trackapp/inscription-form";

export default function InscriptionPage() {
  return (
    <main className="mx-auto grid max-w-6xl gap-14 px-4 py-14 lg:grid-cols-[1fr,min(460px)] lg:gap-24 lg:py-22">
      <div className="space-y-5">
        <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-violet-300/85">Création de compte</p>
        <h1 className="text-balance text-4xl font-semibold tracking-tight text-white lg:text-[2.75rem]">
          En moins de 2 minutes avant le playbook.
        </h1>
        <p className="max-w-lg text-[15px] leading-relaxed text-white/52">
          Une fois dedans tu complètes l&apos;onboarding express (sans choix plateforme : tout est iOS) puis tu accèdes à la checklist + prompts avec aperçu gratuit.
        </p>
      </div>
      <InscriptionFormWrapper />
    </main>
  );
}
