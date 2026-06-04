"use client";

import { TrackappLabSidebar } from "@/components/trackapp/trackapp-lab-sidebar";

export function TrackappFidelitySidebar(
  props: Readonly<{
    pathname: string;
    mobileMenuOpen: boolean;
    onNavigate?: () => void;
    email?: string;
    signOutHref?: string;
    loggedIn?: boolean;
    collapsed?: boolean;
    onToggleCollapse?: () => void;
  }>,
) {
  return <TrackappLabSidebar {...props} />;
}
