import Image from "next/image";

import { cn } from "@/lib/utils";

import "@/styles/tracker-hero-social-proof.css";

/** Portraits réels pour le badge social proof. */
const DEFAULT_AVATAR_SRCS = [
  "/assets/social-proof/avatar-1.png",
  "/assets/social-proof/avatar-2.png",
  "/assets/social-proof/avatar-3.png",
  "/assets/social-proof/avatar-4.png",
] as const;

export type TrackerHeroSocialProofAvatar = {
  src?: string;
  alt?: string;
};

type Props = Readonly<{
  avatars?: TrackerHeroSocialProofAvatar[];
  className?: string;
}>;

export function TrackerHeroSocialProofBadge({ avatars, className }: Props) {
  const slots = Array.from({ length: 4 }, (_, i) => {
    const custom = avatars?.[i];
    return {
      src: custom?.src ?? DEFAULT_AVATAR_SRCS[i],
      alt: custom?.alt ?? "",
    };
  });

  return (
    <p
      className={cn("tracker-hero-social-proof", className)}
      role="status"
      aria-label="Utilisé par plus de 1 384 créateurs d'app iOS"
    >
      <span className="tracker-hero-social-proof__avatars" aria-hidden>
        {slots.map((avatar, i) => (
          <span key={avatar.src} className="tracker-hero-social-proof__avatar">
            <Image
              src={avatar.src}
              alt=""
              fill
              className="object-cover"
              sizes="32px"
            />
          </span>
        ))}
      </span>
      <span className="tracker-hero-social-proof__text">
        Utilisé par <strong>1&nbsp;384+</strong> créateurs d&apos;app iOS
      </span>
    </p>
  );
}
