import { waitUntil } from "@vercel/functions";
import { randomUUID } from "crypto";
import { NextRequest, NextResponse } from "next/server";
import { processAvatarImageJob } from "@/lib/avatar-job-processor";
import { getAvatarJobRedis, saveAvatarJob, type AvatarImageJobRecord } from "@/lib/avatar-job-store";
import { DEFAULT_AVATAR_IMAGE_SIZE, runAvatarImageGeneration } from "@/lib/avatar-openai-generate";

/** Full worker budget after quick JSON response (Fluid / Pro typical). */
export const maxDuration = 300;
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as {
      prompt?: string;
      referenceFileIds?: string[];
      size?: string;
      quality?: string;
    };
    const prompt = body.prompt;
    const size = body.size ?? DEFAULT_AVATAR_IMAGE_SIZE;
    const referenceFileIds = body.referenceFileIds?.filter(Boolean) ?? [];
    const quality =
      typeof body.quality === "string" && body.quality.trim()
        ? body.quality.trim().toLowerCase()
        : undefined;

    if (!prompt) {
      return NextResponse.json({ error: "prompt required" }, { status: 400 });
    }

    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: "OPENAI_API_KEY not configured" }, { status: 500 });
    }

    const redis = getAvatarJobRedis();
    if (redis) {
      const jobId = randomUUID();
      const job: AvatarImageJobRecord = {
        status: "pending",
        prompt,
        referenceFileIds,
        size,
        ...(quality ? { quality } : {}),
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };
      await saveAvatarJob(jobId, job);
      waitUntil(
        processAvatarImageJob(jobId).catch((e) => {
          console.error("[avatar-job]", jobId, e);
        }),
      );
      return NextResponse.json({ jobId });
    }

    const result = await runAvatarImageGeneration({
      prompt,
      size,
      referenceFileIds,
      apiKey,
      quality: quality ?? null,
    });
    return NextResponse.json({
      imageUrl: result.imageUrl,
      outputFileId: result.outputFileId,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
