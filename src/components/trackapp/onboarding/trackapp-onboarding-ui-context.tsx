"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  useTransition,
} from "react";

import { trackappCommencerHref } from "@/lib/trackapp-landing-paths";
import { isOnboardingOverlayOpen } from "@/lib/trackapp-onboarding-overlay";

type OnboardingUiContextValue = Readonly<{
  isOpen: boolean;
  isOpening: boolean;
  openOnboarding: () => void;
}>;

const OnboardingUiContext = createContext<OnboardingUiContextValue | null>(null);

export function TrackappOnboardingUiProvider({ children }: Readonly<{ children: React.ReactNode }>) {
  const router = useRouter();
  const pathname = usePathname() ?? "";
  const searchParams = useSearchParams();
  const [optimisticOpen, setOptimisticOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  const urlOpen = isOnboardingOverlayOpen(searchParams);

  useEffect(() => {
    if (urlOpen) setOptimisticOpen(false);
  }, [urlOpen]);

  const openOnboarding = useCallback(() => {
    if (urlOpen || optimisticOpen) return;
    setOptimisticOpen(true);
    const href = trackappCommencerHref(pathname);
    startTransition(() => {
      router.replace(href, { scroll: false });
    });
  }, [optimisticOpen, pathname, router, urlOpen]);

  const value = useMemo(
    () => ({
      isOpen: urlOpen || optimisticOpen,
      isOpening: optimisticOpen || isPending,
      openOnboarding,
    }),
    [isPending, openOnboarding, optimisticOpen, urlOpen],
  );

  return <OnboardingUiContext.Provider value={value}>{children}</OnboardingUiContext.Provider>;
}

export function useTrackappOnboardingUi(): OnboardingUiContextValue {
  const ctx = useContext(OnboardingUiContext);
  if (!ctx) {
    return {
      isOpen: false,
      isOpening: false,
      openOnboarding: () => {},
    };
  }
  return ctx;
}
