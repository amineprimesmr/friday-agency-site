"use client";

import dynamic from "next/dynamic";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";

import { useTrackappOnboardingUi } from "@/components/trackapp/onboarding/trackapp-onboarding-ui-context";
import { TrackappOnboardingOverlaySkeleton } from "@/components/trackapp/onboarding/trackapp-onboarding-overlay-skeleton";
import {
  resolveOnboardingReturnHref,
  stripOnboardingOverlayParams,
} from "@/lib/trackapp-onboarding-overlay";
import type { TrackappOnboardingPageProps } from "@/lib/trackapp-onboarding/load-onboarding-page-props";

const TrackappOnboardingFlow = dynamic(
  () =>
    import("@/components/trackapp/onboarding/trackapp-onboarding-flow").then((m) => m.TrackappOnboardingFlow),
  {
    ssr: false,
    loading: () => <TrackappOnboardingOverlaySkeleton />,
  },
);

let bootstrapCache: TrackappOnboardingPageProps | null = null;
let bootstrapInflight: Promise<TrackappOnboardingPageProps> | null = null;

function fetchOnboardingBootstrap(): Promise<TrackappOnboardingPageProps> {
  if (bootstrapCache) return Promise.resolve(bootstrapCache);
  if (bootstrapInflight) return bootstrapInflight;

  bootstrapInflight = fetch("/api/trackapp/onboarding/bootstrap", {
    credentials: "include",
    cache: "no-store",
  })
    .then(async (res) => {
      if (!res.ok) throw new Error("bootstrap_failed");
      return (await res.json()) as TrackappOnboardingPageProps;
    })
    .then((data) => {
      bootstrapCache = data;
      return data;
    })
    .finally(() => {
      bootstrapInflight = null;
    });

  return bootstrapInflight;
}

export function prefetchOnboardingBootstrap(): void {
  if (typeof window === "undefined") return;
  void fetchOnboardingBootstrap().catch(() => {});
}

export function TrackappOnboardingOverlayGate() {
  const router = useRouter();
  const pathname = usePathname() ?? "";
  const searchParams = useSearchParams();
  const { isOpen } = useTrackappOnboardingUi();
  const returnHref = resolveOnboardingReturnHref(searchParams);

  const [props, setProps] = useState<TrackappOnboardingPageProps | null>(() => bootstrapCache);
  const [loadError, setLoadError] = useState(false);
  const openedRef = useRef(false);

  const dismiss = useCallback(() => {
    const nextSearch = stripOnboardingOverlayParams(searchParams.toString());
    router.replace(`${pathname}${nextSearch}`, { scroll: false });
  }, [pathname, router, searchParams]);

  useEffect(() => {
    if (!isOpen) {
      openedRef.current = false;
      return;
    }

    document.body.classList.add("trackapp-onboarding-open");
    return () => document.body.classList.remove("trackapp-onboarding-open");
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") dismiss();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [dismiss, isOpen]);

  useEffect(() => {
    if (!isOpen) return;

    if (props && !openedRef.current) {
      openedRef.current = true;
      return;
    }

    let cancelled = false;
    setLoadError(false);

    void fetchOnboardingBootstrap()
      .then((data) => {
        if (cancelled) return;
        setProps(data);
        openedRef.current = true;
      })
      .catch(() => {
        if (!cancelled) setLoadError(true);
      });

    return () => {
      cancelled = true;
    };
  }, [isOpen, props]);

  if (!isOpen) return null;

  const ready = Boolean(props) && !loadError;

  return (
    <div
      className="ta-onboarding-overlay-host"
      role="presentation"
      aria-hidden={false}
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) dismiss();
      }}
    >
      <div className="ta-onboarding-overlay-host__scrim" aria-hidden />
      <div className="ta-onboarding-overlay-host__dialog" role="dialog" aria-modal="true" aria-label="Onboarding Trackapp">
        {loadError ? (
          <div className="ta-onboarding-overlay-host__error">
            <p>Impossible de charger l&apos;onboarding.</p>
            <button type="button" className="ta-onboarding-overlay-host__retry" onClick={() => {
              bootstrapCache = null;
              setLoadError(false);
              void fetchOnboardingBootstrap().then(setProps).catch(() => setLoadError(true));
            }}>
              Réessayer
            </button>
            <button type="button" className="ta-onboarding-overlay-host__retry ta-onboarding-overlay-host__retry--ghost" onClick={dismiss}>
              Fermer
            </button>
          </div>
        ) : ready && props ? (
          <TrackappOnboardingFlow
            {...props}
            overlay
            returnHref={returnHref}
            onDismiss={dismiss}
          />
        ) : (
          <TrackappOnboardingOverlaySkeleton />
        )}
      </div>
    </div>
  );
}
