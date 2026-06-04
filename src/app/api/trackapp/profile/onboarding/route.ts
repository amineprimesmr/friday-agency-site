import { NextResponse } from "next/server";

import { ONBOARDING_VERSION } from "@/lib/trackapp-onboarding/keys";
import {
  completeOnboardingProfile,
  loadOnboardingProfile,
  saveOnboardingProfile,
} from "@/lib/trackapp-onboarding/profile-store";
import type { TrackappUserOnboardingPayload } from "@/lib/trackapp-onboarding/types";
import { createClient } from "@/lib/supabase/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function parsePayload(body: unknown): TrackappUserOnboardingPayload | null {
  if (!body || typeof body !== "object") return null;
  const o = body as Record<string, unknown>;
  const payload = o.payload;
  if (!payload || typeof payload !== "object" || Array.isArray(payload)) return null;
  const p = payload as Record<string, unknown>;
  if (p.version !== ONBOARDING_VERSION) return null;
  return payload as TrackappUserOnboardingPayload;
}

export async function GET() {
  const sb = await createClient();
  if (!sb) return NextResponse.json({ error: "Non configuré." }, { status: 503 });

  const {
    data: { user },
  } = await sb.auth.getUser();
  if (!user) return NextResponse.json({ error: "Non autorisé." }, { status: 401 });

  const state = await loadOnboardingProfile(sb, user.id);
  return NextResponse.json({ ok: true, ...state });
}

export async function POST(request: Request) {
  const sb = await createClient();
  if (!sb) return NextResponse.json({ error: "Non configuré." }, { status: 503 });

  const {
    data: { user },
  } = await sb.auth.getUser();
  if (!user) return NextResponse.json({ error: "Non autorisé." }, { status: 401 });

  let json: unknown;
  try {
    json = await request.json();
  } catch {
    return NextResponse.json({ error: "JSON invalide." }, { status: 400 });
  }

  const payload = parsePayload(json);
  if (!payload) return NextResponse.json({ error: "Payload onboarding invalide." }, { status: 400 });

  const complete = Boolean((json as Record<string, unknown>).complete);
  const result =
    complete ?
      await completeOnboardingProfile(sb, user.id, payload)
    : await saveOnboardingProfile(sb, user.id, payload);

  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: 500 });
  }

  return NextResponse.json({ ok: true, completed: complete });
}
