import { NextRequest, NextResponse } from "next/server";
import { loadAvatarJob } from "@/lib/avatar-job-store";

export const runtime = "nodejs";

export async function GET(req: NextRequest) {
  const id = req.nextUrl.searchParams.get("id");
  if (!id?.trim()) {
    return NextResponse.json({ error: "id required" }, { status: 400 });
  }

  const job = await loadAvatarJob(id);
  if (!job) {
    return NextResponse.json({ error: "job not found" }, { status: 404 });
  }

  return NextResponse.json({
    status: job.status,
    imageUrl: job.imageUrl,
    outputFileId: job.outputFileId,
    error: job.error,
  });
}
