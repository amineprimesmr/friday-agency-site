/**
 * Brief créateur (questionnaire) — oriente les prompts de scène vers du contenu vertical vidéo.
 */

export interface ContentBriefPersisted {
  personaRole: string;
  nicheTopic: string;
  credibilityNotes: string;
  tone: string;
  platforms: {
    tiktok: boolean;
    reels: boolean;
    shorts: boolean;
  };
  inspirationAccounts: string;
  contentPillars: string;
  topicsToAvoid: string;
}

export function createDefaultContentBrief(): ContentBriefPersisted {
  return {
    personaRole: "",
    nicheTopic: "",
    credibilityNotes: "",
    tone: "expert accessible, punchy sans forcément crier",
    platforms: { tiktok: true, reels: true, shorts: false },
    inspirationAccounts: "",
    contentPillars: "",
    topicsToAvoid: "",
  };
}

export function isContentBriefComplete(b: ContentBriefPersisted | null | undefined): boolean {
  if (!b) return false;
  if (b.personaRole.trim().length < 2 || b.nicheTopic.trim().length < 2) return false;
  if (!b.platforms.tiktok && !b.platforms.reels && !b.platforms.shorts) return false;
  return true;
}
