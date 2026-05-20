import { NextResponse } from "next/server";

import { createClient } from "@/lib/supabase/server";
import { TRACKAPP_ADS_CHANNELS } from "@/lib/trackapp-ads-channels";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const ALLOWED_ADS = new Set<string>(TRACKAPP_ADS_CHANNELS.map((c) => c.id));

type BodyLegacy = { designId?: string; type?: "design" | "app" | "ads"; appId?: string; adsKey?: string };

function resolveFavoriteType(json: BodyLegacy): "design" | "app" | "ads" {
  if (json.type === "design" || json.type === "app" || json.type === "ads") return json.type;
  if (typeof json.appId === "string" && json.appId.trim()) return "app";
  if (typeof json.adsKey === "string" && json.adsKey.trim()) return "ads";
  return "design";
}

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

  let json: BodyLegacy;
  try {
    json = (await req.json()) as BodyLegacy;
  } catch {
    return NextResponse.json({ error: "Corps JSON invalide." }, { status: 400 });
  }

  const type = resolveFavoriteType(json);

  const designId = typeof json.designId === "string" ? json.designId.trim() : "";
  const appId = typeof json.appId === "string" ? json.appId.trim() : "";
  const adsKeyRaw = typeof json.adsKey === "string" ? json.adsKey.trim() : "";

  if (type === "design" && !designId) {
    return NextResponse.json({ error: "designId requis." }, { status: 400 });
  }
  if (type === "app" && !appId) {
    return NextResponse.json({ error: "appId requis." }, { status: 400 });
  }
  if (type === "ads" && (!adsKeyRaw || !ALLOWED_ADS.has(adsKeyRaw))) {
    return NextResponse.json({ error: "adsKey invalide." }, { status: 400 });
  }

  const ins = await sb.from("trackapp_profiles").insert({ id: user.id });
  if (ins.error && ins.error.code !== "23505") {
    return NextResponse.json({ error: ins.error.message }, { status: 500 });
  }

  const { data: profile, error: selErr } = await sb
    .from("trackapp_profiles")
    .select("design_favorites, app_favorites, ads_favorites")
    .eq("id", user.id)
    .maybeSingle();

  if (selErr) {
    const hint =
      selErr.message.includes("app_favorites") || selErr.message.includes("does not exist")
        ? "Migration Supabase manquante (app_favorites). Exécute les migrations du dossier supabase/migrations."
        : selErr.message;
    return NextResponse.json({ error: hint }, { status: 500 });
  }

  const parseArr = (raw: unknown) =>
    Array.isArray(raw) ? raw.filter((x): x is string => typeof x === "string") : [];

  let design = parseArr(profile?.design_favorites);
  let apps = parseArr(profile?.app_favorites);
  let ads = parseArr(profile?.ads_favorites);

  if (type === "design") {
    const s = new Set(design);
    if (s.has(designId)) s.delete(designId);
    else s.add(designId);
    design = [...s];
  } else if (type === "app") {
    const s = new Set(apps);
    if (s.has(appId)) s.delete(appId);
    else s.add(appId);
    apps = [...s];
  } else {
    const s = new Set(ads);
    if (s.has(adsKeyRaw)) s.delete(adsKeyRaw);
    else s.add(adsKeyRaw);
    ads = [...s];
  }

  const { error: updErr } = await sb
    .from("trackapp_profiles")
    .update({
      design_favorites: design,
      app_favorites: apps,
      ads_favorites: ads,
      updated_at: new Date().toISOString(),
    })
    .eq("id", user.id);

  if (updErr) {
    return NextResponse.json({ error: updErr.message }, { status: 500 });
  }

  if (type === "design") {
    return NextResponse.json({ favorites: design });
  }
  if (type === "app") {
    return NextResponse.json({ appFavorites: apps });
  }
  return NextResponse.json({ adsFavorites: ads });
}
