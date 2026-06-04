import type { SupabaseClient } from "@supabase/supabase-js";

import { ONBOARDING_VERSION, USER_ONBOARDING_KEY } from "@/lib/trackapp-onboarding/keys";
import type {
  OnboardingProfileState,
  TrackappUserOnboardingPayload,
} from "@/lib/trackapp-onboarding/types";

function parsePayload(raw: unknown): TrackappUserOnboardingPayload | null {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) return null;
  const bag = (raw as Record<string, unknown>)[USER_ONBOARDING_KEY];
  if (!bag || typeof bag !== "object" || Array.isArray(bag)) return null;
  const o = bag as Record<string, unknown>;
  if (o.version !== ONBOARDING_VERSION) return null;
  return {
    version: ONBOARDING_VERSION,
    currentStepIndex: typeof o.currentStepIndex === "number" ? o.currentStepIndex : 0,
    answers: (o.answers && typeof o.answers === "object" && !Array.isArray(o.answers) ?
      o.answers
    : {}) as TrackappUserOnboardingPayload["answers"],
    projectMode:
      o.projectMode === "defined" || o.projectMode === "discover" ? o.projectMode : undefined,
    project:
      o.project && typeof o.project === "object" && !Array.isArray(o.project) ?
        {
          name: String((o.project as Record<string, unknown>).name ?? ""),
          goal: (o.project as Record<string, unknown>).goal as string | undefined,
          stage: (o.project as Record<string, unknown>).stage as string | undefined,
        }
      : undefined,
  };
}

function mergePayload(onboarding: unknown, payload: TrackappUserOnboardingPayload): Record<string, unknown> {
  const base =
    onboarding && typeof onboarding === "object" && !Array.isArray(onboarding) ?
      { ...(onboarding as Record<string, unknown>) }
    : {};
  return { ...base, [USER_ONBOARDING_KEY]: payload };
}

export async function loadOnboardingProfile(
  sb: SupabaseClient,
  userId: string,
): Promise<OnboardingProfileState> {
  const { data, error } = await sb
    .from("trackapp_profiles")
    .select("onboarding, onboarding_completed_at")
    .eq("id", userId)
    .maybeSingle();

  if (error || !data) {
    return { completed: false, completedAt: null, payload: null };
  }

  return {
    completed: Boolean(data.onboarding_completed_at),
    completedAt: data.onboarding_completed_at ?? null,
    payload: parsePayload(data.onboarding),
  };
}

export async function saveOnboardingProfile(
  sb: SupabaseClient,
  userId: string,
  payload: TrackappUserOnboardingPayload,
): Promise<{ ok: true } | { ok: false; error: string }> {
  const { data: row } = await sb
    .from("trackapp_profiles")
    .select("onboarding")
    .eq("id", userId)
    .maybeSingle();

  const onboarding = mergePayload(row?.onboarding ?? {}, payload);
  const { error } = await sb
    .from("trackapp_profiles")
    .update({ onboarding, updated_at: new Date().toISOString() })
    .eq("id", userId);

  if (error) return { ok: false, error: error.message };
  return { ok: true };
}

export async function completeOnboardingProfile(
  sb: SupabaseClient,
  userId: string,
  payload: TrackappUserOnboardingPayload,
): Promise<{ ok: true } | { ok: false; error: string }> {
  const { data: row } = await sb
    .from("trackapp_profiles")
    .select("onboarding")
    .eq("id", userId)
    .maybeSingle();

  const onboarding = mergePayload(row?.onboarding ?? {}, payload);
  const now = new Date().toISOString();
  const { error } = await sb
    .from("trackapp_profiles")
    .update({
      onboarding,
      onboarding_completed_at: now,
      updated_at: now,
    })
    .eq("id", userId);

  if (error) return { ok: false, error: error.message };
  return { ok: true };
}
