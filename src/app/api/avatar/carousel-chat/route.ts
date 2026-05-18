import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import type { ContentBriefPersisted } from "@/lib/avatar-content-brief";
import { buildCarouselSystemPrompt } from "@/lib/carousel-claude-prompts";

export const maxDuration = 120;

const MODEL = process.env.ANTHROPIC_CAROUSEL_MODEL?.trim() || "claude-haiku-4-5";

type ChatMessage = { role: "user" | "assistant"; content: string };

const MAX_MESSAGES = 48;
const MAX_MESSAGE_CHARS = 12000;

function sanitizeMessages(raw: unknown): ChatMessage[] | null {
  if (!Array.isArray(raw)) return null;
  const out: ChatMessage[] = [];
  for (const item of raw) {
    if (!item || typeof item !== "object") continue;
    const r = item as Record<string, unknown>;
    if (r.role !== "user" && r.role !== "assistant") continue;
    const content = typeof r.content === "string" ? r.content : "";
    if (!content.trim()) continue;
    out.push({
      role: r.role,
      content: content.slice(0, MAX_MESSAGE_CHARS),
    });
    if (out.length >= MAX_MESSAGES) break;
  }
  if (out.length === 0) return null;
  return out;
}

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as {
      messages?: unknown;
      contentBrief?: ContentBriefPersisted | null;
    };

    const messages = sanitizeMessages(body.messages);
    if (!messages) {
      return NextResponse.json({ error: "messages[] requis (role + content)." }, { status: 400 });
    }

    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: "ANTHROPIC_API_KEY not configured" }, { status: 500 });
    }

    const system = buildCarouselSystemPrompt(body.contentBrief ?? undefined);
    const anthropicMessages = messages.map((m) => ({
      role: m.role as "user" | "assistant",
      content: m.content,
    }));

    const client = new Anthropic({ apiKey });
    const response = await client.messages.create({
      model: MODEL,
      max_tokens: 4096,
      system,
      messages: anthropicMessages,
    });

    const block = response.content[0];
    const text = block?.type === "text" ? block.text.trim() : null;
    if (!text) {
      return NextResponse.json({ error: "Réponse vide du modèle." }, { status: 500 });
    }

    return NextResponse.json({ message: text, model: MODEL });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
