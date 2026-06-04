import { NextResponse } from "next/server";

import { fetchAppDetailCrossRequestCached } from "@/lib/tracker-server-cache";
import { loadProfileFavorites } from "@/lib/trackapp-profile-favorites-store";
import { scanTrackappResources } from "@/lib/trackapp-ressources/scan";
import { createClient } from "@/lib/supabase/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const MAX_SIDEBAR_APPS = 12;
const MAX_SIDEBAR_RESOURCES = 12;

export async function GET() {
  const sb = await createClient();
  if (!sb) {
    return NextResponse.json({ error: "Supabase non configuré." }, { status: 503 });
  }

  const {
    data: { user },
  } = await sb.auth.getUser();
  if (!user) {
    return NextResponse.json({ apps: [], resources: [] });
  }

  const current = await loadProfileFavorites(sb, user.id);
  if (current.storageError) {
    return NextResponse.json({ error: current.storageError }, { status: 500 });
  }

  const appIds = [...current.appIds].reverse().slice(0, MAX_SIDEBAR_APPS);
  const designIds = [...current.designIds].reverse().slice(0, MAX_SIDEBAR_RESOURCES);

  const [appRows, scan] = await Promise.all([
    Promise.all(
      appIds.map(async (id) => {
        const detail = await fetchAppDetailCrossRequestCached(id, "fr");
        if (!detail) return null;
        return {
          id: detail.id,
          name: detail.name,
          artworkUrl: detail.artworkUrl ?? null,
        };
      }),
    ),
    scanTrackappResources(),
  ]);

  const resourceById = new Map(scan.items.map((item) => [item.id, item]));
  const resources = designIds
    .map((id) => {
      const row = resourceById.get(id);
      if (!row) return null;
      return { id: row.id, title: row.title };
    })
    .filter((r): r is NonNullable<typeof r> => r != null);

  return NextResponse.json({
    apps: appRows.filter((r): r is NonNullable<typeof r> => r != null),
    resources,
  });
}
