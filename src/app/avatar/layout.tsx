import Link from "next/link";

export default function AvatarLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="studio-system-ui min-h-dvh bg-[#080808]">
      <header className="sticky top-0 z-10 border-b border-white/[0.07] bg-[#080808]/92 backdrop-blur-md">
        <nav className="mx-auto flex max-w-6xl items-center gap-1 px-4 py-3 text-xs font-medium sm:text-sm">
          <Link
            href="/avatar"
            className="rounded-lg px-3 py-1.5 text-white/50 transition hover:bg-white/5 hover:text-white/85"
          >
            Studio Avatar
          </Link>
          <span className="text-white/15" aria-hidden>
            /
          </span>
          <Link
            href="/avatar/carousel"
            className="rounded-lg px-3 py-1.5 text-white/50 transition hover:bg-white/5 hover:text-white/85"
          >
            Concept carrousel
          </Link>
          <span className="text-white/15" aria-hidden>
            /
          </span>
          <Link
            href="/studio/image"
            className="rounded-lg px-3 py-1.5 text-white/50 transition hover:bg-white/5 hover:text-white/85"
          >
            Studio image
          </Link>
        </nav>
      </header>
      {children}
    </div>
  );
}
