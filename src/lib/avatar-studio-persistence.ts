import {
  createDefaultContentBrief,
  isContentBriefComplete,
  type ContentBriefPersisted,
} from "@/lib/avatar-content-brief";
import type { ReferenceAngle } from "@/lib/avatar-prompts";

export const AVATAR_STUDIO_SNAPSHOT_VERSION = 1 as const;

/** 1 = brief → 5 = vidéo */
export const AVATAR_STUDIO_STEP_MAX = 5 as const;

/** Aligné sur `PhotoData` côté client (sans champs non sérialisables). */
export interface PhotoDataPersisted {
  masterPrompt: string;
  imageBase64: string;
  mimeType: string;
  referenceFileId: string;
}

export interface SceneDraftPersisted {
  selectedPresetId: string | null;
  customScene: string;
  lighting: string;
  shot: string;
  generatedImages: string[];
  selectedImageUrl: string | null;
  showPrompt: boolean;
}

export interface AvatarStudioSnapshotV1 {
  version: typeof AVATAR_STUDIO_SNAPSHOT_VERSION;
  step: number;
  /** Questionnaire créateur — obligatoire avant la photo (sessions anciennes sans champ → null). */
  contentBrief: ContentBriefPersisted | null;
  photoData: PhotoDataPersisted | null;
  referenceImages: Partial<Record<ReferenceAngle, string>>;
  referenceImageFileIds: Partial<Record<ReferenceAngle, string>>;
  selectedScene: string | null;
  selectedScenePresetId?: string;
  sceneDraft: SceneDraftPersisted;
  savedAt: number;
}

const DB_NAME = "trackapp-avatar-studio";
const DB_VERSION = 1;
const OSTORE = "snapshot";
const KEY = "studio";

export function createDefaultSceneDraft(): SceneDraftPersisted {
  return {
    selectedPresetId: null,
    customScene: "",
    lighting: "Golden hour warm sunlight",
    shot: "Medium shot",
    generatedImages: [],
    selectedImageUrl: null,
    showPrompt: false,
  };
}

function sanitizeContentBrief(raw: unknown): ContentBriefPersisted | null {
  if (!raw || typeof raw !== "object") return null;
  const o = raw as Record<string, unknown>;
  const d = createDefaultContentBrief();
  const pl = o.platforms && typeof o.platforms === "object" ? (o.platforms as Record<string, unknown>) : {};
  return {
    personaRole: typeof o.personaRole === "string" ? o.personaRole : d.personaRole,
    nicheTopic: typeof o.nicheTopic === "string" ? o.nicheTopic : d.nicheTopic,
    credibilityNotes:
      typeof o.credibilityNotes === "string" ? o.credibilityNotes : d.credibilityNotes,
    tone: typeof o.tone === "string" ? o.tone : d.tone,
    platforms: {
      tiktok: pl.tiktok === true,
      reels: pl.reels === true,
      shorts: pl.shorts === true,
    },
    inspirationAccounts:
      typeof o.inspirationAccounts === "string" ? o.inspirationAccounts : d.inspirationAccounts,
    contentPillars: typeof o.contentPillars === "string" ? o.contentPillars : d.contentPillars,
    topicsToAvoid: typeof o.topicsToAvoid === "string" ? o.topicsToAvoid : d.topicsToAvoid,
  };
}

function isPhotoData(x: unknown): x is PhotoDataPersisted {
  if (!x || typeof x !== "object") return false;
  const p = x as Record<string, unknown>;
  return (
    typeof p.masterPrompt === "string" &&
    typeof p.imageBase64 === "string" &&
    typeof p.mimeType === "string" &&
    typeof p.referenceFileId === "string"
  );
}

/** Données brutes versionnées — validées dans sanitizeSnapshot. */
type StoredSnapshotShape = Record<string, unknown> & {
  version: 1;
  step: number;
  sceneDraft: unknown;
};

function isSnapshotShape(x: unknown): x is StoredSnapshotShape {
  if (!x || typeof x !== "object") return false;
  const o = x as Record<string, unknown>;
  return o.version === 1 && typeof o.step === "number" && o.sceneDraft != null && typeof o.sceneDraft === "object";
}

export function sanitizeSnapshot(raw: unknown): AvatarStudioSnapshotV1 | null {
  if (!isSnapshotShape(raw)) return null;
  const photoData = isPhotoData(raw.photoData) ? raw.photoData : null;
  const contentBrief = sanitizeContentBrief(raw.contentBrief);
  const briefOk = isContentBriefComplete(contentBrief);

  let step = raw.step;
  if (step < 1) step = 1;
  if (step > AVATAR_STUDIO_STEP_MAX) step = AVATAR_STUDIO_STEP_MAX;

  if (!briefOk && step > 1) step = 1;
  else if (!photoData && step > 2) step = 2;
  else if (step === 5 && typeof raw.selectedScene !== "string") step = 4;

  const sd = raw.sceneDraft as Record<string, unknown>;
  const sceneDraft: SceneDraftPersisted = {
    ...createDefaultSceneDraft(),
    selectedPresetId:
      sd.selectedPresetId === null || typeof sd.selectedPresetId === "string"
        ? sd.selectedPresetId
        : null,
    customScene: typeof sd.customScene === "string" ? sd.customScene : "",
    lighting: typeof sd.lighting === "string" ? sd.lighting : createDefaultSceneDraft().lighting,
    shot: typeof sd.shot === "string" ? sd.shot : createDefaultSceneDraft().shot,
    generatedImages: Array.isArray(sd.generatedImages) ? (sd.generatedImages as string[]) : [],
    selectedImageUrl:
      sd.selectedImageUrl === null || typeof sd.selectedImageUrl === "string"
        ? sd.selectedImageUrl
        : null,
    showPrompt: typeof sd.showPrompt === "boolean" ? sd.showPrompt : false,
  };
  return {
    version: 1,
    step,
    contentBrief,
    photoData,
    referenceImages:
      raw.referenceImages && typeof raw.referenceImages === "object"
        ? (raw.referenceImages as Partial<Record<ReferenceAngle, string>>)
        : {},
    referenceImageFileIds:
      raw.referenceImageFileIds && typeof raw.referenceImageFileIds === "object"
        ? (raw.referenceImageFileIds as Partial<Record<ReferenceAngle, string>>)
        : {},
    selectedScene:
      typeof raw.selectedScene === "string" || raw.selectedScene === null ? raw.selectedScene : null,
    selectedScenePresetId: typeof raw.selectedScenePresetId === "string" ? raw.selectedScenePresetId : undefined,
    sceneDraft,
    savedAt: typeof raw.savedAt === "number" ? raw.savedAt : Date.now(),
  };
}

function openDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof indexedDB === "undefined") {
      reject(new Error("indexedDB unavailable"));
      return;
    }
    const req = indexedDB.open(DB_NAME, DB_VERSION);
    req.onerror = () => reject(req.error ?? new Error("indexedDB open failed"));
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains(OSTORE)) db.createObjectStore(OSTORE);
    };
    req.onsuccess = () => resolve(req.result);
  });
}

export async function loadAvatarStudioSnapshot(): Promise<AvatarStudioSnapshotV1 | null> {
  try {
    const db = await openDb();
    return await new Promise((resolve, reject) => {
      const tx = db.transaction(OSTORE, "readonly");
      const q = tx.objectStore(OSTORE).get(KEY);
      q.onerror = () => reject(q.error);
      q.onsuccess = () => {
        db.close();
        resolve(sanitizeSnapshot(q.result));
      };
    });
  } catch {
    return null;
  }
}

export async function saveAvatarStudioSnapshot(data: AvatarStudioSnapshotV1): Promise<void> {
  try {
    const db = await openDb();
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction(OSTORE, "readwrite");
      tx.oncomplete = () => {
        db.close();
        resolve();
      };
      tx.onerror = () => reject(tx.error);
      tx.objectStore(OSTORE).put(data, KEY);
    });
  } catch (e) {
    console.warn("[avatar-studio] persistence save failed", e);
  }
}

export async function clearAvatarStudioSnapshot(): Promise<void> {
  try {
    const db = await openDb();
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction(OSTORE, "readwrite");
      tx.oncomplete = () => {
        db.close();
        resolve();
      };
      tx.onerror = () => reject(tx.error);
      tx.objectStore(OSTORE).delete(KEY);
    });
  } catch {
    /* ignore */
  }
}
