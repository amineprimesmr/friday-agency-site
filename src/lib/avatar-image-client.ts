import { readApiJson } from "@/lib/read-api-json";

const POLL_MS = 2000;
const MAX_WAIT_MS = 15 * 60 * 1000;

type StartResponse = {
  jobId?: string;
  imageUrl?: string;
  outputFileId?: string;
  error?: string;
};

type StatusResponse = {
  status: "pending" | "processing" | "succeeded" | "failed";
  imageUrl?: string;
  outputFileId?: string;
  error?: string;
};

export async function requestAvatarImageGeneration(
  prompt: string,
  referenceFileIds: string[],
): Promise<{ imageUrl: string; outputFileId: string | undefined }> {
  const res = await fetch("/api/avatar/generate-image", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ prompt, referenceFileIds }),
  });
  const data = await readApiJson<StartResponse>(res);
  if (!res.ok) {
    throw new Error(data.error ?? `HTTP ${res.status}`);
  }

  if (data.jobId) {
    return pollAvatarImageJobUntilDone(data.jobId);
  }

  if (data.imageUrl) {
    return { imageUrl: data.imageUrl, outputFileId: data.outputFileId };
  }

  throw new Error(data.error ?? "Réponse inattendue du serveur");
}

async function pollAvatarImageJobUntilDone(
  jobId: string,
): Promise<{ imageUrl: string; outputFileId: string | undefined }> {
  await new Promise((r) => setTimeout(r, 350));
  const deadline = Date.now() + MAX_WAIT_MS;
  while (Date.now() < deadline) {
    const r = await fetch(
      `/api/avatar/generate-image/status?id=${encodeURIComponent(jobId)}`,
      { cache: "no-store" },
    );
    const j = await readApiJson<StatusResponse>(r);
    if (!r.ok) {
      throw new Error(j.error ?? `HTTP ${r.status}`);
    }
    if (j.status === "succeeded") {
      if (!j.imageUrl) throw new Error("Job réussi sans image");
      return { imageUrl: j.imageUrl, outputFileId: j.outputFileId };
    }
    if (j.status === "failed") {
      throw new Error(j.error ?? "Génération échouée");
    }
    await new Promise((resolve) => setTimeout(resolve, POLL_MS));
  }
  throw new Error(
    "Délai dépassé (~15 min). La génération est peut‑être encore en cours côté serveur — réessaie ou vérifie Upstash/OpenAI.",
  );
}
