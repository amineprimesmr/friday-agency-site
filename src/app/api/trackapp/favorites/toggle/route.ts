import { NextResponse } from "next/server";

import { createClient } from "@/lib/supabase/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type Body = { designId?: string };

export async function POST(req: Request) {
  const sb = await createClient();
  if (!sb) {
    return NextResponse.json({ error: "Supabase non configuré." }, { status: 503 });
  }

  const {
    data: { user },
  } = await sb.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Connexion requise." }, { status: 401 });
  }

  let json: Body;
  try {
    json = (await req.json()) as Body;
  } catch {
    return NextResponse.json({ error: "Corps JSON invalide." }, { status: 400 });
  }

  const designId = typeof json.designId === "string" ? json.designId.trim() : "";
  if (!designId) {
    return NextResponse.json({ error: "designId requis." }, { status: 400 });
  }

  const ins = await sb.from("trackapp_profiles").insert({ id: user.id });
  if (ins.error && ins.error.code !== "23505") {
    return NextResponse.json({ error: ins.error.message }, { status: 500 });
  }

  const { data: profile, error: selErr } = await sb
    .from("trackapp_profiles")
    .select("design_favorites")
    .eq("id", user.id)
    .maybeSingle();

  if (selErr) {
    return NextResponse.json({ error: selErr.message }, { status: 500 });
  }

  const raw = profile?.design_favorites;
  const current = Array.isArray(raw) ? raw.filter((x): x is string => typeof x === "string") : [];
  const set = new Set(current);
  if (set.has(designId)) set.delete(designId);
  else set.add(designId);
  const next = [...set];

  const { error: updErr } = await sb
    .from("trackapp_profiles")
    .update({ design_favorites: next, updated_at: new Date().toISOString() })
    .eq("id", user.id);

  if (updErr) {
    return NextResponse.json({ error: updErr.message }, { status: 500 });
  }

  return NextResponse.json({ favorites: next });
}
