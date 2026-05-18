import {
  createInitialWorkshop,
  type PersistedChatMessage,
  type WorkshopSession,
  type WorkshopSnapshotV2,
} from "@/lib/avatar-workshop-types";

const DB_NAME = "trackapp-avatar-workshop";
const DB_VERSION = 1;
const OSTORE = "snapshot";
const KEY = "v2";

function openDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof indexedDB === "undefined") {
      reject(new Error("indexedDB unavailable"));
      return;
    }
    const req = indexedDB.open(DB_NAME, DB_VERSION);
    req.onerror = () => reject(req.error ?? new Error("idb open"));
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains(OSTORE)) db.createObjectStore(OSTORE);
    };
    req.onsuccess = () => resolve(req.result);
  });
}

function sanitizeSnapshot(raw: unknown): WorkshopSnapshotV2 | null {
  if (!raw || typeof raw !== "object") return null;
  const o = raw as Record<string, unknown>;
  if (o.version !== 2) return null;
  const w = o.workshop as Record<string, unknown> | undefined;
  if (!w || typeof w !== "object") return null;

  const phaseRaw = w.phase;
  const phase =
    phaseRaw === "intake" || phaseRaw === "references" || phaseRaw === "creative"
      ? phaseRaw
      : "intake";

  const workshop: WorkshopSession = {
    phase,
    masterPrompt: typeof w.masterPrompt === "string" ? w.masterPrompt : null,
    referenceFileIds: Array.isArray(w.referenceFileIds)
      ? [...new Set((w.referenceFileIds as unknown[]).filter((x) => typeof x === "string"))]
      : [],
    personaSummary: typeof w.personaSummary === "string" ? w.personaSummary : "",
    nicheSummary: typeof w.nicheSummary === "string" ? w.nicheSummary : "",
    refsLocked: w.refsLocked === true,
  };

  const messages: PersistedChatMessage[] = Array.isArray(o.messages)
    ? (o.messages as unknown[])
        .filter(
          (m) =>
            m &&
            typeof m === "object" &&
            ((m as PersistedChatMessage).role === "user" ||
              (m as PersistedChatMessage).role === "assistant"),
        )
        .map((m) => {
          const p = m as PersistedChatMessage;
          return {
            id:
              typeof p.id === "string" ? p.id : `m-${Date.now()}-${Math.random().toString(36).slice(2)}`,
            role: p.role,
            content: typeof p.content === "string" ? p.content : "",
            modelLabel: typeof p.modelLabel === "string" ? p.modelLabel : undefined,
            attachmentCount: typeof p.attachmentCount === "number" ? p.attachmentCount : undefined,
          };
        })
    : [];

  return {
    version: 2,
    workshop,
    messages,
    lastSceneImageUrl:
      typeof o.lastSceneImageUrl === "string" || o.lastSceneImageUrl === null
        ? (o.lastSceneImageUrl as string | null)
        : null,
    lastScenePresetId:
      typeof o.lastScenePresetId === "string" ? o.lastScenePresetId : null,
    customSceneDescription:
      typeof o.customSceneDescription === "string" ? o.customSceneDescription : "",
    savedAt: typeof o.savedAt === "number" ? o.savedAt : Date.now(),
  };
}

export async function loadWorkshopSnapshot(): Promise<WorkshopSnapshotV2 | null> {
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

export async function saveWorkshopSnapshot(data: WorkshopSnapshotV2): Promise<void> {
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
    console.warn("[workshop] save failed", e);
  }
}

export async function clearWorkshopSnapshot(): Promise<void> {
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

export function defaultSnapshot(): WorkshopSnapshotV2 {
  return {
    version: 2,
    workshop: createInitialWorkshop(),
    messages: [],
    lastSceneImageUrl: null,
    lastScenePresetId: null,
    customSceneDescription: "",
    savedAt: Date.now(),
  };
}
