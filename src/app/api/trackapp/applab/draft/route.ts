import { NextResponse } from "next/server";

import {
  loadApplabDraftFromServer,
  loadApplabPromptVersionsFromServer,
  saveApplabDraftToServer,
  saveApplabPromptVersionToServer,
} from "@/lib/trackapp-applab-create/applab-draft-store";
import type { ApplabCreateDraft } from "@/lib/trackapp-applab-create/types";
import type { ApplabPromptVersion } from "@/lib/trackapp-applab-create/mvp-prompt-types";
import { createClient } from "@/lib/supabase/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function parseDraft(body: unknown): ApplabCreateDraft | null {
  if (!body || typeof body !== "object") return null;
  const o = body as Record<string, unknown>;
  const draft = o.draft;
  if (!draft || typeof draft !== "object") return null;
  return draft as ApplabCreateDraft;
}

export async function GET() {
  const sb = await createClient();
  if (!sb) return NextResponse.json({ error: "Non configuré." }, { status: 503 });

  const {
    data: { user },
  } = await sb.auth.getUser();
  if (!user) return NextResponse.json({ error: "Non autorisé." }, { status: 401 });

  const [draft, versions] = await Promise.all([
    loadApplabDraftFromServer(sb, user.id),
    loadApplabPromptVersionsFromServer(sb, user.id),
  ]);

  return NextResponse.json({ ok: true, draft, versions });
}

export async function PUT(request: Request) {
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

  const draft = parseDraft(json);
  if (!draft) return NextResponse.json({ error: "Draft invalide." }, { status: 400 });

  const result = await saveApplabDraftToServer(sb, user.id, draft);
  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
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

  const version = (json as Record<string, unknown>).version as ApplabPromptVersion | undefined;
  if (!version?.id) {
    return NextResponse.json({ error: "Version invalide." }, { status: 400 });
  }

  const result = await saveApplabPromptVersionToServer(sb, user.id, version);
  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
