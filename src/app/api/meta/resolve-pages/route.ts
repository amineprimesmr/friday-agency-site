import { NextResponse } from "next/server";
import { resolveMetaPageIdsFromPaste } from "@/lib/meta-resolve-pages-batch";

/** POST /api/meta/resolve-pages { "text": "..." } → Page IDs après résolution Graph (max 10). */
export async function POST(request: Request) {
  const token = process.env.META_AD_LIBRARY_ACCESS_TOKEN?.trim();
  if (!token) {
    return NextResponse.json(
      {
        configured: false,
        error: "META_AD_LIBRARY_ACCESS_TOKEN manquant côté serveur.",
      },
      { status: 503 },
    );
  }

  let body: { text?: string };
  try {
    body = (await request.json()) as { text?: string };
  } catch {
    return NextResponse.json({ error: "JSON invalide" }, { status: 400 });
  }

  const text = typeof body.text === "string" ? body.text : "";
  if (!text.trim()) {
    return NextResponse.json({
      configured: true,
      pageIds: [],
      pageDetails: [],
      failures: [],
      error: "Champ « text » vide.",
    });
  }

  try {
    const result = await resolveMetaPageIdsFromPaste(token, text);
    return NextResponse.json({
      configured: true,
      pageIds: result.pageIds,
      pageDetails: result.pageDetails,
      failures: result.failures,
      error: null,
    });
  } catch {
    return NextResponse.json(
      {
        configured: true,
        error: "Résolution échouée (réessayez avec des IDs ou des URLs Bibliothèque contenant view_all_page_id).",
      },
      { status: 500 },
    );
  }
}
