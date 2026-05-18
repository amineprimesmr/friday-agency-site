import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { SERVER_STUDIO_MODEL } from "@/lib/avatar-ai-models";
import { buildStudioSystemPrompt } from "@/lib/studio-system-prompt";
import type { WorkshopSession } from "@/lib/avatar-workshop-types";

export const maxDuration = 120;

type HistoryTurn = { role: "user" | "assistant"; content: string };

type ImagePart = { base64: string; mediaType: string };

function sanitizeWorkshop(raw: unknown): WorkshopSession | null {
  if (!raw || typeof raw !== "object") return null;
  const w = raw as Record<string, unknown>;
  const phase =
    w.phase === "intake" || w.phase === "references" || w.phase === "creative"
      ? w.phase
      : "intake";
  return {
    phase,
    masterPrompt: typeof w.masterPrompt === "string" ? w.masterPrompt : null,
    referenceFileIds: Array.isArray(w.referenceFileIds)
      ? [...new Set((w.referenceFileIds as unknown[]).filter((x) => typeof x === "string"))]
      : [],
    personaSummary: typeof w.personaSummary === "string" ? w.personaSummary : "",
    nicheSummary: typeof w.nicheSummary === "string" ? w.nicheSummary : "",
    refsLocked: w.refsLocked === true,
  };
}

function sanitizeHistory(raw: unknown): HistoryTurn[] {
  if (!Array.isArray(raw)) return [];
  const out: HistoryTurn[] = [];
  for (const item of raw) {
    if (!item || typeof item !== "object") continue;
    const o = item as Record<string, unknown>;
    if (o.role !== "user" && o.role !== "assistant") continue;
    const c = typeof o.content === "string" ? o.content : "";
    if (!c.trim()) continue;
    out.push({ role: o.role, content: c.slice(0, 14_000) });
    if (out.length >= 24) break;
  }
  return out;
}

function sanitizeImages(raw: unknown): ImagePart[] {
  if (!Array.isArray(raw)) return [];
  const out: ImagePart[] = [];
  for (const item of raw) {
    if (!item || typeof item !== "object") continue;
    const o = item as Record<string, unknown>;
    const b64 = typeof o.base64 === "string" ? o.base64 : "";
    const mt = typeof o.mediaType === "string" ? o.mediaType : "image/jpeg";
    if (!b64.trim()) continue;
    out.push({ base64: b64.slice(0, 10_000_000), mediaType: mt });
    if (out.length >= 6) break;
  }
  return out;
}

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as {
      workshop?: unknown;
      history?: unknown;
      userText?: unknown;
      userImages?: unknown;
      sessionStart?: unknown;
    };

    const workshop = sanitizeWorkshop(body.workshop);
    if (!workshop) {
      return NextResponse.json({ error: "workshop invalide" }, { status: 400 });
    }

    const history = sanitizeHistory(body.history);
    const userText =
      typeof body.userText === "string" ? body.userText.slice(0, 14_000) : "";
    const userImages = sanitizeImages(body.userImages);
    const sessionStart = body.sessionStart === true;

    if (!sessionStart && !userText.trim() && userImages.length === 0) {
      return NextResponse.json({ error: "message ou image requis" }, { status: 400 });
    }

    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: "ANTHROPIC_API_KEY not configured" }, { status: 500 });
    }

    const system = buildStudioSystemPrompt(workshop);
    const client = new Anthropic({ apiKey });

    const starter =
      sessionStart || (!userText.trim() && userImages.length === 0)
        ? "L'utilisateur vient de cliquer sur « Créer mon avatar ». Accueille-le brièvement sans Markdown (pas d'étoiles, pas de #). Pose une ou deux premières questions simples pour savoir qui il est face caméra et sur quel sujet il veut poster (TikTok, Reels, Shorts)."
        : userText.trim() ||
          "(Photos jointes — décris ce que tu vois et guide sur la cohérence d'identité, sans Markdown dans ta réponse.)";

    const userContentBlocks: Anthropic.ContentBlockParam[] = [];

    for (const img of userImages) {
      const mt = img.mediaType as "image/jpeg" | "image/png" | "image/gif" | "image/webp";
      userContentBlocks.push({
        type: "image",
        source: { type: "base64", media_type: mt, data: img.base64 },
      });
    }
    userContentBlocks.push({ type: "text", text: starter });

    const apiMessages: Anthropic.MessageParam[] = [
      ...history.map((h) => ({
        role: h.role,
        content: h.content,
      })),
      { role: "user" as const, content: userContentBlocks },
    ];

    const response = await client.messages.create({
      model: SERVER_STUDIO_MODEL,
      max_tokens: 4096,
      system,
      messages: apiMessages,
    });

    const block = response.content[0];
    const text = block?.type === "text" ? block.text.trim() : null;
    if (!text) {
      return NextResponse.json({ error: "Réponse vide" }, { status: 500 });
    }

    return NextResponse.json({
      message: text,
      model: SERVER_STUDIO_MODEL,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
