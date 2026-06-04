import { TaConnexionFlow } from "@/components/trackapp/auth/trackapp-connexion-flow";
import { TrackappDevSaasBypassButton } from "@/components/trackapp/trackapp-dev-saas-bypass";
import { TRACKAPP_WORKSPACE_HUB_PATH } from "@/lib/trackapp-apptracker-paths";

function safeNext(raw: string | string[] | undefined): string {
  const v = typeof raw === "string" ? raw : Array.isArray(raw) ? raw[0] : null;
  if (!v || v.length === 0) return TRACKAPP_WORKSPACE_HUB_PATH;
  try {
    const path = decodeURIComponent(v.startsWith("/") ? v : `/${v}`).split("#")[0];
    if (path.startsWith("/trackapp/")) return path;
    return TRACKAPP_WORKSPACE_HUB_PATH;
  } catch {
    return TRACKAPP_WORKSPACE_HUB_PATH;
  }
}

export default async function ConnexionPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const qs = await searchParams;
  const nextHref = safeNext(qs.next);

  return (
    <div className="ta-font min-h-dvh bg-neutral-950 antialiased">
      <TaConnexionFlow nextHref={nextHref} />
      <footer className="ta-auth-page-footer flex justify-center">
        <TrackappDevSaasBypassButton />
      </footer>
    </div>
  );
}
