import type { CountryCode, SearchResult } from "@/lib/apple-charts";

export type TrackappSearchHistoryEntry = Readonly<{
  id: string;
  name: string;
  artistName: string;
  artworkUrl: string;
  category: string;
  country: CountryCode;
  viewedAt: number;
}>;

const STORAGE_KEY = "trackapp:accueil-app-history:v1";
const MAX_ENTRIES = 5;

function isBrowser(): boolean {
  return typeof window !== "undefined";
}

export function readTrackappSearchHistory(): TrackappSearchHistoryEntry[] {
  if (!isBrowser()) return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed
      .filter((row): row is TrackappSearchHistoryEntry => {
        if (!row || typeof row !== "object") return false;
        const o = row as Record<string, unknown>;
        return (
          typeof o.id === "string" &&
          typeof o.name === "string" &&
          typeof o.artistName === "string" &&
          typeof o.artworkUrl === "string" &&
          typeof o.category === "string" &&
          typeof o.country === "string" &&
          typeof o.viewedAt === "number"
        );
      })
      .slice(0, MAX_ENTRIES);
  } catch {
    return [];
  }
}

export function writeTrackappSearchHistory(entries: readonly TrackappSearchHistoryEntry[]): void {
  if (!isBrowser()) return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(entries.slice(0, MAX_ENTRIES)));
  } catch {
    // quota / mode privé
  }
}

export function pushTrackappSearchHistoryApp(
  app: Pick<SearchResult, "id" | "name" | "artistName" | "artworkUrl" | "category">,
  country: CountryCode,
): TrackappSearchHistoryEntry[] {
  const entry: TrackappSearchHistoryEntry = {
    id: app.id,
    name: app.name,
    artistName: app.artistName,
    artworkUrl: app.artworkUrl,
    category: app.category,
    country,
    viewedAt: Date.now(),
  };

  const prev = readTrackappSearchHistory().filter(
    (row) => !(row.id === entry.id && row.country === entry.country),
  );
  const next = [entry, ...prev].slice(0, MAX_ENTRIES);
  writeTrackappSearchHistory(next);
  return next;
}

export function clearTrackappSearchHistory(): void {
  if (!isBrowser()) return;
  try {
    window.localStorage.removeItem(STORAGE_KEY);
  } catch {
    // ignore
  }
}
