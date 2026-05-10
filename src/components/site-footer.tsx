import Link from "next/link";

export function SiteFooter() {
  return (
    <footer className="border-t border-white/[0.08] bg-black/15 py-12 text-sm text-white/60 backdrop-blur-md supports-[backdrop-filter]:bg-black/10">
      <div className="mx-auto flex max-w-6xl flex-col gap-8 px-4 sm:flex-row sm:items-start sm:justify-between sm:px-6">
        <div className="max-w-sm space-y-3">
          <p className="text-base font-semibold text-white">Friday — agence &amp; méthode</p>
          <p className="leading-relaxed">
            Une même maison : livrer vos apps iOS et sites avec une exigence produit, puis — si vous construisez seul —
            une méthode pour passer du catalogue d’inspiration au ship App&nbsp;Store.
          </p>
        </div>
        <div className="flex flex-wrap gap-8">
          <div className="space-y-2">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-white/40">Navigation</p>
            <ul className="space-y-2">
              <li>
                <Link className="hover:text-white" href="/">
                  Accueil — réalisations
                </Link>
              </li>
              <li>
                <Link className="hover:text-white" href="/explorer">
                  Apps &amp; méthode
                </Link>
              </li>
              <li>
                <Link className="hover:text-white" href="/pricing">
                  Tarifs
                </Link>
              </li>
              <li>
                <Link className="hover:text-white" href="/dashboard">
                  Espace membre
                </Link>
              </li>
            </ul>
          </div>
          <div className="space-y-2">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-white/40">Réseaux</p>
            <ul className="space-y-2">
              <li>
                <Link className="hover:text-white" href="/instagram.html">
                  Instagram
                </Link>
              </li>
            </ul>
          </div>
        </div>
      </div>
      <p className="mx-auto mt-10 max-w-6xl px-4 text-xs text-white/35 sm:px-6">
        Les montants et scores sont indicatifs à des fins éducatives — ils ne constituent pas une garantie de
        performance.
      </p>
    </footer>
  );
}
