import { redirect } from "next/navigation";

/** Hub favoris → liste apps par défaut. */
export default function TrackappFavorisIndexPage() {
  redirect("/trackapp/favoris/apps");
}
