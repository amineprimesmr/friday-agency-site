import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils";

const nav = [
  { href: "/", label: "Accueil" },
  { href: "/explorer", label: "Apps & méthode" },
  { href: "/pricing", label: "Tarifs" },
  { href: "/dashboard", label: "Espace membre" },
];

export function SiteHeader({ email }: { email: string | null }) {
  return (
    <header className="site-header-bar">
      <div className="site-header-bar__inner">
        <div className="site-header-liquid">
          <Link
            href="/"
            className="group flex shrink-0 items-center gap-2 rounded-full py-1 pl-0.5 pr-1 font-semibold tracking-tight text-white focus-visible:outline-none"
          >
            <span className="relative flex h-9 w-9 shrink-0 overflow-hidden rounded-full ring-1 ring-white/25 transition-transform duration-300 group-hover:scale-[1.04]">
              <Image
                src="/assets/logo.png"
                alt="Friday"
                width={36}
                height={36}
                className="h-full w-full object-cover"
                priority
              />
            </span>
            <span className="hidden sm:inline pr-1 text-[0.95rem]">Friday</span>
          </Link>

          <span className="site-header-liquid__divider site-header-liquid__divider--nav" aria-hidden />

          <nav className="site-header-liquid__nav" aria-label="Navigation principale">
            {nav.map((item) => (
              <Link key={item.href} href={item.href} className="site-header-liquid__link">
                {item.label}
              </Link>
            ))}
          </nav>

          <span className="site-header-liquid__divider hidden sm:block" aria-hidden />

          <div className="site-header-liquid__actions">
            {email ? (
              <span className="hidden max-w-[140px] truncate text-[11px] font-medium text-white/50 lg:inline xl:max-w-[200px]">
                {email}
              </span>
            ) : null}
            <Link
              href={email ? "/dashboard" : "/pricing"}
              className={cn(
                email ? "site-header-liquid__cta-glass" : "site-header-liquid__cta-gradient",
                "inline-flex items-center justify-center text-center",
              )}
            >
              {email ? "Tableau de bord" : "Débloquer"}
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
}
