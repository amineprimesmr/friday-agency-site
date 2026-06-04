"use client";

import Image from "next/image";

import { cn } from "@/lib/utils";

type IconProps = Readonly<{ className?: string }>;

function BrandImageIcon({
  src,
  className,
}: Readonly<{ src: string; className?: string }>) {
  return (
    <span
      className={cn(
        "tracker-hero-social-proof__brand-icon tracker-hero-social-proof__brand-icon--img",
        className,
      )}
    >
      <Image src={src} alt="" width={24} height={24} className="object-cover" unoptimized />
    </span>
  );
}

export function ClaudeIcon({ className }: IconProps) {
  return <BrandImageIcon src="/assets/social-proof/claude.png" className={className} />;
}

export function OpenAiIcon({ className }: IconProps) {
  return <BrandImageIcon src="/assets/social-proof/openai.png" className={className} />;
}

export function PerplexityIcon({ className }: IconProps) {
  return <BrandImageIcon src="/assets/social-proof/perplexity.png" className={className} />;
}

export function CursorIcon({ className }: IconProps) {
  return <BrandImageIcon src="/assets/cursoricon.jpg" className={className} />;
}
