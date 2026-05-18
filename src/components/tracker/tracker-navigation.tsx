"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  useTransition,
  Suspense,
  type AnchorHTMLAttributes,
  type MouseEvent,
  type ReactNode,
} from "react";
import { usePathname, useSearchParams, useRouter } from "next/navigation";
import { cn } from "@/lib/utils";

const NavCtx = createContext<{ startNav: () => void } | null>(null);

function TrackerTopProgress({ active }: { active: boolean }) {
  if (!active) return null;

  return (
    <div
      className="pointer-events-none fixed inset-x-0 top-0 z-[200] h-1 overflow-hidden"
      role="progressbar"
      aria-valuetext="Chargement de la page"
      aria-busy="true"
    >
      <div className="tracker-top-progress-line h-full w-[40%] rounded-full bg-gradient-to-r from-cyan-400 via-violet-400 to-fuchsia-400 shadow-[0_0_24px_rgba(34,211,238,0.45)]" />
    </div>
  );
}

function TrackerNavigationInner({ children }: { children: ReactNode }) {
  const [active, setActive] = useState(false);
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    setActive(false);
  }, [pathname, searchParams]);

  const startNav = useCallback(() => setActive(true), []);

  return (
    <NavCtx.Provider value={{ startNav }}>
      <TrackerTopProgress active={active} />
      {children}
    </NavCtx.Provider>
  );
}

export function TrackerNavigationProvider({ children }: { children: ReactNode }) {
  return (
    <Suspense fallback={children}>
      <TrackerNavigationInner>{children}</TrackerNavigationInner>
    </Suspense>
  );
}

export type TrackerNavLinkProps = Omit<AnchorHTMLAttributes<HTMLAnchorElement>, "href"> & {
  href: string;
  scroll?: boolean;
  /** Précharge la route au survol (défaut : true). */
  prefetchOnHover?: boolean;
};

/** Déclenche la barre de progression du tracker (même effet qu’un clic sur un `TrackerNavLink`). */
export function useTrackerNavStart() {
  return useContext(NavCtx)?.startNav;
}

export function TrackerNavLink({
  href,
  className,
  children,
  scroll = true,
  prefetchOnHover = true,
  onClick,
  onMouseEnter,
  ...rest
}: TrackerNavLinkProps) {
  const ctx = useContext(NavCtx);
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  const navigate = useCallback(
    (e: MouseEvent<HTMLAnchorElement>) => {
      if (e.defaultPrevented) return;
      if (e.button !== 0) return;
      if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      const t = e.currentTarget.getAttribute("target");
      if (t && t !== "_self") return;
      e.preventDefault();
      ctx?.startNav();
      startTransition(() => {
        router.push(href, { scroll });
      });
    },
    [ctx, href, router, scroll],
  );

  const handleClick = (e: MouseEvent<HTMLAnchorElement>) => {
    onClick?.(e);
    if (e.defaultPrevented) return;
    navigate(e);
  };

  return (
    <a
      href={href}
      onClick={handleClick}
      onMouseEnter={(e) => {
        onMouseEnter?.(e);
        if (prefetchOnHover) void router.prefetch(href);
      }}
      className={cn(
        className,
        pending && "tracker-nav-link-pending",
      )}
      aria-busy={pending || undefined}
      {...rest}
    >
      {children}
    </a>
  );
}
