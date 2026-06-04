import Image from "next/image";

import { TRACKAPP_ICON_SRC } from "@/lib/trackapp-brand";
import type { SaleDemo } from "@/lib/tracker-sale-demo-data";
import { cn } from "@/lib/utils";

export const TRACKER_SALE_NOTIF_ICON_SRC = TRACKAPP_ICON_SRC;

function timeLabel(depth: number): string {
  if (depth === 0) return "maintenant";
  if (depth === 1) return "1 min";
  return `${depth} min`;
}

export function SaleNotificationCard({
  sale,
  depth = 0,
  enterPulse,
  className,
}: Readonly<{
  sale: SaleDemo;
  depth?: number;
  enterPulse?: boolean;
  className?: string;
}>) {
  return (
    <div
      data-depth={String(depth)}
      className={cn(
        "tracker-sale-notif-shell",
        sale.accent,
        enterPulse && depth === 0 && "tracker-sale-notif-shell--enter",
        className,
      )}
    >
      <div className="tracker-sale-notif">
        <div className="tracker-sale-notif-icon-wrap" aria-hidden>
          <Image
            src={TRACKER_SALE_NOTIF_ICON_SRC}
            alt=""
            fill
            className="tracker-sale-notif-icon-img"
            sizes="44px"
            priority={depth === 0}
          />
        </div>
        <div className="tracker-sale-notif-body">
          <div className="tracker-sale-notif-head-row">
            <div className="tracker-sale-notif-head">{sale.brand}</div>
            <span className="tracker-sale-notif-time">{timeLabel(depth)}</span>
          </div>
          <p className="tracker-sale-notif-sub">{sale.line}</p>
        </div>
      </div>
    </div>
  );
}
