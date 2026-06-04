import { cn } from "@/lib/utils";

type Props = Readonly<{
  as?: "h1" | "h2";
  id?: string;
  className?: string;
  children: React.ReactNode;
}>;

/** Titre hero landing — dégradé blanc/zinc, typo large (partagé tracker + AppLAB Studio). */
export function TrackerLandingHeroTitle({ as: Tag = "h1", id, className, children }: Props) {
  return (
    <Tag id={id} className={cn("tracker-landing-hero-title", className)}>
      {children}
    </Tag>
  );
}
