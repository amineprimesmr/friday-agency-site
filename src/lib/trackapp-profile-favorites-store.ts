import type { SupabaseClient } from "@supabase/supabase-js";

import {
  FAVORITES_MIGRATION_HINT,
  isMissingFavoritesColumnError,
  parseFavoriteIdList,
} from "@/lib/trackapp-profile-favorites-parse";

/** Stockage de secours dans `trackapp_profiles.onboarding` si les colonnes SQL ne sont pas migrées. */
export const FAVORITES_ONBOARDING_KEY = "_trackapp_favorites_v1";

export type ProfileFavoritesSnapshot = Readonly<{
  designIds: string[];
  appIds: string[];
  adsKeys: string[];
}>;

export type ProfileFavoritesLoadResult = ProfileFavoritesSnapshot &
  Readonly<{
    storageError: string | null;
    usedOnboardingFallback: boolean;
  }>;

function emptySnapshot(): ProfileFavoritesSnapshot {
  return { designIds: [], appIds: [], adsKeys: [] };
}

function parseOnboardingFavorites(onboarding: unknown): ProfileFavoritesSnapshot {
  if (!onboarding || typeof onboarding !== "object" || Array.isArray(onboarding)) {
    return emptySnapshot();
  }
  const bag = (onboarding as Record<string, unknown>)[FAVORITES_ONBOARDING_KEY];
  if (!bag || typeof bag !== "object" || Array.isArray(bag)) {
    return emptySnapshot();
  }
  const o = bag as Record<string, unknown>;
  return {
    designIds: parseFavoriteIdList(o.design),
    appIds: parseFavoriteIdList(o.app),
    adsKeys: parseFavoriteIdList(o.ads),
  };
}

function mergeOnboardingFavorites(
  onboarding: unknown,
  snapshot: ProfileFavoritesSnapshot,
): Record<string, unknown> {
  const base =
    onboarding && typeof onboarding === "object" && !Array.isArray(onboarding)
      ? { ...(onboarding as Record<string, unknown>) }
      : {};
  return {
    ...base,
    [FAVORITES_ONBOARDING_KEY]: {
      design: snapshot.designIds,
      app: snapshot.appIds,
      ads: snapshot.adsKeys,
    },
  };
}

export async function ensureTrackappProfileRow(
  sb: SupabaseClient,
  userId: string,
): Promise<{ ok: true } | { ok: false; error: string }> {
  const { error } = await sb.from("trackapp_profiles").upsert(
    {
      id: userId,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "id" },
  );
  if (error) return { ok: false, error: error.message };
  return { ok: true };
}

export async function loadProfileFavorites(
  sb: SupabaseClient,
  userId: string,
): Promise<ProfileFavoritesLoadResult> {
  const { data, error } = await sb
    .from("trackapp_profiles")
    .select("design_favorites, app_favorites, ads_favorites, onboarding")
    .eq("id", userId)
    .maybeSingle();

  if (!error) {
    const fromColumns: ProfileFavoritesSnapshot = {
      designIds: parseFavoriteIdList(data?.design_favorites),
      appIds: parseFavoriteIdList(data?.app_favorites),
      adsKeys: parseFavoriteIdList(data?.ads_favorites),
    };
    const fromOnboarding = parseOnboardingFavorites(data?.onboarding);
    const hasColumns =
      fromColumns.designIds.length > 0
      || fromColumns.appIds.length > 0
      || fromColumns.adsKeys.length > 0;
    if (hasColumns) {
      return { ...fromColumns, storageError: null, usedOnboardingFallback: false };
    }
    const hasOnboarding =
      fromOnboarding.designIds.length > 0
      || fromOnboarding.appIds.length > 0
      || fromOnboarding.adsKeys.length > 0;
    if (hasOnboarding) {
      return { ...fromOnboarding, storageError: null, usedOnboardingFallback: true };
    }
    return { ...fromColumns, storageError: null, usedOnboardingFallback: false };
  }

  if (!isMissingFavoritesColumnError(error.message)) {
    return {
      ...emptySnapshot(),
      storageError: error.message,
      usedOnboardingFallback: false,
    };
  }

  const { data: slim, error: slimErr } = await sb
    .from("trackapp_profiles")
    .select("onboarding")
    .eq("id", userId)
    .maybeSingle();

  if (slimErr) {
    return {
      ...emptySnapshot(),
      storageError: FAVORITES_MIGRATION_HINT,
      usedOnboardingFallback: false,
    };
  }

  return {
    ...parseOnboardingFavorites(slim?.onboarding),
    storageError: null,
    usedOnboardingFallback: true,
  };
}

export async function saveProfileFavorites(
  sb: SupabaseClient,
  userId: string,
  snapshot: ProfileFavoritesSnapshot,
): Promise<{ ok: true } | { ok: false; error: string }> {
  const ensured = await ensureTrackappProfileRow(sb, userId);
  if (!ensured.ok) return ensured;

  const { error: colErr } = await sb
    .from("trackapp_profiles")
    .upsert(
      {
        id: userId,
        design_favorites: snapshot.designIds,
        app_favorites: snapshot.appIds,
        ads_favorites: snapshot.adsKeys,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "id" },
    );

  if (!colErr) return { ok: true };

  if (!isMissingFavoritesColumnError(colErr.message)) {
    return { ok: false, error: colErr.message };
  }

  const { data: row, error: readErr } = await sb
    .from("trackapp_profiles")
    .select("onboarding")
    .eq("id", userId)
    .maybeSingle();

  if (readErr) {
    return { ok: false, error: FAVORITES_MIGRATION_HINT };
  }

  const { error: obErr } = await sb
    .from("trackapp_profiles")
    .upsert(
      {
        id: userId,
        onboarding: mergeOnboardingFavorites(row?.onboarding, snapshot),
        updated_at: new Date().toISOString(),
      },
      { onConflict: "id" },
    );

  if (obErr) return { ok: false, error: obErr.message };
  return { ok: true };
}
