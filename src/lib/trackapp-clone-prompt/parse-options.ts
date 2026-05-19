import type { TrackappCloneAngle, TrackappCloneStack } from "@/lib/trackapp-clone-prompt/types";

const STACKS = new Set<TrackappCloneStack>(["swiftui", "react-native", "expo"]);
const ANGLES = new Set<TrackappCloneAngle>(["inspire", "niche-adjacent", "premium-simple"]);

export function parseCloneStackParam(raw: string | undefined | null): TrackappCloneStack {
  const v = (raw ?? "").trim() as TrackappCloneStack;
  return STACKS.has(v) ? v : "swiftui";
}

export function parseCloneAngleParam(raw: string | undefined | null): TrackappCloneAngle {
  const v = (raw ?? "").trim() as TrackappCloneAngle;
  return ANGLES.has(v) ? v : "inspire";
}
