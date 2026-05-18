/**
 * Proposition structurée renvoyée par Claude dans un bloc ```json ... ```.
 */

export type CarouselConceptDeliveryMode = "carousel" | "short_video";

export interface CarouselConceptSlide {
  index: number;
  role: string;
  onScreenText: string;
  voiceoverHint: string;
  visualDirection: string;
}

export interface CarouselConceptProposal {
  title: string;
  formatId: string;
  deliveryMode: CarouselConceptDeliveryMode;
  aspectRatio: "9:16";
  platform: "tiktok";
  slides: CarouselConceptSlide[];
  hashtags: string[];
  cta: string;
  notes: string;
}

export function parseCarouselProposalFromAssistantText(text: string): CarouselConceptProposal | null {
  const fence = text.match(/```(?:json)?\s*([\s\S]*?)```/i);
  const raw = fence?.[1]?.trim();
  if (!raw) return null;
  try {
    const data = JSON.parse(raw) as Partial<CarouselConceptProposal>;
    if (!data.title || !data.deliveryMode || !Array.isArray(data.slides)) return null;
    return {
      title: String(data.title),
      formatId: String(data.formatId ?? "custom"),
      deliveryMode: data.deliveryMode === "short_video" ? "short_video" : "carousel",
      aspectRatio: "9:16",
      platform: "tiktok",
      slides: data.slides.map((s, i) => ({
        index: typeof s?.index === "number" ? s.index : i + 1,
        role: String(s?.role ?? "body"),
        onScreenText: String(s?.onScreenText ?? ""),
        voiceoverHint: String(s?.voiceoverHint ?? ""),
        visualDirection: String(s?.visualDirection ?? ""),
      })),
      hashtags: Array.isArray(data.hashtags) ? data.hashtags.map(String) : [],
      cta: String(data.cta ?? ""),
      notes: String(data.notes ?? ""),
    };
  } catch {
    return null;
  }
}

export const CAROUSEL_PROPOSAL_JSON_SCHEMA_HINT = `{
  "title": "string — titre interne du concept",
  "formatId": "string — un des ids listés (ex: story_arc, listicle_tips…) ou custom",
  "deliveryMode": "carousel" | "short_video",
  "aspectRatio": "9:16",
  "platform": "tiktok",
  "slides": [
    {
      "index": 1,
      "role": "hook | body | pivot | cta",
      "onScreenText": "texte affiché sur le slide (court)",
      "voiceoverHint": "idée de voix off ou ton (optionnel)",
      "visualDirection": "plan, décor, props — cohérent avatar / lieu"
    }
  ],
  "hashtags": ["#..."],
  "cta": "action demandée au spectateur",
  "notes": "risques légaux, disclosures, ou variantes A/B"
}`;
