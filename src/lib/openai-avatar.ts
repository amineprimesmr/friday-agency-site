/**
 * OpenAI Files + image helpers for Avatar Studio (server-only).
 */

export async function openaiUploadBuffer(
  apiKey: string,
  buffer: Buffer,
  filename: string,
  mimeType: string,
): Promise<string> {
  const form = new FormData();
  const bytes = new Uint8Array(buffer);
  form.append("file", new Blob([bytes], { type: mimeType }), filename);
  form.append("purpose", "vision");

  const res = await fetch("https://api.openai.com/v1/files", {
    method: "POST",
    headers: { Authorization: `Bearer ${apiKey}` },
    body: form,
  });

  const text = await res.text();
  if (!res.ok) {
    let msg = res.statusText;
    try {
      msg = (JSON.parse(text) as { error?: { message?: string } }).error?.message ?? msg;
    } catch {
      /* ignore */
    }
    throw new Error(msg);
  }

  const data = JSON.parse(text) as { id: string };
  if (!data.id) throw new Error("No file id from OpenAI upload");
  return data.id;
}

export function extensionForMime(mimeType: string): string {
  if (mimeType === "image/png") return "png";
  if (mimeType === "image/webp") return "webp";
  if (mimeType === "image/gif") return "gif";
  return "jpg";
}

export function extractImageFromOpenAIResponse(text: string): { b64?: string; url?: string } {
  let data: { data?: { url?: string; b64_json?: string }[] };
  try {
    data = JSON.parse(text);
  } catch {
    throw new Error("Invalid JSON from OpenAI: " + text.slice(0, 120));
  }
  const item = data.data?.[0];
  return { b64: item?.b64_json, url: item?.url };
}
