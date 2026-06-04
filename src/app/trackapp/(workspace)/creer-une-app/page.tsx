import { redirect } from "next/navigation";

import { TRACKAPP_LANDING_PATH } from "@/lib/trackapp-landing-paths";

type PageProps = Readonly<{
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}>;

/** Alias legacy → URL canonique `/trackapp`. */
export default async function TrackappCreerUneAppLegacyRedirect({ searchParams }: PageProps) {
  const sp = await searchParams;
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(sp)) {
    if (value === undefined) continue;
    if (Array.isArray(value)) value.forEach((v) => params.append(key, v));
    else params.set(key, value);
  }
  const qs = params.toString();
  redirect(qs ? `${TRACKAPP_LANDING_PATH}?${qs}` : TRACKAPP_LANDING_PATH);
}
