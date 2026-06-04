import {
  facebookGraphIdentifierFromUrl,
  resolveFacebookPageNode,
} from "@/lib/meta-page-resolve";

export async function findMetaPageIdFromFacebookUrl(
  facebookUrl: string,
): Promise<{ pageId: string; pageName?: string } | null> {
  const token = process.env.META_AD_LIBRARY_ACCESS_TOKEN?.trim();
  if (!token) return null;

  const identifier = facebookGraphIdentifierFromUrl(facebookUrl);
  if (!identifier) return null;

  const node = await resolveFacebookPageNode(token, identifier);
  if (!node?.id) return null;

  return { pageId: node.id, pageName: node.name };
}
