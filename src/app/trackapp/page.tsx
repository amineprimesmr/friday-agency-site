import Link from "next/link";

import { TrackappLandingHero } from "@/components/trackapp/trackapp-landing-hero";

export default function TrackappLanding() {
  return (
    <>
      <section className="relative overflow-hidden px-4 pb-20 pt-12 sm:pt-16">
        <div
          aria-hidden
          className="pointer-events-none absolute -left-[20%] top-24 h-[28rem] w-[28rem] rounded-full bg-violet-600/14 blur-[100px]"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute -right-[15%] top-48 h-[22rem] w-[22rem] rounded-full bg-fuchsia-500/10 blur-[90px]"
        />
        <div className="relative mx-auto max-w-4xl text-center">
          <p className="text-[11px] font-semibold uppercase tracking-[0.32em] text-violet-300/90">Trackapp</p>
          <h1 className="mt-4 text-balance text-[clamp(2rem,8vw,3.85rem)] font-semibold leading-[1.05] tracking-tight text-white">
            L’extension gratuite évolue.
            <br />
            Ton copilote depuis le Tracker jusqu’aux prompts Xcode.
          </h1>
          <p className="mx-auto mt-6 max-w-xl text-pretty text-[15px] leading-relaxed text-white/52 sm:text-[16px]">
            Onboarding rapide sur iOS · étapes checklist · prompts prêts à coller dans Cursor ou Claude · débloquez la suite
            quand vous êtes prêt.
          </p>
          <TrackappLandingHero />

          <p className="mt-14 text-[11px] font-semibold uppercase tracking-[0.22em] text-white/38">
            Après inscription : environ 10 % du plan visible — le reste en flou avec bouton « Débloquer » via Stripe.
          </p>

          <ul className="mx-auto mt-8 max-w-xl space-y-3 text-left text-[14px] text-white/45">
            <li className="flex gap-2">
              <span className="text-violet-400">●</span>
              <span>Base FR · plateforme cible fixée sur iOS.</span>
            </li>
            <li className="flex gap-2">
              <span className="text-violet-400">●</span>
              <span>
                Flux « Copier une app » : choisis dans le Tracker, puis inscription avec l&apos;app pré-liée.
              </span>
            </li>
            <li className="flex gap-2">
              <span className="text-violet-400">●</span>
              <span>Flux « Commencer » : aucune app à copier — onboarding court.</span>
            </li>
          </ul>
        </div>
      </section>

      <section className="mx-auto max-w-lg px-4 pb-24 text-center text-[13px] text-white/36">
        <p>
          Connexion avec email · Google sera ajouté plus tard.{" "}
          <Link
            href="/trackapp/legal/confidentialite"
            className="text-white/52 underline underline-offset-4 hover:text-white/80"
          >
            Confidentialité
          </Link>
        </p>
      </section>
    </>
  );
}
