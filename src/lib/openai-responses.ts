/** Extrait le JSON texte d’une réponse OpenAI Responses API (json_schema, web_search, etc.). */
export function extractOpenAiResponseText(data: unknown): string | null {
  if (!data || typeof data !== "object") return null;
  const record = data as Record<string, unknown>;

  if (typeof record.output_text === "string" && record.output_text.trim()) {
    return record.output_text.trim();
  }

  const output = record.output;
  if (!Array.isArray(output)) return null;

  for (const item of output) {
    if (!item || typeof item !== "object") continue;
    const row = item as Record<string, unknown>;

    if (row.type === "message" && Array.isArray(row.content)) {
      for (const part of row.content) {
        if (!part || typeof part !== "object") continue;
        const p = part as Record<string, unknown>;
        if (p.type === "output_text" && typeof p.text === "string" && p.text.trim()) {
          return p.text.trim();
        }
        if (typeof p.text === "string" && p.text.trim()) return p.text.trim();
      }
    }
  }

  return null;
}

/** URLs citées par les appels web_search (Responses API). */
export function extractWebSearchSourceUrls(data: unknown): string[] {
  if (!data || typeof data !== "object") return [];
  const record = data as Record<string, unknown>;
  const urls = new Set<string>();
  const output = record.output;
  if (!Array.isArray(output)) return [];

  for (const item of output) {
    if (!item || typeof item !== "object") continue;
    const row = item as Record<string, unknown>;
    if (row.type !== "web_search_call") continue;
    const action = row.action;
    if (!action || typeof action !== "object") continue;
    const sources = (action as Record<string, unknown>).sources;
    if (!Array.isArray(sources)) continue;
    for (const s of sources) {
      if (!s || typeof s !== "object") continue;
      const url = (s as Record<string, unknown>).url;
      if (typeof url === "string" && /^https:\/\//i.test(url.trim())) {
        urls.add(url.trim());
      }
    }
  }

  return [...urls];
}

export type OpenAiResponsesError = Readonly<{
  status: number;
  message: string;
}>;

export async function readOpenAiResponsesError(response: Response): Promise<OpenAiResponsesError> {
  const status = response.status;
  let message = response.statusText || "OpenAI request failed";
  try {
    const body = (await response.json()) as Record<string, unknown>;
    const err = body.error;
    if (err && typeof err === "object") {
      const e = err as Record<string, unknown>;
      if (typeof e.message === "string") message = e.message;
    } else if (typeof body.message === "string") {
      message = body.message;
    }
  } catch {
    // ignore
  }
  return { status, message };
}
