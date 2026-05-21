"use client";

import { TrackappLabTopbar } from "@/components/trackapp/trackapp-lab-topbar";

export function TrackappFidelityTopbar({
  mobileMenuOpen,
  onOpenMobileMenu,
}: Readonly<{
  mobileMenuOpen: boolean;
  onOpenMobileMenu: () => void;
}>) {
  return <TrackappLabTopbar mobileMenuOpen={mobileMenuOpen} onOpenMobileMenu={onOpenMobileMenu} />;
}
