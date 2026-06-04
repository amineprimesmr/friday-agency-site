/** Prénom affiché dérivé de l’email (sidebar, AppLAB). */
export function displayNameFromEmail(email: string | undefined): string {
  if (!email) return "Créateur";
  const local = email.split("@")[0] ?? "";
  const chunk = local.split(/[._-]+/).find(Boolean) ?? local;
  return chunk.charAt(0).toUpperCase() + chunk.slice(1);
}
