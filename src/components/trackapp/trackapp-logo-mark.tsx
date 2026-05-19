import { TRACKAPP_ICON_ALT, TRACKAPP_ICON_SRC } from "@/lib/trackapp-brand";
import { cn } from "@/lib/utils";

const SIZE_PX = {
  xs: 24,
  sm: 28,
  md: 32,
  lg: 52,
} as const;

type TrackappLogoMarkProps = Readonly<{
  size?: keyof typeof SIZE_PX;
  className?: string;
  /** Masque visuellement l’image pour les lecteurs d’écran quand le libellé « Trackapp » est à côté. */
  decorative?: boolean;
}>;

export function TrackappLogoMark({ size = "sm", className, decorative = false }: TrackappLogoMarkProps) {
  const px = SIZE_PX[size];

  return (
    // eslint-disable-next-line @next/next/no-img-element -- asset statique public, tailles fixes par contexte UI
    <img
      src={TRACKAPP_ICON_SRC}
      alt={decorative ? "" : TRACKAPP_ICON_ALT}
      width={px}
      height={px}
      decoding="async"
      className={cn("block shrink-0 object-contain", className)}
      {...(decorative ? { "aria-hidden": true } : {})}
    />
  );
}
