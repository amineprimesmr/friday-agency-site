/** Rejette les Page ID Meta inventés par l’IA (ex. 1234567890). */
export function isPlausibleMetaPageId(raw: string | null | undefined): boolean {
  const id = (raw ?? "").trim();
  if (!/^\d{8,24}$/.test(id)) return false;
  if (/^(\d)\1+$/.test(id)) return false;

  const blocked = new Set([
    "1234567890",
    "123456789",
    "0123456789",
    "9876543210",
    "11111111",
    "00000000",
  ]);
  if (blocked.has(id)) return false;

  let ascending = true;
  for (let i = 1; i < id.length; i += 1) {
    const prev = Number(id[i - 1]);
    const cur = Number(id[i]);
    if (cur !== (prev + 1) % 10) {
      ascending = false;
      break;
    }
  }
  if (ascending && id.length >= 8) return false;

  return true;
}
