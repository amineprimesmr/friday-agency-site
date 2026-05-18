import Link from "next/link";
import { AvatarWorkshop } from "@/components/avatar/avatar-workshop";

export const metadata = {
  title: "Atelier Avatar — Trackapp",
  description:
    "Crée ton avatar avec Claude, verrouille tes références et génère scènes & vidéos.",
};

export default function AvatarPage() {
  return (
    <main>
      <div className="border-b border-white/[0.06] bg-white/[0.02]">
        <div className="mx-auto flex max-w-6xl justify-end px-4 py-1.5">
          <Link
            href="/avatar/carousel"
            className="text-xs font-medium text-violet-400/90 transition hover:text-violet-300"
          >
            Atelier concept carrousel →
          </Link>
        </div>
      </div>
      <AvatarWorkshop />
    </main>
  );
}
