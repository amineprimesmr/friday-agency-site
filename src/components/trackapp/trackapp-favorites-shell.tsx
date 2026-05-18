import type { ReactNode } from "react";

/** En-tête commun clair, aligné avec le fond workspace Trackapp. */
export function TrackappFavoritesShell({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <div className="relative min-h-[calc(100dvh-6.5rem)] w-full overflow-hidden rounded-[clamp(16px,2vw,22px)] bg-transparent text-[var(--dash-text,#1a202c)]">
      <div
        className="pointer-events-none absolute inset-0 opacity-70"
        aria-hidden
        style={{
          background:
            "radial-gradient(ellipse 85% 65% at 50% 28%, rgba(255,255,255,0.72), transparent 58%), radial-gradient(ellipse 55% 45% at 80% 75%, rgba(226,232,240,0.55), transparent 50%)",
        }}
      />

      <div className="relative z-[1] mx-auto max-w-[1280px] px-6 pb-16 pt-12 sm:px-10 sm:pt-14">
        <header className="text-left">
          <h1 className="text-[clamp(1.75rem,4vw,2.35rem)] font-bold tracking-tight text-[var(--dash-text,#1a202c)]">
            Mes favoris
          </h1>
          <p className="mt-3 max-w-[42rem] text-[1rem] leading-relaxed text-[var(--dash-muted-light,#64748b)] sm:text-[1.05rem]">
            Centralisez ici les designs que vous souhaitez{" "}
            <strong className="font-semibold text-[var(--dash-text,#1a202c)]">garder à portée de main.</strong>
          </p>
        </header>

        {children}
      </div>
    </div>
  );
}
