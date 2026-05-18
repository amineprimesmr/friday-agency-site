import { readFile } from "fs/promises";
import path from "path";
import { NextResponse } from "next/server";

export const dynamic = "force-static";

export async function GET() {
  const filePath = path.join(process.cwd(), "public", "trackapp-app-stats-signed.shortcut");
  const file = await readFile(filePath);

  return new NextResponse(file, {
    headers: {
      // MIME type reconnu par iOS pour ouvrir automatiquement dans l'app Raccourcis
      "Content-Type": "application/x-shortcuts",
      "Content-Disposition": 'attachment; filename="App-Stats-Trackapp.shortcut"',
      "Content-Length": String(file.length),
    },
  });
}
