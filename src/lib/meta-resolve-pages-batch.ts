import {
  facebookGraphIdentifierFromUrl,
  resolveFacebookPageNode,
} from "@/lib/meta-page-resolve";

/** IDs numériques longs (Pages Meta) dans un texte libre. */
function extractLooseNumericFacebookPageIds(text: string): string[] {
  const out: string[] = [];
  const seen = new Set<string>();
  const re = /\b(\d{10,20})\b/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(text)) !== null) {
    const id = m[1]!;
    if (seen.has(id)) continue;
    seen.add(id);
    out.push(id);
    if (out.length >= 10) break;
  }
  return out;
}

async function resolveOneFragment(
  token: string,
  raw: string,
): Promise<{ ok: true; pageId: string; pageName?: string } | { ok: false; fragment: string; reason: string }> {
  const fragment = raw.trim();
  if (!fragment) return { ok: false, fragment: "", reason: "vide" };

  if (/^\d{10,20}$/.test(fragment)) {
    const node = await resolveFacebookPageNode(token, fragment);
    if (node) return { ok: true, pageId: node.id, pageName: node.name };
    return { ok: false, fragment, reason: "ID non reconnu par Graph" };
  }

  let asUrl = fragment;
  if (!/^https?:\/\//i.test(asUrl)) asUrl = `https://${asUrl}`;
  let u: URL;
  try {
    u = new URL(asUrl);
  } catch {
    return { ok: false, fragment, reason: "URL invalide" };
  }

  const view = u.searchParams.get("view_all_page_id")?.trim();
  if (view && /^\d+$/.test(view)) {
    const node = await resolveFacebookPageNode(token, view);
    if (node) return { ok: true, pageId: node.id, pageName: node.name };
    return { ok: false, fragment, reason: "view_all_page_id invalide côté Meta" };
  }

  const graphId = facebookGraphIdentifierFromUrl(u.toString());
  if (!graphId) {
    return { ok: false, fragment, reason: "Pas d’identifiant Meta exploitable (collez une URL avec view_all_page_id ou un @handle Facebook)" };
  }

  const node = await resolveFacebookPageNode(token, graphId);
  if (node) return { ok: true, pageId: node.id, pageName: node.name };

  return {
    ok: false,
    fragment,
    reason:
      "Slug / URL non résolu (nom de page différent sur Facebook vs Instagram — essayez l’URL Bibliothèque avec view_all_page_id)",
  };
}

/**
 * Résout jusqu’à ~10 identifiants depuis un collage utilisateur (URLs Ad Library, IDs, liens fb.com/...).
 */
export async function resolveMetaPageIdsFromPaste(
  token: string,
  pasted: string,
): Promise<{
  pageIds: string[];
  pageDetails: { pageId: string; pageName?: string }[];
  failures: { fragment: string; reason: string }[];
}> {
  const lines = pasted
    .split(/[\r\n,;]+/)
    .map((s) => s.trim())
    .filter(Boolean);

  const seeds = new Set<string>();
  for (const line of lines) {
    seeds.add(line);
    for (const id of extractLooseNumericFacebookPageIds(line)) seeds.add(id);
  }

  const pageDetails: { pageId: string; pageName?: string }[] = [];
  const seen = new Set<string>();
  const failures: { fragment: string; reason: string }[] = [];

  for (const frag of seeds) {
    if (pageDetails.length >= 10) break;
    const result = await resolveOneFragment(token, frag);
    if (result.ok) {
      if (seen.has(result.pageId)) continue;
      seen.add(result.pageId);
      pageDetails.push({ pageId: result.pageId, pageName: result.pageName });
    } else if (result.fragment) {
      failures.push({ fragment: result.fragment, reason: result.reason });
    }
  }

  return {
    pageIds: pageDetails.map((p) => p.pageId),
    pageDetails,
    failures: failures.slice(0, 12),
  };
}
