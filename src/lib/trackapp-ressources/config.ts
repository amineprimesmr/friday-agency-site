import { existsSync } from "node:fs";
import path from "node:path";

/**
 * Répertoire des médias : env explicite, puis dossier public du projet,
 * puis ~/Desktop/Ressources sur macOS si présent.
 */
export function resolveResourcesDir(): string | null {
  const fromEnv = process.env.TRACKAPP_RESOURCES_DIR?.trim();
  if (fromEnv && existsSync(fromEnv)) return path.resolve(fromEnv);

  const pub = path.join(process.cwd(), "public/trackapp-ressources");
  if (existsSync(pub)) return pub;

  const projectRessources = path.join(process.cwd(), "Ressources");
  if (existsSync(projectRessources)) return projectRessources;

  const projectRessourcesLower = path.join(process.cwd(), "ressources");
  if (existsSync(projectRessourcesLower)) return projectRessourcesLower;

  const home = process.env.HOME ?? process.env.USERPROFILE;
  if (home && process.platform === "darwin") {
    const desk = path.join(home, "Desktop/Ressources");
    if (existsSync(desk)) return desk;
  }

  return null;
}
