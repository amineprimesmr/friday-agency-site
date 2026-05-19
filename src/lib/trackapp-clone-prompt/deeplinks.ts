/** Limites documentées Cursor / Claude Code (caractères du paramètre prompt, pas URL totale). */
export const CURSOR_PROMPT_PARAM_MAX = 7500;
export const CLAUDE_Q_PARAM_MAX = 4800;

export function buildCursorPromptDeeplink(promptText: string, useWeb = false): string {
  const base = useWeb
    ? "https://cursor.com/link/prompt"
    : "cursor://anysphere.cursor-deeplink/prompt";
  const url = new URL(base);
  url.searchParams.set("text", promptText);
  return url.toString();
}

export function buildClaudeCodeDeeplink(promptText: string, cwd?: string): string {
  const url = new URL("claude-cli://open");
  url.searchParams.set("q", promptText);
  if (cwd?.trim()) url.searchParams.set("cwd", cwd.trim());
  return url.toString();
}

export function truncatePromptForDeeplink(full: string, maxChars: number, suffix: string): string {
  if (full.length <= maxChars) return full;
  const room = Math.max(80, maxChars - suffix.length - 1);
  return `${full.slice(0, room).trimEnd()}\n\n${suffix}`;
}
