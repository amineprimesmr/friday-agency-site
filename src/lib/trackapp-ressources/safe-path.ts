import path from "node:path";

/**
 * Interdit les traversées ; le fichier doit être un segment strict (pas de sous-dossiers).
 */
export function resolveSafeResourceFile(baseDir: string, filename: string): string | null {
  const trimmed = filename.trim();
  if (!trimmed || trimmed.includes("..") || trimmed.includes("/") || trimmed.includes("\\")) {
    return null;
  }
  const normalizedBase = path.resolve(baseDir) + path.sep;
  const resolved = path.resolve(baseDir, trimmed);
  if (!resolved.startsWith(normalizedBase)) return null;
  if (path.basename(resolved) !== trimmed) return null;
  return resolved;
}
