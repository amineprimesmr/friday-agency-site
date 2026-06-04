/** Drapeaux pour codes ISO-2 (ST `top_countries` / `valid_countries`). */
const ISO_FLAG: Record<string, string> = {
  US: "🇺🇸",
  FR: "🇫🇷",
  GB: "🇬🇧",
  UK: "🇬🇧",
  DE: "🇩🇪",
  JP: "🇯🇵",
  BR: "🇧🇷",
  CA: "🇨🇦",
  AU: "🇦🇺",
  IT: "🇮🇹",
  ES: "🇪🇸",
  MX: "🇲🇽",
  IN: "🇮🇳",
  KR: "🇰🇷",
  CN: "🇨🇳",
  RU: "🇷🇺",
  NL: "🇳🇱",
  SE: "🇸🇪",
  CH: "🇨🇭",
  PL: "🇵🇱",
  TR: "🇹🇷",
  SA: "🇸🇦",
  AE: "🇦🇪",
  SG: "🇸🇬",
  HK: "🇭🇰",
  TW: "🇹🇼",
  ID: "🇮🇩",
  TH: "🇹🇭",
  VN: "🇻🇳",
  PH: "🇵🇭",
  MY: "🇲🇾",
  NZ: "🇳🇿",
  NO: "🇳🇴",
  DK: "🇩🇰",
  FI: "🇫🇮",
  AT: "🇦🇹",
  BE: "🇧🇪",
  PT: "🇵🇹",
  IE: "🇮🇪",
  IL: "🇮🇱",
  ZA: "🇿🇦",
  AR: "🇦🇷",
  CL: "🇨🇱",
  CO: "🇨🇴",
  LU: "🇱🇺",
};

export function isoCountryFlag(code: string): string {
  const c = String(code).toUpperCase();
  return ISO_FLAG[c] ?? "🌐";
}

export function isoCountryLabel(code: string): string {
  return String(code).toUpperCase();
}
