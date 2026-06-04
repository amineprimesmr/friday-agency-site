import { ONBOARDING_VERSION, USER_ONBOARDING_KEY } from "@/lib/trackapp-onboarding/keys";
import type { TrackappUserOnboardingPayload } from "@/lib/trackapp-onboarding/types";

export const ONBOARDING_DRAFT_STORAGE_KEY = "trackapp-onboarding-draft:v2";

export function readOnboardingDraft(): TrackappUserOnboardingPayload | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(ONBOARDING_DRAFT_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as TrackappUserOnboardingPayload;
    if (parsed?.version !== ONBOARDING_VERSION) return null;
    return parsed;
  } catch {
    return null;
  }
}

export function writeOnboardingDraft(payload: TrackappUserOnboardingPayload): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(ONBOARDING_DRAFT_STORAGE_KEY, JSON.stringify(payload));
  } catch {
    /* quota / private mode */
  }
}

export function clearOnboardingDraft(): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.removeItem(ONBOARDING_DRAFT_STORAGE_KEY);
    localStorage.removeItem(ONBOARDING_COMPLETE_FLAG);
  } catch {
    /* ignore */
  }
}

export const ONBOARDING_COMPLETE_FLAG = "trackapp-onboarding-complete:v1";

export function markOnboardingLocallyComplete(): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(ONBOARDING_COMPLETE_FLAG, "1");
  } catch {
    /* ignore */
  }
}

export function isOnboardingLocallyComplete(): boolean {
  if (typeof window === "undefined") return false;
  try {
    return localStorage.getItem(ONBOARDING_COMPLETE_FLAG) === "1";
  } catch {
    return false;
  }
}

export async function syncOnboardingDraftToProfile(): Promise<void> {
  const draft = readOnboardingDraft();
  if (!draft) return;
  try {
    const res = await fetch("/api/trackapp/profile/onboarding", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ payload: draft, complete: true }),
    });
    if (res.ok) clearOnboardingDraft();
  } catch {
    /* réessai au prochain login */
  }
}

export function hasOnboardingDraft(): boolean {
  return readOnboardingDraft() !== null;
}

/** Export pour sync serveur si besoin (clé jsonb). */
export { USER_ONBOARDING_KEY };
