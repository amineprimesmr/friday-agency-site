"use client";

import { usePathname } from "next/navigation";

/** Template sans framer-motion : évite le blocage SWC en dev local sur macOS. */
export default function TrackerTemplate({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div key={pathname} className="contents">
      {children}
    </div>
  );
}
