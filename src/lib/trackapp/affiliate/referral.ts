import type { SupabaseClient } from "@supabase/supabase-js";

import { AFFILIATE_COMMISSION_RATE } from "@/lib/trackapp/affiliate/config";

export type AffiliateProfileRow = {
  id: string;
  referral_code: string | null;
  referred_by_id: string | null;
  stripe_connect_account_id: string | null;
  affiliate_enrolled_at: string | null;
};

export async function resolveReferrerByCode(
  admin: SupabaseClient,
  code: string,
): Promise<AffiliateProfileRow | null> {
  const normalized = code.trim().toLowerCase();
  if (!normalized || normalized.length < 4) return null;

  const { data } = await admin
    .from("trackapp_profiles")
    .select("id, referral_code, referred_by_id, stripe_connect_account_id, affiliate_enrolled_at")
    .eq("referral_code", normalized)
    .maybeSingle();

  return data ?? null;
}

export async function ensureAffiliateProfile(admin: SupabaseClient, userId: string): Promise<AffiliateProfileRow | null> {
  const { data: existing } = await admin
    .from("trackapp_profiles")
    .select("id, referral_code, referred_by_id, stripe_connect_account_id, affiliate_enrolled_at")
    .eq("id", userId)
    .maybeSingle();

  if (existing?.referral_code) return existing;

  const newCode = crypto.randomUUID().replace(/-/g, "").slice(0, 10).toLowerCase();

  const { data: updated } = await admin
    .from("trackapp_profiles")
    .upsert(
      {
        id: userId,
        referral_code: newCode,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "id" },
    )
    .select("id, referral_code, referred_by_id, stripe_connect_account_id, affiliate_enrolled_at")
    .single();

  return updated ?? null;
}

export async function attachReferrerIfEligible(
  admin: SupabaseClient,
  userId: string,
  referralCode: string,
): Promise<{ ok: boolean; reason?: string }> {
  const referrer = await resolveReferrerByCode(admin, referralCode);
  if (!referrer) return { ok: false, reason: "invalid_code" };
  if (referrer.id === userId) return { ok: false, reason: "self_referral" };

  const { data: profile } = await admin
    .from("trackapp_profiles")
    .select("referred_by_id, plan_unlocked_at")
    .eq("id", userId)
    .maybeSingle();

  if (profile?.referred_by_id) return { ok: false, reason: "already_attached" };
  if (profile?.plan_unlocked_at) return { ok: false, reason: "already_subscriber" };

  await admin
    .from("trackapp_profiles")
    .update({
      referred_by_id: referrer.id,
      updated_at: new Date().toISOString(),
    })
    .eq("id", userId);

  return { ok: true };
}

export async function getReferrerForUser(
  admin: SupabaseClient,
  userId: string,
): Promise<AffiliateProfileRow | null> {
  const { data: profile } = await admin
    .from("trackapp_profiles")
    .select("referred_by_id")
    .eq("id", userId)
    .maybeSingle();

  if (!profile?.referred_by_id) return null;

  const { data: referrer } = await admin
    .from("trackapp_profiles")
    .select("id, referral_code, referred_by_id, stripe_connect_account_id, affiliate_enrolled_at")
    .eq("id", profile.referred_by_id)
    .maybeSingle();

  return referrer ?? null;
}

export function commissionCentsFromGross(grossCents: number): number {
  return Math.floor(grossCents * AFFILIATE_COMMISSION_RATE);
}

export function referralLink(origin: string, code: string): string {
  const base = origin.replace(/\/$/, "");
  return `${base}/trackapp/inscription?ref=${encodeURIComponent(code)}`;
}
