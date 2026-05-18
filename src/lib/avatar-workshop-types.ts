export type WorkshopPhase = "intake" | "references" | "creative";

export interface WorkshopSession {
  phase: WorkshopPhase;
  /** Prompt maître anglais pour cohérence visuelle (analyse photo). */
  masterPrompt: string | null;
  /** file_id OpenAI — ordre conservé, dédoublonné. */
  referenceFileIds: string[];
  personaSummary: string;
  nicheSummary: string;
  /** Utilisateur confirme que les refs suffisent (plus d’étape 360 imposée). */
  refsLocked: boolean;
}

export function createInitialWorkshop(): WorkshopSession {
  return {
    phase: "intake",
    masterPrompt: null,
    referenceFileIds: [],
    personaSummary: "",
    nicheSummary: "",
    refsLocked: false,
  };
}

export interface PersistedChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  /** Libellé affiché du type « Claude · … » ou « OpenAI · … » */
  modelLabel?: string;
  attachmentCount?: number;
}

export interface WorkshopSnapshotV2 {
  version: 2;
  workshop: WorkshopSession;
  messages: PersistedChatMessage[];
  /** Dernière image de scène générée (URL data ou http). */
  lastSceneImageUrl: string | null;
  lastScenePresetId: string | null;
  customSceneDescription: string;
  savedAt: number;
}

export function mergeMasterPrompts(previous: string | null, nextChunk: string): string {
  const n = nextChunk.trim();
  if (!n) return previous ?? "";
  if (!previous?.trim()) return n;
  return `${previous.trim()}\n\n---\nRÉFÉRENCE VISUELLE SUPPLÉMENTAIRE (autre prise de vue / angle):\n${n}`;
}
