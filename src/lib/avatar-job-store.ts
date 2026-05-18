import { Redis } from "@upstash/redis";

const KEY_PREFIX = "avatar:job:";
const TTL_SECONDS = 86_400;

export type AvatarImageJobRecord = {
  status: "pending" | "processing" | "succeeded" | "failed";
  prompt: string;
  referenceFileIds: string[];
  size: string;
  /** low | medium | high | auto — optionnel, sinon env par défaut */
  quality?: string;
  imageUrl?: string;
  outputFileId?: string;
  error?: string;
  createdAt: number;
  updatedAt: number;
};

let redisSingleton: Redis | null = null;
let redisChecked = false;

export function getAvatarJobRedis(): Redis | null {
  if (redisChecked) return redisSingleton;
  redisChecked = true;
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !token) {
    redisSingleton = null;
    return null;
  }
  redisSingleton = new Redis({ url, token });
  return redisSingleton;
}

export function avatarJobKey(jobId: string): string {
  return `${KEY_PREFIX}${jobId}`;
}

export async function saveAvatarJob(jobId: string, job: AvatarImageJobRecord): Promise<void> {
  const redis = getAvatarJobRedis();
  if (!redis) throw new Error("Redis not configured");
  await redis.set(avatarJobKey(jobId), JSON.stringify(job), { ex: TTL_SECONDS });
}

export async function loadAvatarJob(jobId: string): Promise<AvatarImageJobRecord | null> {
  const redis = getAvatarJobRedis();
  if (!redis) return null;
  const raw: unknown = await redis.get(avatarJobKey(jobId));
  if (raw == null) return null;
  if (typeof raw === "string") {
    try {
      return JSON.parse(raw) as AvatarImageJobRecord;
    } catch {
      return null;
    }
  }
  if (typeof raw === "object" && raw !== null && "status" in raw) {
    return raw as AvatarImageJobRecord;
  }
  return null;
}
