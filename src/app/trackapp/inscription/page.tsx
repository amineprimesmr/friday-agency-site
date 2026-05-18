import { InscriptionFormWrapper } from "@/components/trackapp/inscription-form";
import { TrackappDevSaasBypassButton } from "@/components/trackapp/trackapp-dev-saas-bypass";

export default function InscriptionPage() {
  return (
    <main className="mx-auto max-w-6xl px-4 py-14 lg:py-22">
      <div className="grid gap-14 lg:grid-cols-[1fr,min(460px)] lg:gap-24">
        <div className="space-y-5">
          <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-violet-300/85">Création de compte</p>
          <h1 className="text-balance text-4xl font-semibold tracking-tight text-white lg:text-[2.75rem]">
            En moins de 2 minutes avant le playbook.
          </h1>
          <p className="max-w-lg text-[15px] leading-relaxed text-white/52">
            Accès direct au playbook iOS avec prompts prêts à coller après création du compte.
          </p>
        </div>
        <InscriptionFormWrapper />
      </div>
      <div className="mt-16 flex justify-center lg:mt-20">
        <TrackappDevSaasBypassButton />
      </div>
    </main>
  );
}
