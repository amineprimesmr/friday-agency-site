"use client";

import { TrackappLabTopbar } from "@/components/trackapp/trackapp-lab-topbar";

export function TrackappFidelityTopbar(
  props: Readonly<{
    onMenuClick: () => void;
    mobileMenuOpen: boolean;
  }>,
) {
  return <TrackappLabTopbar {...props} />;
}
