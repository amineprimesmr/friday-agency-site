/**
 * Parse JSON from a fetch Response. Surfaces clear errors when the platform
 * returns HTML/plain text (e.g. Vercel timeout) instead of JSON.
 */
export async function readApiJson<T>(res: Response): Promise<T> {
  const text = await res.text();
  const trimmed = text.trim();
  if (!trimmed) {
    throw new Error(
      `Réponse vide du serveur (HTTP ${res.status}). Souvent un timeout (Vercel) pendant une génération longue — plan Pro ou réessayer.`,
    );
  }
  const first = trimmed[0];
  if (first !== "{" && first !== "[") {
    const preview = trimmed.replace(/\s+/g, " ").slice(0, 180);
    throw new Error(
      `Pas de JSON reçu (HTTP ${res.status}) — souvent coupure / timeout pendant l’appel OpenAI. ` +
        `Extrait : ${preview}${trimmed.length > 180 ? "…" : ""}`,
    );
  }
  try {
    return JSON.parse(text) as T;
  } catch {
    throw new Error(`JSON invalide (HTTP ${res.status}) : ${trimmed.slice(0, 120)}…`);
  }
}
