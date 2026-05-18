export function formatMetaDate(iso?: string) {
  if (!iso) return "—";
  try {
    return new Date(iso).toLocaleDateString("fr-FR", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  } catch {
    return "—";
  }
}

export function labelMetaPlatform(platform: string) {
  const normalized = platform.toLowerCase();
  if (normalized === "facebook") return "Facebook";
  if (normalized === "instagram") return "Instagram";
  if (normalized === "messenger") return "Messenger";
  if (normalized === "audience_network") return "Audience Network";
  if (normalized === "threads") return "Threads";
  return platform;
}

export function excerptMetaBodies(bodies?: string[], max = 220) {
  if (!bodies?.length) return "";
  const text = bodies.filter(Boolean).join(" · ");
  if (text.length <= max) return text;
  return `${text.slice(0, max)}…`;
}
