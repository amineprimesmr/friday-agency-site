import { loadAvatarJob, saveAvatarJob, type AvatarImageJobRecord } from "@/lib/avatar-job-store";
import { runAvatarImageGeneration } from "@/lib/avatar-openai-generate";

export async function processAvatarImageJob(jobId: string): Promise<void> {
  const existing = await loadAvatarJob(jobId);
  if (!existing) return;
  if (existing.status !== "pending") return;

  const processing: AvatarImageJobRecord = {
    ...existing,
    status: "processing",
    updatedAt: Date.now(),
  };
  await saveAvatarJob(jobId, processing);

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    await saveAvatarJob(jobId, {
      ...processing,
      status: "failed",
      error: "OPENAI_API_KEY not configured",
      updatedAt: Date.now(),
    });
    return;
  }

  try {
    const result = await runAvatarImageGeneration({
      prompt: processing.prompt,
      size: processing.size,
      referenceFileIds: processing.referenceFileIds,
      apiKey,
      quality: processing.quality,
    });
    await saveAvatarJob(jobId, {
      ...processing,
      status: "succeeded",
      imageUrl: result.imageUrl,
      outputFileId: result.outputFileId,
      updatedAt: Date.now(),
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    await saveAvatarJob(jobId, {
      ...processing,
      status: "failed",
      error: message,
      updatedAt: Date.now(),
    });
  }
}
