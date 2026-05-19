import Link from "next/link";

import { TrackappOfficialPresencePanel } from "@/components/trackapp/trackapp-official-presence-panel";
import { buildOfficialBrandPresenceContext } from "@/lib/official-brand-presence";
import { isOfficialLinksOpenAiConfigured } from "@/lib/official-brand-links";
import type { AppDetail } from "@/lib/apple-charts";
import type { CountryCode } from "@/lib/apple-charts";

export async function TrackappOfficialPresenceSection({
  app,
  country,
}: {
  app: AppDetail;
  country: CountryCode;
}) {
  const presence = await buildOfficialBrandPresenceContext(app);
  const openAiConfigured = isOfficialLinksOpenAiConfigured();

  return (
    <section className="mt-5">
      <div className="mb-4 flex justify-end">
        <Link
          href={`/tracker/apps/${app.id}?country=${country}&tab=official`}
          className="inline-flex min-h-10 items-center justify-center rounded-full border border-slate-200 bg-white px-4 text-[0.85rem] font-bold text-slate-700 no-underline shadow-sm transition hover:border-slate-300"
        >
          Vue Tracker complète →
        </Link>
      </div>
      <TrackappOfficialPresencePanel
        appName={app.name}
        officialLinks={presence.officialLinks}
        profiles={presence.socialProfiles}
        confidence={presence.confidence}
        openAiEnriched={presence.openAiEnriched}
        openAiConfigured={openAiConfigured}
        sources={presence.sources}
      />
    </section>
  );
}
