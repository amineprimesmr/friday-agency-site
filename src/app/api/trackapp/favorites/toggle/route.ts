import { NextResponse } from "next/server";

import {
  loadProfileFavorites,
  saveProfileFavorites,
  type ProfileFavoritesSnapshot,
} from "@/lib/trackapp-profile-favorites-store";
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

  const current = await loadProfileFavorites(sb, user.id);
  if (current.storageError) {
    return NextResponse.json({ error: current.storageError }, { status: 500 });
  }

  let snapshot: ProfileFavoritesSnapshot = {
    designIds: [...current.designIds],
    appIds: [...current.appIds],
    adsKeys: [...current.adsKeys],
  };

  if (type === "design") {
    const s = new Set(snapshot.designIds);
    if (s.has(designId)) s.delete(designId);
    else s.add(designId);
    snapshot = { ...snapshot, designIds: [...s] };
  } else if (type === "app") {
    const s = new Set(snapshot.appIds);
    if (s.has(appId)) s.delete(appId);
    else s.add(appId);
    snapshot = { ...snapshot, appIds: [...s] };
  } else {
    const s = new Set(snapshot.adsKeys);
    if (s.has(adsKeyRaw)) s.delete(adsKeyRaw);
    else s.add(adsKeyRaw);
    snapshot = { ...snapshot, adsKeys: [...s] };
  }

  const saved = await saveProfileFavorites(sb, user.id, snapshot);
  if (!saved.ok) {
    return NextResponse.json({ error: saved.error }, { status: 500 });
  }

  if (type === "design") {
    return NextResponse.json({ favorites: snapshot.designIds });
  }
  if (type === "app") {
    return NextResponse.json({ appFavorites: snapshot.appIds });
  }
  return NextResponse.json({ adsFavorites: snapshot.adsKeys });
}
